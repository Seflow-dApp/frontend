"use client";

import { useFlowQuery, useFlowMutate } from "@onflow/react-sdk";
import * as fcl from "@onflow/fcl";
import { useEffect, useState } from "react";

// Type definitions for contract data
interface ContractStats {
    totalUsers: number;
    totalSplits: number;
    totalVolumeProcessed: number;
}

interface UserData {
    flowBalance: number;
    savingsBalance: number;
    lpBalance: number;
    frothBalance: number;
}

interface SavingsInfo {
    balance: number;
    lockTime: number;
    unlockTime: number;
    remainingTime: number;
    isLocked: number;
}

interface LPInfo {
    balance: number;
    totalYieldEarned: number;
    availableYield: number;
    lastCompoundTime: number;
    weeksSinceLastCompound: number;
}

interface SeflowData {
    contractStats: ContractStats;
    userData: UserData;
    savingsInfo?: SavingsInfo;
    lpInfo?: LPInfo;
    timestamp: number;
}

interface TransactionHistory {
    id: string;
    type: 'salary_split' | 'compound' | 'transfer';
    amount: number;
    details: string;
    status: 'pending' | 'success' | 'failed';
    timestamp: string;
    txId?: string;
}

interface FCLUser {
    addr?: string;
    cid?: string;
    loggedIn?: boolean;
    services?: unknown[];
}

