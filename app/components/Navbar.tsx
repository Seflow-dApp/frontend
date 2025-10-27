"use client";

import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/app/contexts/FlowAuthContext";
import { formatWalletAddress } from "@/lib/utils";

interface NavbarProps {
  activeTab?: "home" | "split" | "dashboard" | "about";
  onTabChange?: (tab: string) => void;
}

export default function Navbar({ activeTab = "home", onTabChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isConnected, walletAddress, connectWallet, disconnectWallet } = useAuth();

  // Show only Home and About when not connected, all items when connected
  const navItems = isConnected
    ? [
        { id: "home", label: "Home", icon: "material-symbols:home" },
        { id: "split", label: "Split", icon: "lucide:split" },
        { id: "dashboard", label: "Dashboard", icon: "material-symbols:dashboard" },
        { id: "about", label: "About", icon: "material-symbols:info" },
      ]
    : [
        { id: "home", label: "Home", icon: "material-symbols:home" },
        { id: "about", label: "About", icon: "material-symbols:info" },
      ];

  const handleItemClick = (itemId: string) => {
    onTabChange?.(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleItemClick("home")}
          >
            <div className="w-8 h-8 bg-[#22C55E] rounded-lg flex items-center justify-center">
              <Icon icon="mdi:coins" className="text-white text-lg" />
            </div>
            <span className="text-xl font-semibold text-gray-900">
              <span data-editor-id="app/components/Navbar.tsx:39:14">Seflow</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleItemClick(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? "bg-[#22C55E] text-white shadow-md"
                    : "text-gray-600 hover:text-[#22C55E] hover:bg-green-50"
                }`}
              >
                <Icon icon={item.icon} className="text-lg" />
                <span data-editor-id={`app/components/Navbar.tsx:54:16:${item.id}`}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Wallet Connect Button */}
          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              className="hidden md:flex items-center space-x-2 bg-[#0F766E] hover:bg-[#0d5a52] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md cursor-pointer"
            >
              <Icon icon="material-symbols:wallet" className="text-lg" />
              <span data-editor-id="app/components/Navbar.tsx:66:12">Connect Wallet</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={disconnectWallet}
              className="hidden md:flex items-center space-x-2 bg-[#22C55E] hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md cursor-pointer"
            >
              <Icon icon="material-symbols:account-balance-wallet" className="text-lg" />
              <span>{formatWalletAddress(walletAddress)}</span>
            </motion.button>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-[#22C55E] hover:bg-green-50 transition-colors cursor-pointer"
          >
            <Icon
              icon={isMobileMenuOpen ? "material-symbols:close" : "material-symbols:menu"}
              className="text-xl"
            />
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleItemClick(item.id)}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? "bg-[#22C55E] text-white"
                      : "text-gray-600 hover:text-[#22C55E] hover:bg-green-50"
                  }`}
                >
                  <Icon icon={item.icon} className="text-lg" />
                  <span data-editor-id={`app/components/Navbar.tsx:99:18:${item.id}`}>
                    {item.label}
                  </span>
                </motion.button>
              ))}

              {/* Mobile Wallet Connect */}
              {!isConnected ? (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={connectWallet}
                  className="flex items-center space-x-3 w-full px-4 py-3 bg-[#0F766E] hover:bg-[#0d5a52] text-white rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <Icon icon="material-symbols:wallet" className="text-lg" />
                  <span data-editor-id="app/components/Navbar.tsx:109:16">Connect Wallet</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={disconnectWallet}
                  className="flex items-center space-x-3 w-full px-4 py-3 bg-[#22C55E] hover:bg-green-600 text-white rounded-lg transition-all duration-200 cursor-pointer"
                >
                  <Icon icon="material-symbols:account-balance-wallet" className="text-lg" />
                  <span>{formatWalletAddress(walletAddress)}</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
