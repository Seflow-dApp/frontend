import { useState } from "react";
import * as fcl from "@onflow/fcl";
import { SETUP_AND_SCHEDULE_AUTO_COMPOUND, SETUP_AUTO_COMPOUND_HANDLER, SCHEDULE_AUTO_COMPOUND, CHECK_AUTO_COMPOUND_STATUS } from "@/app/_shared/lib/transactions/autoCompound";

export function useAutoCompound() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [txId, setTxId] = useState<string | null>(null);

    const setupAutoCompoundHandler = async (intervalDays: number) => {
        try {
            setIsLoading(true);
            setError(null);
            setTxId(null);

            const transactionId = await fcl.mutate({
                cadence: SETUP_AUTO_COMPOUND_HANDLER,
                args: (arg: any, t: any) => [
                    arg(intervalDays, t.UInt64)
                ],
                payer: fcl.currentUser,
                proposer: fcl.currentUser,
                authorizations: [fcl.currentUser],
                limit: 9999,
            });

            setTxId(transactionId);

            // Wait for transaction to be sealed
            const transaction = await fcl.tx(transactionId).onceSealed();
            console.log("Auto-compound handler setup transaction sealed:", transaction);

            return transaction;
        } catch (err) {
            console.error("Error setting up auto-compound handler:", err);
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const scheduleAutoCompound = async (intervalDays: number) => {
        try {
            setIsLoading(true);
            setError(null);
            setTxId(null);

            const transactionId = await fcl.mutate({
                cadence: SCHEDULE_AUTO_COMPOUND,
                args: (arg: any, t: any) => [
                    arg(intervalDays, t.UInt64)
                ],
                payer: fcl.currentUser,
                proposer: fcl.currentUser,
                authorizations: [fcl.currentUser],
                limit: 9999,
            });

            setTxId(transactionId);

            // Wait for transaction to be sealed
            const transaction = await fcl.tx(transactionId).onceSealed();
            console.log("Auto-compound scheduled transaction sealed:", transaction);

            return transaction;
        } catch (err) {
            console.error("Error scheduling auto-compound:", err);
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const setupAndScheduleAutoCompound = async (intervalDays: number) => {
        try {
            setIsLoading(true);
            setError(null);
            setTxId(null);

            const transactionId = await fcl.mutate({
                cadence: SETUP_AND_SCHEDULE_AUTO_COMPOUND,
                args: (arg: any, t: any) => [
                    arg(intervalDays, t.UInt64)
                ],
                payer: fcl.currentUser,
                proposer: fcl.currentUser,
                authorizations: [fcl.currentUser],
                limit: 9999,
            });

            setTxId(transactionId);

            // Wait for transaction to be sealed
            const transaction = await fcl.tx(transactionId).onceSealed();
            console.log("Auto-compound setup and scheduled transaction sealed:", transaction);

            return transaction;
        } catch (err) {
            console.error("Error setting up and scheduling auto-compound:", err);
            setError(err instanceof Error ? err.message : String(err));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const checkAutoCompoundStatus = async (address: string) => {
        try {
            const result = await fcl.query({
                cadence: CHECK_AUTO_COMPOUND_STATUS,
                args: (arg: any, t: any) => [
                    arg(address, t.Address)
                ]
            });

            console.log("Auto-compound status:", result);
            return result;
        } catch (err) {
            console.error("Error checking auto-compound status:", err);
            return {
                handlerExists: false,
                managerExists: false,
                handlerCapabilityExists: false
            };
        }
    };

    const enableAutoCompound = async (intervalDays: number) => {
        try {
            console.log("Setting up and scheduling auto-compound in one transaction...");
            await setupAndScheduleAutoCompound(intervalDays);
            console.log("Auto-compound enabled successfully!");
            return true;
        } catch (err) {
            console.error("Error enabling auto-compound:", err);
            throw err;
        }
    };

    return {
        enableAutoCompound,
        setupAndScheduleAutoCompound,
        setupAutoCompoundHandler,
        scheduleAutoCompound,
        checkAutoCompoundStatus,
        isLoading,
        error,
        txId,
    };
}
