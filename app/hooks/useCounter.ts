"use client";

import { useFlowQuery, useFlowMutate, useFlowTransactionStatus } from "@onflow/react-sdk";
import { useEffect } from "react";

export const useCounter = () => {
    // Simple demo query - just get current block height as a demo
    const { data: count, isLoading, error, refetch } = useFlowQuery({
        cadence: `
      access(all)
      fun main(): String {
          // Simple demo - return current block height as a number
          let blockHeight = getCurrentBlock().height
          return blockHeight.toString()
      }
    `,
        query: { enabled: true },
    });

    // Mutation for incrementing counter
    const {
        mutate: increment,
        isPending: txPending,
        data: txId,
        error: txError,
    } = useFlowMutate();

    // Track transaction status
    const { transactionStatus, error: txStatusError } = useFlowTransactionStatus({
        id: txId || '',
    });

    // Auto-refetch when transaction is executed
    useEffect(() => {
        if (txId && transactionStatus?.status === 3) {
            refetch();
        }
    }, [transactionStatus?.status, txId, refetch]);

    const handleIncrement = () => {
        increment({
            cadence: `
        transaction {
          prepare(acct: &Account) {
            // Simple demo transaction - just log a message
            log("Wallet connected and transaction executed successfully!")
          }
          execute {
            // This is just a demo transaction to test wallet connection
            log("Demo transaction completed from address: ".concat(acct.address.toString()))
          }
        }
      `,
        });
    };

    return {
        count: count as string || '0',
        isLoading,
        error,
        increment: handleIncrement,
        txPending,
        txError,
        txStatusError,
        transactionStatus,
    };
};