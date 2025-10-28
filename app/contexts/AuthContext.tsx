"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  isConnected: boolean;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const walletAddress = "0x1234...5678";
      setWalletAddress(walletAddress);
      setIsConnected(true);

      // Store in localStorage for persistence
      localStorage.setItem("wallet_connected", "true");
      localStorage.setItem("wallet_address", walletAddress);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    localStorage.removeItem("wallet_connected");
    localStorage.removeItem("wallet_address");
  };

  // Check for existing connection on mount
  useEffect(() => {
    const connected = localStorage.getItem("wallet_connected");
    const address = localStorage.getItem("wallet_address");
    if (connected && address) {
      setIsConnected(true);
      setWalletAddress(address);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isConnected, walletAddress, connectWallet, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};