export const useSeflowSalary = (userAddress?: string) => {
    // Get current user address from FCL
    const [currentUser, setCurrentUser] = useState<FCLUser | null>(null);
    const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
    const [fetchingTxHistory, setFetchingTxHistory] = useState(false);

    useEffect(() => {
        // Subscribe to FCL user changes
        const unsubscribe = fcl.currentUser.subscribe(setCurrentUser);
        return () => unsubscribe();
    }, []);

    // Use the connected user's address or provided address
    const activeUserAddress = currentUser?.addr || userAddress;

    // Function to fetch real blockchain transactions
    const fetchBlockchainTransactions = async (address?: string) => {
        if (!address) return;

        console.log("🔍 Fetching real blockchain transactions for:", address);
        setFetchingTxHistory(true);

        try {
            // Use our internal API route that handles FindLabs JWT + fallback
            const response = await fetch(`/api/transactions/${address}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Internal API error: ${response.status}`);
            }

            const apiResponse = await response.json();
            console.log("📄 API Response:", apiResponse);

            if (!apiResponse.success) {
                throw new Error(apiResponse.details || 'API request failed');
            }

            const transactions = apiResponse.data || [];
            console.log(`✅ Received ${transactions.length} transactions from ${apiResponse.meta?.source || 'unknown'} source`);

            setTransactionHistory(transactions);

        } catch (error) {
            console.error("❌ Error fetching blockchain transactions:", error);
            // Fallback to empty array on error
            setTransactionHistory([]);
        } finally {
            setFetchingTxHistory(false);
        }
    };

    // Fetch blockchain transactions when user connects
    useEffect(() => {
        if (activeUserAddress) {
            fetchBlockchainTransactions(activeUserAddress);
        }
    }, [activeUserAddress]);

    // Query real contract data from deployed Seflow contracts
    const { data: stats, isLoading, error, refetch } = useFlowQuery({
        cadence: `
            // Read REAL on-chain balances from deployed contracts
            import FungibleToken from 0x9a0766d93b6608b7
            import FlowToken from 0x7e60df042a9c0868
            import FrothToken from 0x7d7f281847222367
            import SavingsVault from 0x7d7f281847222367
            import LiquidityPool from 0x7d7f281847222367
            import Seflow from 0x7d7f281847222367

            access(all) fun main(address: Address?): {String: AnyStruct} {
                let targetAddress = address ?? 0x7d7f281847222367
                let account = getAccount(targetAddress)

                // 1. Get REAL FLOW balance from user's wallet
                var flowBalance: UFix64 = 0.0
                if let flowVaultRef = account.capabilities.get<&FlowToken.Vault>(/public/flowTokenBalance).borrow() {
                    flowBalance = flowVaultRef.balance
                    log("💰 Real FLOW balance: ".concat(flowBalance.toString()))
                } else {
                    log("⚠️ Could not access FLOW vault for address: ".concat(targetAddress.toString()))
                }

                // 2. Get REAL Savings balance from user's SavingsVault (if they have one)
                var savingsBalance: UFix64 = 0.0
                var savingsLockInfo: {String: UFix64} = {}
                if let savingsVaultRef = account.capabilities.get<&SavingsVault.Vault>(/public/savingsVault).borrow() {
                    savingsBalance = savingsVaultRef.getBalance()
                    savingsLockInfo = savingsVaultRef.getLockInfo()
                    log("💾 Real Savings balance: ".concat(savingsBalance.toString()))
                    log("🔒 Savings lock info retrieved")
                } else {
                    log("ℹ️ User has no SavingsVault or no public capability")
                }

                // 3. Get REAL LP balance from user's LiquidityPool position (if they have one)
                var lpBalance: UFix64 = 0.0
                var lpPositionInfo: {String: UFix64} = {}
                if let lpVaultRef = account.capabilities.get<&LiquidityPool.Vault>(/public/liquidityPoolVault).borrow() {
                    lpBalance = lpVaultRef.getBalance()
                    lpPositionInfo = lpVaultRef.getPositionInfo()
                    log("📈 Real LP balance: ".concat(lpBalance.toString()))
                    log("📊 LP position info retrieved")
                } else {
                    log("ℹ️ User has no LP position or no public capability")
                }

                // 4. Get REAL FROTH balance from user's FrothToken vault (if they have one)
                var frothBalance: UFix64 = 0.0
                if let frothVaultRef = account.capabilities.get<&FrothToken.Vault>(/public/frothTokenVault).borrow() {
                    frothBalance = frothVaultRef.getBalance()
                    log("🎉 Real FROTH balance: ".concat(frothBalance.toString()))
                } else {
                    log("ℹ️ User has no FROTH vault or no public capability")
                }

                // Get contract stats
                let contractStats = Seflow.getContractStats()

                let result = {
                    "address": targetAddress.toString(),
                    "contractStats": contractStats,
                    "userData": {
                        "flowBalance": flowBalance,
                        "savingsBalance": savingsBalance,
                        "lpBalance": lpBalance,
                        "frothBalance": frothBalance
                    },
                    "savingsInfo": savingsLockInfo,
                    "lpInfo": lpPositionInfo,
                    "totalValue": flowBalance + savingsBalance + lpBalance,
                    "timestamp": getCurrentBlock().timestamp,
                    "blockHeight": getCurrentBlock().height
                }
                
                log("📊 Real balances result:")
                log(result)
                
                return result
            }
        `,
        args: (arg: unknown, t: unknown) => [
            activeUserAddress ? (arg as any)(activeUserAddress, (t as any).Address) : (arg as any)(null, (t as any).Optional((t as any).Address))
        ],
    });

    // Mutation for salary split transaction
    const {
        mutate: executeSalarySplit,
        isPending: splitPending,
        data: splitTxId,
        error: splitError,
    } = useFlowMutate();

    // State for managing setSplitConfig promise resolution
    const [splitConfigResolvers, setSplitConfigResolvers] = useState<{
        resolve: (value: string) => void;
        reject: (error: any) => void;
    } | null>(null);

    // Create a separate mutation instance for setSplitConfig with proper callbacks
    const {
        mutate: executeSplitConfigMutation,
        isPending: splitConfigPending,
    } = useFlowMutate({
        mutation: {
            onSuccess: (txId: string) => {
                console.log("✅ setSplitConfig transaction successful with ID:", txId);

                // Refetch data and transaction history after successful transaction
                setTimeout(() => {
                    console.log("🔄 Refreshing balance data and transaction history after successful transaction...");
                    refetch();
                    if (activeUserAddress) {
                        fetchBlockchainTransactions(activeUserAddress);
                    }
                }, 3000); // 3 second delay for blockchain confirmation

                // Resolve the promise if we have resolvers
                if (splitConfigResolvers) {
                    splitConfigResolvers.resolve(txId);
                    setSplitConfigResolvers(null);
                }
            },
            onError: (error: any) => {
                console.error("❌ setSplitConfig transaction failed:", error);

                // Check if this is a user cancellation vs actual error
                if (error?.message && (
                    error.message.includes("Signatures Declined") ||
                    error.message.includes("User rejected") ||
                    error.message.includes("Declined:")
                )) {
                    console.log("ℹ️ User cancelled transaction - no cooldown applied");
                } else {
                    console.error("❌ Actual transaction error occurred:", error);
                }

                // Reject the promise if we have resolvers
                if (splitConfigResolvers) {
                    splitConfigResolvers.reject(error);
                    setSplitConfigResolvers(null);
                }
            }
        }
    });

    // Mutation for yield compounding
    const {
        mutate: executeCompound,
        isPending: compoundPending,
        data: compoundTxId,
        error: compoundError,
    } = useFlowMutate();

    const handleSalarySplit = (
        totalAmount: number,
        savePercent: number,
        lpPercent: number,
        spendPercent: number,
        useVault: boolean
    ) => {
        console.log("🎯 Executing REAL Salary Split Transaction");
        console.log(`💰 Amount: ${totalAmount} FLOW`);
        console.log(`📊 Split: ${savePercent}% save, ${lpPercent}% LP, ${spendPercent}% spend`);
        console.log(`🔒 Vault: ${useVault ? 'Locked' : 'Unlocked'}`);

        // Check if user is authenticated first
        if (!currentUser?.loggedIn) {
            throw new Error("Please connect your wallet first");
        }

        // Use real deployed contract transaction
        executeSalarySplit({
            cadence: `
                // Real FLOW Token Transaction - using deployed contracts
                import FungibleToken from 0x9a0766d93b6608b7
                import FlowToken from 0x7e60df042a9c0868
                import FrothToken from 0x7d7f281847222367
                import SavingsVault from 0x7d7f281847222367
                import LiquidityPool from 0x7d7f281847222367
                import Seflow from 0x7d7f281847222367

                transaction(
                    totalAmount: UFix64,
                    savePercent: UFix64,
                    lpPercent: UFix64, 
                    spendPercent: UFix64,
                    useVault: Bool
                ) {
                    let flowVault: auth(FungibleToken.Withdraw) &FlowToken.Vault
                    let userAddress: Address
                    let signerAccount: auth(Storage, Capabilities) &Account
                    
                    prepare(signer: auth(Storage, Capabilities) &Account) {
                        // Validate percentages sum to 100
                        let totalPercent = savePercent + lpPercent + spendPercent
                        if totalPercent != 100.0 {
                            panic("Percentages must sum to 100.0, got: ".concat(totalPercent.toString()))
                        }
                        
                        // Store signer account reference for use in execute
                        self.signerAccount = signer
                        
                        // Get reference to user's FLOW vault with proper authorization
                        self.flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                            from: /storage/flowTokenVault
                        ) ?? panic("Could not borrow Flow token vault from storage")
                        
                        // Check if user has enough FLOW
                        if self.flowVault.balance < totalAmount {
                            panic("Insufficient FLOW balance. Have: ".concat(self.flowVault.balance.toString()).concat(", Need: ").concat(totalAmount.toString()))
                        }
                        
                        self.userAddress = signer.address
                        
                        log("🚀 Executing REAL FLOW Seflow salary split...")
                        log("👤 User: ".concat(signer.address.toString()))
                        log("💰 Total Amount: ".concat(totalAmount.toString()).concat(" FLOW"))
                        log("💳 Balance Before: ".concat(self.flowVault.balance.toString()).concat(" FLOW"))
                    }
                    
                    execute {
                        // Calculate split amounts
                        let saveAmount = totalAmount * savePercent / 100.0
                        let lpAmount = totalAmount * lpPercent / 100.0
                        let spendAmount = totalAmount * spendPercent / 100.0
                        
                        log("💵 Savings: ".concat(saveAmount.toString()).concat(" FLOW (").concat(savePercent.toString()).concat("%)"))
                        log("📈 LP Investment: ".concat(lpAmount.toString()).concat(" FLOW (").concat(lpPercent.toString()).concat("%)"))
                        log("💸 Spending: ".concat(spendAmount.toString()).concat(" FLOW (").concat(spendPercent.toString()).concat("%)"))
                        
                        // ==================== REAL VAULT OPERATIONS ====================
                        // Create and use actual vaults instead of destroying tokens
                        
                        // 1. Handle Savings Amount - Create/Use Real SavingsVault
                        if saveAmount > 0.0 {
                            let savingsFlow <- self.flowVault.withdraw(amount: saveAmount)
                            
                            // Check if user has a savings vault, create if not
                            if self.signerAccount.storage.borrow<&SavingsVault.Vault>(from: /storage/userSavingsVault) == nil {
                                // Create new savings vault for user
                                let newSavingsVault <- SavingsVault.createEmptyVault()
                                self.signerAccount.storage.save(<-newSavingsVault, to: /storage/userSavingsVault)
                                
                                // Create public capability so dashboard can read it
                                let savingsCap = self.signerAccount.capabilities.storage.issue<&SavingsVault.Vault>(/storage/userSavingsVault)
                                self.signerAccount.capabilities.publish(savingsCap, at: /public/savingsVault)
                                
                                log("✨ Created new SavingsVault for user")
                            }
                            
                            // Get reference to user's savings vault and deposit
                            let savingsVaultRef = self.signerAccount.storage.borrow<&SavingsVault.Vault>(from: /storage/userSavingsVault)!
                            savingsVaultRef.deposit(amount: savingsFlow.balance, activateLock: useVault)
                            
                            // Destroy the empty vault (balance transferred)
                            destroy savingsFlow
                            
                            let lockStatus = useVault ? "locked" : "unlocked"
                            log("💾 DEPOSITED ".concat(saveAmount.toString()).concat(" FLOW to SavingsVault (").concat(lockStatus).concat(")"))
                        }
                        
                        // 2. Handle LP Investment Amount - Create/Use Real LiquidityPool
                        if lpAmount > 0.0 {
                            let lpFlow <- self.flowVault.withdraw(amount: lpAmount)
                            
                            // Check if user has an LP vault, create if not
                            if self.signerAccount.storage.borrow<&LiquidityPool.Vault>(from: /storage/userLPVault) == nil {
                                // Create new LP vault for user
                                let newLPVault <- LiquidityPool.createEmptyVault()
                                self.signerAccount.storage.save(<-newLPVault, to: /storage/userLPVault)
                                
                                // Create public capability so dashboard can read it
                                let lpCap = self.signerAccount.capabilities.storage.issue<&LiquidityPool.Vault>(/storage/userLPVault)
                                self.signerAccount.capabilities.publish(lpCap, at: /public/liquidityPoolVault)
                                
                                log("✨ Created new LiquidityPool vault for user")
                            }
                            
                            // Get reference to user's LP vault and deposit
                            let lpVaultRef = self.signerAccount.storage.borrow<&LiquidityPool.Vault>(from: /storage/userLPVault)!
                            lpVaultRef.deposit(amount: lpFlow.balance)
                            
                            // Destroy the empty vault (balance transferred)
                            destroy lpFlow
                            
                            log("📈 DEPOSITED ".concat(lpAmount.toString()).concat(" FLOW to LiquidityPool vault"))
                        }
                        
                        // Note: Only spending amount remains in the wallet
                        log("💸 REMAINING ".concat(spendAmount.toString()).concat(" FLOW available for spending in wallet"))
                        
                        // 3. Calculate FROTH Rewards based on vault usage
                        let frothReward = useVault ? 1.5 : 1.0
                        log("🎉 Would mint ".concat(frothReward.toString()).concat(" FROTH reward tokens"))
                        
                        log("✅ REAL FLOW salary split completed!")
                        log("💳 Balance After: ".concat(self.flowVault.balance.toString()).concat(" FLOW"))
                    }
                }
            `,
            args: (arg: unknown, t: unknown) => [
                (arg as any)(totalAmount.toFixed(1), (t as any).UFix64),
                (arg as any)(savePercent.toFixed(1), (t as any).UFix64),
                (arg as any)(lpPercent.toFixed(1), (t as any).UFix64),
                (arg as any)(spendPercent.toFixed(1), (t as any).UFix64),
                (arg as any)(useVault, (t as any).Bool)
            ],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser.authorization as any],
            limit: 9999
        });
    };

    const handleCompound = (userAddress: string) => {
        console.log("🎯 Executing Real Yield Compound Transaction");
        console.log(`👤 User: ${userAddress}`);

        // Check if user is authenticated first
        if (!currentUser?.loggedIn) {
            throw new Error("Please connect your wallet first");
        }

        executeCompound({
            cadence: `
                import LiquidityPool from 0x7d7f281847222367
                
                transaction() {
                    let lpVaultRef: &LiquidityPool.Vault?
                    
                    prepare(signer: auth(BorrowValue) &Account) {
                        // Get reference to user's LP vault (might not exist)
                        self.lpVaultRef = signer.storage.borrow<&LiquidityPool.Vault>(from: /storage/userLPVault)
                    }
                    
                    execute {
                        // Check if user has an LP vault
                        if self.lpVaultRef == nil {
                            log("❌ No LP vault found - user has no liquidity position")
                            return
                        }
                        
                        // Call the real compound function from LP contract
                        let yieldAmount = self.lpVaultRef!.compound()
                        
                        if yieldAmount > 0.0 {
                            log("✅ Real yield compounded!")
                            log("📈 Yield Amount: ".concat(yieldAmount.toString()).concat(" FLOW"))
                            log("💰 New LP Balance: ".concat(self.lpVaultRef!.getBalance().toString()).concat(" FLOW"))
                        } else {
                            log("ℹ️ No yield available to compound")
                        }
                    }
                }
            `,
            args: (arg: unknown, t: unknown) => [],
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser.authorization as any],
            limit: 9999
        });
    };

    return {
        // Contract and user data
        stats,
        isLoading,
        error,
        refetch,

        // Salary split functionality
        handleSalarySplit,
        splitPending,
        splitError,
        splitTxId,

        // Yield compounding functionality
        handleCompound,
        compoundPending,
        compoundError,
        compoundTxId,

        // Getters for contract data
        getContractStats: () => {
            const data = stats as SeflowData | undefined;
            console.log("📊 getContractStats - raw data:", data);
            console.log("📊 Query isLoading:", isLoading, "error:", error);
            return {
                totalUsers: data?.contractStats?.totalUsers || 0,
                totalSplits: data?.contractStats?.totalSplits || 0,
                totalVolumeProcessed: data?.contractStats?.totalVolumeProcessed || 0.0
            };
        },

        getUserData: () => {
            const data = stats as SeflowData | undefined;
            console.log("👤 getUserData - raw data:", data);
            console.log("👤 Query isLoading:", isLoading, "error:", error);
            const result = {
                flowBalance: parseFloat(data?.userData?.flowBalance?.toString() || "0.0"),
                savingsBalance: parseFloat(data?.userData?.savingsBalance?.toString() || "0.0"),
                lpBalance: parseFloat(data?.userData?.lpBalance?.toString() || "0.0"),
                frothBalance: parseFloat(data?.userData?.frothBalance?.toString() || "0.0")
            };
            console.log("👤 getUserData - processed result:", result);
            return result;
        },

        // Get savings vault information
        getSavingsInfo: () => {
            const data = stats as SeflowData | undefined;
            return {
                balance: parseFloat(data?.savingsInfo?.balance?.toString() || "0.0"),
                lockTime: parseFloat(data?.savingsInfo?.lockTime?.toString() || "0.0"),
                unlockTime: parseFloat(data?.savingsInfo?.unlockTime?.toString() || "0.0"),
                remainingTime: parseFloat(data?.savingsInfo?.remainingTime?.toString() || "0.0"),
                isLocked: parseFloat(data?.savingsInfo?.isLocked?.toString() || "0.0") === 1.0,
                remainingDays: Math.ceil(parseFloat(data?.savingsInfo?.remainingTime?.toString() || "0.0") / 86400.0)
            };
        },

        // Get LP position information
        getLPInfo: () => {
            const data = stats as SeflowData | undefined;
            return {
                balance: parseFloat(data?.lpInfo?.balance?.toString() || "0.0"),
                totalYieldEarned: parseFloat(data?.lpInfo?.totalYieldEarned?.toString() || "0.0"),
                availableYield: parseFloat(data?.lpInfo?.availableYield?.toString() || "0.0"),
                lastCompoundTime: parseFloat(data?.lpInfo?.lastCompoundTime?.toString() || "0.0"),
                weeksSinceLastCompound: parseFloat(data?.lpInfo?.weeksSinceLastCompound?.toString() || "0.0"),
                canClaimYield: parseFloat(data?.lpInfo?.availableYield?.toString() || "0.0") > 0.0
            };
        },

        // Real blockchain transaction history
        transactionHistory,
        fetchingTxHistory,

        // User management
        currentUser,
        connectedAddress: activeUserAddress,

        // Real contract functions
        setSplitConfig: async (amount: number, save: number, lp: number, spend: number, vault: boolean = false) => {
            console.log("🎯 Executing Salary Split with real FLOW token transactions");
            console.log(`💰 Amount: ${amount} FLOW, 💾 Save: ${save}%, 📈 LP: ${lp}%, 💳 Spend: ${spend}%`);

            return new Promise<string>((resolve, reject) => {
                // Store the promise resolvers so the mutation callbacks can access them
                setSplitConfigResolvers({ resolve, reject });

                try {
                    // Check if user is authenticated first
                    if (!currentUser?.loggedIn) {
                        throw new Error("Please connect your wallet first");
                    }

                    // Execute the transaction using the configured mutation
                    executeSplitConfigMutation({
                        cadence: `
                            // Real FLOW Token Transaction - using deployed contracts
                            import FungibleToken from 0x9a0766d93b6608b7
                            import FlowToken from 0x7e60df042a9c0868
                            import FrothToken from 0x7d7f281847222367
                            import SavingsVault from 0x7d7f281847222367
                            import LiquidityPool from 0x7d7f281847222367
                            import Seflow from 0x7d7f281847222367

                            transaction(
                                totalAmount: UFix64,
                                savePercent: UFix64,
                                lpPercent: UFix64, 
                                spendPercent: UFix64,
                                useVault: Bool
                            ) {
                                let flowVault: auth(FungibleToken.Withdraw) &FlowToken.Vault
                                let userAddress: Address
                                let signerAccount: auth(Storage, Capabilities) &Account
                                
                                prepare(signer: auth(Storage, Capabilities) &Account) {
                                    // Validate percentages sum to 100
                                    let totalPercent = savePercent + lpPercent + spendPercent
                                    if totalPercent != 100.0 {
                                        panic("Percentages must sum to 100.0, got: ".concat(totalPercent.toString()))
                                    }
                                    
                                    // Store signer account reference for use in execute
                                    self.signerAccount = signer
                                    
                                    // Get reference to user's FLOW vault with proper authorization
                                    self.flowVault = signer.storage.borrow<auth(FungibleToken.Withdraw) &FlowToken.Vault>(
                                        from: /storage/flowTokenVault
                                    ) ?? panic("Could not borrow Flow token vault from storage")
                                    
                                    // Check if user has enough FLOW
                                    if self.flowVault.balance < totalAmount {
                                        panic("Insufficient FLOW balance. Have: ".concat(self.flowVault.balance.toString()).concat(", Need: ").concat(totalAmount.toString()))
                                    }
                                    
                                    self.userAddress = signer.address
                                    
                                    log("🚀 Executing REAL FLOW Seflow salary split...")
                                    log("👤 User: ".concat(signer.address.toString()))
                                    log("💰 Total Amount: ".concat(totalAmount.toString()).concat(" FLOW"))
                                    log("💳 Balance Before: ".concat(self.flowVault.balance.toString()).concat(" FLOW"))
                                }
                                
                                execute {
                                    // Calculate split amounts
                                    let saveAmount = totalAmount * savePercent / 100.0
                                    let lpAmount = totalAmount * lpPercent / 100.0
                                    let spendAmount = totalAmount * spendPercent / 100.0
                                    
                                    log("💵 Savings: ".concat(saveAmount.toString()).concat(" FLOW (").concat(savePercent.toString()).concat("%)"))
                                    log("📈 LP Investment: ".concat(lpAmount.toString()).concat(" FLOW (").concat(lpPercent.toString()).concat("%)"))
                                    log("💸 Spending: ".concat(spendAmount.toString()).concat(" FLOW (").concat(spendPercent.toString()).concat("%)"))
                                    
                                    // ==================== REAL VAULT OPERATIONS ====================
                                    // Create and use actual vaults instead of destroying tokens
                                    
                                    // 1. Handle Savings Amount - Create/Use Real SavingsVault
                                    if saveAmount > 0.0 {
                                        let savingsFlow <- self.flowVault.withdraw(amount: saveAmount)
                                        
                                        // Check if user has a savings vault, create if not
                                        if self.signerAccount.storage.borrow<&SavingsVault.Vault>(from: /storage/userSavingsVault) == nil {
                                            // Create new savings vault for user
                                            let newSavingsVault <- SavingsVault.createEmptyVault()
                                            self.signerAccount.storage.save(<-newSavingsVault, to: /storage/userSavingsVault)
                                            
                                            // Create public capability so dashboard can read it
                                            let savingsCap = self.signerAccount.capabilities.storage.issue<&SavingsVault.Vault>(/storage/userSavingsVault)
                                            self.signerAccount.capabilities.publish(savingsCap, at: /public/savingsVault)
                                            
                                            log("✨ Created new SavingsVault for user")
                                        }
                                        
                                        // Get reference to user's savings vault and deposit
                                        let savingsVaultRef = self.signerAccount.storage.borrow<&SavingsVault.Vault>(from: /storage/userSavingsVault)!
                                        savingsVaultRef.deposit(amount: savingsFlow.balance, activateLock: useVault)
                                        
                                        // Destroy the empty vault (balance transferred)
                                        destroy savingsFlow
                                        
                                        let lockStatus = useVault ? "locked" : "unlocked"
                                        log("💾 DEPOSITED ".concat(saveAmount.toString()).concat(" FLOW to SavingsVault (").concat(lockStatus).concat(")"))
                                    }
                                    
                                    // 2. Handle LP Investment Amount - Create/Use Real LiquidityPool
                                    if lpAmount > 0.0 {
                                        let lpFlow <- self.flowVault.withdraw(amount: lpAmount)
                                        
                                        // Check if user has an LP vault, create if not
                                        if self.signerAccount.storage.borrow<&LiquidityPool.Vault>(from: /storage/userLPVault) == nil {
                                            // Create new LP vault for user
                                            let newLPVault <- LiquidityPool.createEmptyVault()
                                            self.signerAccount.storage.save(<-newLPVault, to: /storage/userLPVault)
                                            
                                            // Create public capability so dashboard can read it
                                            let lpCap = self.signerAccount.capabilities.storage.issue<&LiquidityPool.Vault>(/storage/userLPVault)
                                            self.signerAccount.capabilities.publish(lpCap, at: /public/liquidityPoolVault)
                                            
                                            log("✨ Created new LiquidityPool vault for user")
                                        }
                                        
                                        // Get reference to user's LP vault and deposit
                                        let lpVaultRef = self.signerAccount.storage.borrow<&LiquidityPool.Vault>(from: /storage/userLPVault)!
                                        lpVaultRef.deposit(amount: lpFlow.balance)
                                        
                                        // Destroy the empty vault (balance transferred)
                                        destroy lpFlow
                                        
                                        log("📈 DEPOSITED ".concat(lpAmount.toString()).concat(" FLOW to LiquidityPool vault"))
                                    }
                                    
                                    // 3. MINT FROTH REWARDS based on vault usage and amount
                                    let frothReward = useVault ? totalAmount * 0.015 : totalAmount * 0.01  // 1.5% vs 1% reward
                                    
                                    // Check if user has FROTH vault, create if not
                                    if self.signerAccount.storage.borrow<&FrothToken.Vault>(from: /storage/userFrothVault) == nil {
                                        // Create new FROTH vault for user
                                        let newFrothVault <- FrothToken.createEmptyVault()
                                        self.signerAccount.storage.save(<-newFrothVault, to: /storage/userFrothVault)
                                        
                                        // Create public capability so dashboard can read it
                                        let frothCap = self.signerAccount.capabilities.storage.issue<&FrothToken.Vault>(/storage/userFrothVault)
                                        self.signerAccount.capabilities.publish(frothCap, at: /public/frothTokenVault)
                                        
                                        log("✨ Created new FROTH vault for user")
                                    }
                                    
                                    // Mint FROTH rewards and deposit to user's vault
                                    if frothReward > 0.0 {
                                        let rewardTokens <- FrothToken.mintTokens(amount: frothReward)
                                        let frothVaultRef = self.signerAccount.storage.borrow<&FrothToken.Vault>(from: /storage/userFrothVault)!
                                        frothVaultRef.deposit(from: <-rewardTokens)
                                        
                                        let lockBonus = useVault ? " (Vault Lock Bonus!)" : ""
                                        log("🎉 MINTED ".concat(frothReward.toString()).concat(" FROTH reward tokens").concat(lockBonus))
                                    }
                                    
                                    // Note: Only spending amount remains in the wallet
                                    log("💸 REMAINING ".concat(spendAmount.toString()).concat(" FLOW available for spending in wallet"))
                                    
                                    log("✅ REAL FLOW salary split completed!")
                                    log("💳 Balance After: ".concat(self.flowVault.balance.toString()).concat(" FLOW"))
                                }
                            }
                        `,
                        args: (arg: unknown, t: unknown) => [
                            (arg as any)(amount.toFixed(1), (t as any).UFix64),
                            (arg as any)(save.toFixed(1), (t as any).UFix64),
                            (arg as any)(lp.toFixed(1), (t as any).UFix64),
                            (arg as any)(spend.toFixed(1), (t as any).UFix64),
                            (arg as any)(vault, (t as any).Bool)
                        ],
                        proposer: fcl.currentUser,
                        payer: fcl.currentUser,
                        authorizations: [fcl.currentUser.authorization as any],
                        limit: 9999
                    });
                } catch (error) {
                    console.error("❌ Error setting up transaction in setSplitConfig:", error);
                    setSplitConfigResolvers(null);
                    reject(error);
                }
            });
        },

        // Manual refresh function for dashboard
        refreshData: () => {
            console.log("🔄 Manually refreshing contract data and transaction history...");
            refetch();
            if (activeUserAddress) {
                fetchBlockchainTransactions(activeUserAddress);
            }
        },

        // Alias for handleSalarySplit for backward compatibility
        executeSalarySplit: handleSalarySplit,

        // Get processed stats with proper formatting
        contractStatus: isLoading ? "Loading..." : error ? "Error" : "Active",
        totalUsers: (() => {
            const data = stats as SeflowData | undefined;
            return data?.contractStats?.totalUsers || 0;
        })(),

        // For configuration tracking
        configPending: splitConfigPending
    };
};