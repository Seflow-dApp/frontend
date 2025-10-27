"use client";

import { useState, useEffect } from "react";
import * as fcl from "@onflow/fcl";

// Script to get user balances
const GET_BALANCES_SCRIPT = `
access(all) fun main(address: Address): {String: UFix64} {
    let balances: {String: UFix64} = {}
    
    // Mock balances for demo
    balances["flow"] = 100.0
    balances["froth"] = 5.5
    balances["savings"] = 250.0
    balances["lp"] = 150.0
    
    return balances
}
`;

// Transaction for salary split
const SALARY_SPLIT_TRANSACTION = `
transaction(
    totalAmount: UFix64,
    savePercent: UFix64,
    lpPercent: UFix64,
    spendPercent: UFix64,
    useVault: Bool
) {
    prepare(signer: auth(Storage) &Account) {
        log("Executing salary split...")
        log("Total Amount: ".concat(totalAmount.toString()))
        log("Save %: ".concat(savePercent.toString()))
        log("LP %: ".concat(lpPercent.toString()))
        log("Spend %: ".concat(spendPercent.toString()))
        log("Use Vault: ".concat(useVault.toString()))
    }
    
    execute {
        log("Salary split transaction completed")
    }
}
`;

export const useSeflowSalary = () => {
    const [balances, setBalances] = useState({
        flow: 100.0,
        froth: 5.5,
        savings: 250.0,
        lp: 150.0
    });
    const [isLoading, setIsLoading] = useState(false);

    // Fetch balances
    const fetchBalances = async (address: string = "0x01") => {
        try {
            setIsLoading(true);
            const result = await fcl.query({
                cadence: GET_BALANCES_SCRIPT,
                args: (arg: any, t: any) => [arg(address, t.Address)],
            });

            if (result) {
                setBalances(result);
            }
        } catch (error) {
            console.error("Failed to fetch balances:", error);
            // Keep mock data on error
        } finally {
            setIsLoading(false);
        }
    };

    // Execute salary split transaction
    const salarySplit = async (
        totalAmount: number,
        savePercent: number,
        lpPercent: number,
        spendPercent: number,
        useVault: boolean
    ) => {
        try {
            setIsLoading(true);

            const transactionId = await fcl.mutate({
                cadence: SALARY_SPLIT_TRANSACTION,
                args: (arg: any, t: any) => [
                    arg(totalAmount.toFixed(1), t.UFix64),
                    arg(savePercent.toFixed(1), t.UFix64),
                    arg(lpPercent.toFixed(1), t.UFix64),
                    arg(spendPercent.toFixed(1), t.UFix64),
                    arg(useVault, t.Bool),
                ],
                proposer: fcl.currentUser,
                payer: fcl.currentUser,
                authorizations: [fcl.currentUser],
                limit: 9999,
            });

            console.log("✅ Transaction submitted:", transactionId);

            // Wait for transaction to be sealed
            const result = await fcl.tx(transactionId).onceSealed();
            console.log("✅ Transaction sealed:", result);

            // Refresh balances
            await fetchBalances();

            return result;
        } catch (error) {
            console.error("❌ Salary split failed:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch balances on mount
    useEffect(() => {
        fetchBalances();
    }, []);

    return {
        // Balances
        flowBalance: balances.flow,
        frothBalance: balances.froth,
        savingsBalance: balances.savings,
        lpBalance: balances.lp,

        // Loading state
        isLoading,

        // Actions
        salarySplit,
        refetchBalances: fetchBalances,

        // Contract stats for demo
        contractStats: {
            totalUsers: 1337,
            totalValueLocked: 42069.5,
            totalRewardsDistributed: 8888.8,
        },
    };
};