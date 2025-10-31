"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useAuth } from "@/app/_shared/contexts/FlowAuthContext";
import { useState } from "react";

export default function LoginPrompt() {
  const { connectWallet } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <div className="w-16 h-16 bg-[#22C55E] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icon icon="mdi:coins" className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome to Seflow</h1>
            <p className="text-gray-500">Connect your wallet to get started</p>
          </motion.div>

          {/* Connection Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-green-50 rounded-xl p-6 mb-8"
          >
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center shrink-0">
                <Icon icon="material-symbols:security" className="text-white text-lg" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Your wallet connection is secure and your data remains private. We only access
                  what&apos;s necessary to provide our services.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <p className="text-sm font-medium text-gray-700 mb-4">What you can do:</p>
            <div className="space-y-3">
              {[
                { icon: "lucide:split", text: "Auto-split your salary" },
                { icon: "material-symbols:trending-up", text: "Earn DeFi yields" },
                { icon: "material-symbols:dashboard", text: "Track your portfolio" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center space-x-3 justify-center"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Icon icon={item.icon} className="text-[#22C55E] text-sm" />
                  </div>
                  <span className="text-sm text-gray-600">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <p className="text-xs text-gray-400">
              By connecting, you agree to our Terms of Service
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
