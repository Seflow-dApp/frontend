"use client";

import { useFlowQuery, useFlowMutate, useFlowTransactionStatus } from "@onflow/react-sdk";
import { useEffect } from "react";

export const useCounter = () => {
    // Query to get current block height
    const {
        data: count,
        isLoading,
        error,
        refetch,
    } = useFlowQuery({
        cadence: `
      access(all)
      fun main(): String {
          let blockHeight = getCurrentBlock().height
          return blockHeight.toString()
      }
    `,
        query: { enabled: true },
    });

    // Mutation for incrementing counter
    const { mutate: increment, isPending: txPending, data: txId, error: txError } = useFlowMutate();

    // Track transaction status
    const { transactionStatus, error: txStatusError } = useFlowTransactionStatus({
        id: txId || "",
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
            log("Wallet connected and transaction executed successfully!")
          }
          execute {
            log("Transaction completed from address: ".concat(acct.address.toString()))
          }
        }
      `,
        });
    };

    return {
        count: (count as string) || "0",
        isLoading,
        error,
        increment: handleIncrement,
        txPending,
        txError,
        txStatusError,
        transactionStatus,
    };
};
