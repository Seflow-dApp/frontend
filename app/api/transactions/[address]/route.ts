import { NextRequest, NextResponse } from 'next/server';

// Transaction history interface (matches frontend)
interface TransactionHistory {
    id: string;
    type: 'salary_split' | 'compound' | 'transfer';
    amount: number;
    details: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: string;
    txId?: string;
}

// FindLabs API response types
interface FindLabsTag {
    id: string;
    name: string;
    type: string;
    logo?: string;
}

interface FindLabsEvent {
    id?: string;
    name: string;
    type?: string;
    fields?: string | Record<string, unknown>;
    timestamp?: string;
    event_index?: number;
    block_height?: number;
}

interface FindLabsTransaction {
    id: string;
    status: string;
    timestamp: string;
    error?: string;
    error_code?: string;
    transaction_body_hash?: string;
    tags?: FindLabsTag[];
    events?: FindLabsEvent[];
    fee?: number;
    gas_used?: number;
    payer?: string;
    proposer?: string;
    authorizers?: string[];
    contract_imports?: string[];
    contract_outputs?: string[];
}

// Flow Access Node types
interface FlowEvent {
    type: string;
    data?: Record<string, unknown>;
}

interface FlowTransactionResult {
    status: number;
    block_timestamp: string;
    events?: FlowEvent[];
}

