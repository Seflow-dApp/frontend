"use client";

import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useFlowCurrentUser } from "@onflow/react-sdk";
import { authenticateWithFlow, logoutFromFlow } from "@/lib/flow-auth-utils";
import * as fcl from "@onflow/fcl";

interface FlowAuthContextType {
  isConnected: boolean;
  walletAddress: string | null;
  user: any;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const FlowAuthContext = createContext<FlowAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(FlowAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a FlowAuthProvider");
  }
  return context;
};

interface FlowAuthProviderProps {
  children: ReactNode;
}

export const FlowAuthProvider = ({ children }: FlowAuthProviderProps) => {
  const { user, unauthenticate } = useFlowCurrentUser();
  const [localUser, setLocalUser] = useState(user);

  // Sync user state changes
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  // Listen to FCL authentication changes
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      console.log("🔄 FCL User state changed:", user);
      setLocalUser(user);
    });

    return () => unsubscribe();
  }, []);

  const currentUser = localUser || user;
  const isConnected = !!currentUser?.loggedIn;
  const walletAddress = currentUser?.addr || null;

  const connectWallet = async () => {
    try {
      console.log("Attempting to authenticate with enhanced auth utils...");
      const result = await authenticateWithFlow();
      console.log("Authentication successful:", result);
      // Force update local state
      setLocalUser(result);
    } catch (error) {
      console.error("🔐 Authentication failed:", error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await logoutFromFlow();
      unauthenticate();
      setLocalUser(null);
    } catch (error) {
      console.error("🔐 Logout error:", error);
      // Still disconnect even if logout fails
      unauthenticate();
      setLocalUser(null);
    }
  };

  return (
    <FlowAuthContext.Provider
      value={{
        isConnected,
        walletAddress,
        user: currentUser,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </FlowAuthContext.Provider>
  );
};
