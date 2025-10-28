import * as fcl from "@onflow/fcl";

/**
 * Enhanced authentication with better error handling
 */
export const authenticateWithFlow = async () => {
    try {
        // Clear any existing session first
        await fcl.unauthenticate();

        // Ensure FCL is configured with authz
        fcl.config({
            "fcl.authz": fcl.currentUser.authorization
        });

        // Direct service configuration to bypass CORS issues
        const bloctoService = {
            f_type: "Service",
            f_vsn: "1.0.0",
            type: "authn",
            method: "IFRAME/RPC",
            endpoint: "https://wallet.blocto.app/api/flow/authn",
            uid: "blocto",
            id: "0x9d2e44203cb13051#blocto"
        };

        // Authenticate with direct service
        const user = await fcl.authenticate([bloctoService]);

        if (!user || !user.loggedIn) {
            throw new Error("Authentication failed - user not logged in");
        }

        console.log("✅ Wallet Connected Successfully:", user);
        return user;
    } catch (error: unknown) {
        console.error("🔐 Authentication Error:", error);
        throw error;
    }
};

/**
 * Enhanced logout with cleanup
 */
export const logoutFromFlow = async () => {
    try {
        await fcl.unauthenticate();
        console.log("✅ Wallet Disconnected Successfully");
        return true;
    } catch (error: unknown) {
        console.error("🔐 Logout Error:", error);
        // Even if logout fails, we should still clear local state
        return false;
    }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
    try {
        const user = await fcl.currentUser;
        return user && (user as any).loggedIn;
    } catch (error) {
        console.error("Authentication check failed:", error);
        return false;
    }
};

/**
 * Get current user with error handling
 */
export const getCurrentUser = async () => {
    try {
        const user = await fcl.currentUser;
        return user;
    } catch (error) {
        console.error("Unable to retrieve user information:", error);
        return null;
    }
};

/**
 * Enhanced transaction execution with better error handling
 */
export const executeTransaction = async (transaction: string, args: (() => unknown[]) | unknown[] = []) => {
    try {
        const txId = await fcl.mutate({
            cadence: transaction,
            args: typeof args === 'function' ? args : () => args,
            proposer: fcl.currentUser,
            payer: fcl.currentUser,
            authorizations: [fcl.currentUser],
        });

        console.log("📝 Transaction Submitted:", txId);

        // Wait for transaction to be sealed
        const result = await fcl.tx(txId).onceSealed();

        if (result.errorMessage) {
            throw new Error(result.errorMessage);
        }

        console.log("✅ Transaction Successful:", result);
        return result;
    } catch (error: unknown) {
        console.error("💸 Transaction Error:", error);
        throw error;
    }
};

/**
 * Enhanced script execution with better error handling
 */
export const executeScript = async (script: string, args: any[] = []) => {
    try {
        const result = await fcl.query({
            cadence: script,
            args: args as any,
        });

        return result;
    } catch (error: unknown) {
        console.error("📜 Script Error:", error);
        throw error;
    }
};