interface FlowTransaction {
    id: string;
    result?: FlowTransactionResult;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ address: string }> }
) {
    try {
        const { address } = await params;

        // Validate address format
        if (!address || (!address.startsWith('0x') && address.length !== 16)) {
            return NextResponse.json(
                { error: 'Invalid Flow address format' },
                { status: 400 }
            );
        }

        console.log(`🔍 [API] Fetching transactions for address: ${address}`);

        // Get FindLabs credentials from server environment
        const FINDLABS_BASE = (process.env.FINDLABS_BASE || "https://api.test-find.xyz").replace(/\/$/, "");
        const FINDLABS_USER = process.env.FINDLABS_USER;
        const FINDLABS_PASS = process.env.FINDLABS_PASS;

        let transactions: TransactionHistory[] = [];
        let usedFindLabs = false;

        // Try FindLabs with JWT authentication (server-side credentials)
        if (FINDLABS_USER && FINDLABS_PASS) {
            try {
                console.log(`🔐 [API] Generating JWT token for FindLabs...`);

                // Step 1: Generate JWT token using Basic Auth
                const credentials = Buffer.from(`${FINDLABS_USER}:${FINDLABS_PASS}`).toString('base64');
                const authResponse = await fetch(`${FINDLABS_BASE}/auth/v1/generate?expiry=1h`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Accept': 'application/json',
                    }
                });

                if (!authResponse.ok) {
                    console.warn(`❌ [API] JWT generation failed: ${authResponse.status}`);
                    throw new Error(`JWT generation failed: ${authResponse.status}`);
                }

                const authData = await authResponse.json();
                const jwtToken = authData.access_token;

                if (!jwtToken) {
                    throw new Error('No access token received from FindLabs auth');
                }

                console.log(`✅ [API] JWT token generated successfully`);

                // Step 2: Fetch transactions using JWT Bearer token
                console.log(`🌐 [API] Fetching transactions from FindLabs...`);
                const txUrl = `${FINDLABS_BASE}/flow/v1/account/${address}/transaction?limit=50&include_events=true`;
                const txResponse = await fetch(txUrl, {
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`,
                        'Accept': 'application/json',
                    }
                });

                if (txResponse.ok) {
                    usedFindLabs = true;
                    const txData = await txResponse.json();
                    const items = Array.isArray(txData.data) ? txData.data : [];

                    console.log(`📄 [API] FindLabs returned ${items.length} transactions`);

                    // Parse FindLabs response format
                    transactions = items
                        .slice(0, 50)
                        .map((tx: FindLabsTransaction, i: number) => {
                            const status = tx.status?.toLowerCase() === 'sealed' ? 'success' :
                                tx.error ? 'failed' : 'success';
                            const timestamp = tx.timestamp || new Date().toISOString();

                            // Extract transaction details
                            let amount = 0;
                            let type: TransactionHistory['type'] = 'transfer';
                            let details = tx.tags?.map((t) => t.name).join(', ') || 'Flow transaction';

                            // Parse events for more details
                            const events = tx.events || [];
                            if (Array.isArray(events)) {
                                // Look for FLOW token events
                                const ftEvents = events.filter((e) =>
                                    (e.name || '').includes('FlowToken') ||
                                    (e.type || '').includes('FlowToken')
                                );

                                if (ftEvents.length > 0) {
                                    const withdrawEvent = ftEvents.find((e) =>
                                        (e.name || '').includes('TokensWithdrawn') ||
                                        (e.type || '').includes('TokensWithdrawn')
                                    );

                                    if (withdrawEvent) {
                                        // Try different field formats for amount
                                        let amountField: unknown = null;
                                        if (withdrawEvent.fields) {
                                            if (typeof withdrawEvent.fields === 'string') {
                                                try {
                                                    const parsed = JSON.parse(withdrawEvent.fields) as Record<string, unknown>;
                                                    amountField = parsed.amount;
                                                } catch {
                                                    // Ignore parse errors
                                                }
                                            } else if (typeof withdrawEvent.fields === 'object' && withdrawEvent.fields !== null) {
                                                amountField = (withdrawEvent.fields as Record<string, unknown>).amount;
                                            }
                                        }

                                        if (amountField && (typeof amountField === 'string' || typeof amountField === 'number')) {
                                            amount = Number(amountField);
                                            details = `FLOW Transfer (${amount.toFixed(2)} FLOW)`;
                                        }
                                    }
                                }

                                // Check for Seflow contract interactions
                                const seflowEvent = events.find((e) =>
                                    (e.name || '').includes('0x7d7f281847222367') ||
                                    (e.type || '').includes('0x7d7f281847222367')
                                );

                                if (seflowEvent) {
                                    type = 'salary_split';
                                    details = 'Seflow Salary Split';
                                }
                            } return {
                                id: tx.id || tx.transaction_body_hash || `tx-${i}`,
                                type,
                                amount: Number(amount) || 0,
                                details: details || 'Flow transaction',
                                status: status as 'success' | 'failed' | 'pending',
                                timestamp: new Date(timestamp).toISOString(),
                                txId: tx.id || tx.transaction_body_hash
                            } as TransactionHistory;
                        });

                } else {
                    console.warn(`❌ [API] FindLabs transactions request failed: ${txResponse.status}`);
                    const errorText = await txResponse.text();
                    console.warn(`Error details: ${errorText}`);
                }

            } catch (findlabsError) {
                console.warn(`❌ [API] FindLabs error:`, findlabsError);
            }
        } else {
            console.log(`📝 [API] No FindLabs credentials configured, skipping JWT flow`);
        }

        // Fallback to Flow Access Node if FindLabs failed or not configured
        if (!usedFindLabs || transactions.length === 0) {
            console.log(`🔄 [API] Falling back to Flow Access Node...`);

            try {
                const accessNodeUrl = `https://rest-testnet.onflow.org/v1/accounts/${address}/transactions?limit=50&order=desc`;
                const response = await fetch(accessNodeUrl, {
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(`📄 [API] Access Node returned ${data.length} transactions`);

                    transactions = (data as FlowTransaction[])
                        .filter((tx) => tx.result?.status === 0)
                        .slice(0, 20)
                        .map((tx, index: number) => {
                            const timestamp = new Date(tx.result?.block_timestamp || Date.now()).toISOString();

                            let type: TransactionHistory['type'] = 'transfer';
                            let details = 'Flow transaction';
                            let amount = 0;

                            // Parse Flow Access Node event format
                            if (tx.result?.events) {
                                const flowEvents = tx.result.events.filter((event) =>
                                    event.type.includes('FlowToken.TokensWithdrawn') ||
                                    event.type.includes('FlowToken.TokensDeposited')
                                );

                                if (flowEvents.length > 0) {
                                    const withdrawEvent = flowEvents.find((e) =>
                                        e.type.includes('TokensWithdrawn')
                                    );
                                    if (withdrawEvent?.data?.amount && typeof withdrawEvent.data.amount === 'string') {
                                        amount = parseFloat(withdrawEvent.data.amount);
                                        details = `FLOW Token Transfer (${amount.toFixed(2)} FLOW)`;
                                    }
                                }

                                const seflowEvents = tx.result.events.filter((event) =>
                                    event.type.includes('0x7d7f281847222367')
                                );

                                if (seflowEvents.length > 0) {
                                    type = 'salary_split';
                                    details = `Seflow Salary Split Transaction`;
                                }
                            }

                            return {
                                id: tx.id || `tx-${index}`,
                                type,
                                amount,
                                details,
                                status: 'success' as const,
                                timestamp,
                                txId: tx.id
                            } as TransactionHistory;
                        });
                } else {
                    console.error(`❌ [API] Access Node request failed: ${response.status}`);
                    throw new Error(`Access Node API error: ${response.status}`);
                }
            } catch (accessNodeError) {
                console.error(`❌ [API] Access Node error:`, accessNodeError);
                throw accessNodeError;
            }
        }

        console.log(`✅ [API] Returning ${transactions.length} transactions`);

        return NextResponse.json({
            success: true,
            data: transactions,
            meta: {
                address,
                count: transactions.length,
                source: usedFindLabs ? 'findlabs' : 'access-node',
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error(`❌ [API] Transaction fetch error:`, error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch transactions',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}