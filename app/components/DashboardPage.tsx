"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useSeflowSalary } from "@/app/hooks/useSeflowContract";

interface DashboardData {
  savings: number;
  deFi: number;
  spending: number;
  yields: number;
  froth: number;
}

interface DashboardPageProps {
  data?: DashboardData;
}

export default function DashboardPage({}: DashboardPageProps) {
  const [showYieldsBanner, setShowYieldsBanner] = useState(true);
  const [animatingCoins, setAnimatingCoins] = useState<Array<{ id: number; x: number; y: number }>>(
    []
  );

  // Get real contract data
  const {
    getUserData,
    isLoading: contractLoading,
    refreshData,
    transactionHistory,
    fetchingTxHistory,
    connectedAddress,
  } = useSeflowSalary();
  const realUserData = getUserData();

  // Auto-refresh data every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      console.log("🔄 Auto-refreshing dashboard data...");
      refreshData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshData]);

  // Use real balances - always show real FLOW balance, 0 for savings/LP if no transactions
  const balances = {
    savings: Number(realUserData.savingsBalance) || 0,
    deFi: Number(realUserData.lpBalance) || 0,
    spending: Number(realUserData.flowBalance) || 0,
  };

  const totalBalance = Number(balances.savings + balances.deFi + balances.spending) || 0;
  const totalGains = 0; // Will show actual yields when Seflow contracts implement yield tracking

  // Animate coins periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newCoin = {
          id: Date.now(),
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + 50,
        };
        setAnimatingCoins((prev) => [...prev, newCoin]);

        setTimeout(() => {
          setAnimatingCoins((prev) => prev.filter((coin) => coin.id !== newCoin.id));
        }, 3000);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number | undefined | null) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "0.00 FLOW";
    }
    return `${amount.toFixed(2)} FLOW`;
  };

  const cards = [
    {
      title: "Savings Balance",
      amount: balances.savings,
      icon: "material-symbols:savings",
      color: "green",
      bgColor: "bg-linear-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500",
      textColor: "text-green-600",
      accentColor: "border-green-200",
    },
    {
      title: "DeFi Investments",
      amount: balances.deFi,
      icon: "mdi:chart-line",
      color: "blue",
      bgColor: "bg-linear-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600",
      accentColor: "border-blue-200",
    },
    {
      title: "Spending Wallet",
      amount: balances.spending,
      icon: "material-symbols:shopping-cart",
      color: "yellow",
      bgColor: "bg-linear-to-br from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-500",
      textColor: "text-yellow-600",
      accentColor: "border-yellow-200",
    },
  ];

  return (
    <div className="min-h-screen pt-16 bg-gray-50 relative overflow-hidden">
      {/* Floating Coins Animation */}
      {animatingCoins.map((coin) => (
        <motion.div
          key={coin.id}
          initial={{ x: coin.x, y: coin.y, opacity: 1, scale: 1 }}
          animate={{
            y: coin.y - window.innerHeight - 100,
            opacity: [1, 1, 0],
            scale: [1, 1.2, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute pointer-events-none z-10"
        >
          <Icon icon="mdi:coins" className="text-3xl text-yellow-500" />
        </motion.div>
      ))}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">
              <span data-editor-id="app/components/DashboardPage.tsx:97:12">
                Your Financial Dashboard
              </span>
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refreshData}
              disabled={contractLoading}
              className="p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data from blockchain"
            >
              <Icon
                icon="material-symbols:refresh"
                className={`text-xl text-blue-600 ${contractLoading ? "animate-spin" : ""}`}
              />
            </motion.button>
          </div>
          <p className="text-lg text-gray-600">
            <span data-editor-id="app/components/DashboardPage.tsx:100:12">
              Track your automated wealth growth in real-time
            </span>
          </p>
        </motion.div>

        {/* Yields Compounded Banner */}
        {showYieldsBanner && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 relative"
          >
            <div className="bg-linear-to-r from-[#22C55E] to-green-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
              <motion.div
                animate={{
                  background: [
                    "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)",
                    "linear-gradient(225deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 100%)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 opacity-30"
              />

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center"
                  >
                    <Icon icon="material-symbols:trending-up" className="text-3xl text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-medium mb-1">
                      <span data-editor-id="app/components/DashboardPage.tsx:130:22">
                        🎉 Yields Compounded!
                      </span>
                    </h2>
                    <p className="text-green-100">
                      <span data-editor-id="app/components/DashboardPage.tsx:133:22">
                        You&apos;ve earned {formatCurrency(totalGains)} this month
                      </span>
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowYieldsBanner(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon icon="material-symbols:close" className="text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100"
        >
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Icon icon="cryptocurrency:flow" className="text-blue-600 text-lg" />
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/DashboardPage.tsx:154:14">
                  Total Portfolio Value
                </span>
              </p>
              {contractLoading && (
                <div className="flex items-center space-x-1">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                  <span className="text-xs text-blue-600">Updating...</span>
                </div>
              )}
            </div>
            {contractLoading ? (
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="text-gray-500">Loading real balance...</span>
              </div>
            ) : (
              <p className="text-4xl font-light text-gray-900 mb-4">
                <span data-editor-id="app/components/DashboardPage.tsx:157:14">
                  {formatCurrency(totalBalance)}
                </span>
              </p>
            )}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  <span data-editor-id="app/components/DashboardPage.tsx:162:18">
                    Connected:{" "}
                    {connectedAddress ? `${connectedAddress.slice(0, 8)}...` : "Not Connected"}
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Balance Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {cards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
              className={`${card.bgColor} ${card.accentColor} border-2 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center shadow-md`}
                >
                  <Icon icon={card.icon} className="text-2xl text-white" />
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-2">
                <span data-editor-id={`app/components/DashboardPage.tsx:189:16:${index}`}>
                  {card.title}
                </span>
              </h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon icon="cryptocurrency:flow" className="text-blue-600" />
                  <p className={`text-2xl font-semibold ${card.textColor}`}>
                    {formatCurrency(card.amount)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Address & Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <Icon icon="material-symbols:history" className="text-xl text-gray-600" />
                <span>Recent Transactions</span>
              </h3>
              {connectedAddress && (
                <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg font-mono">
                  {connectedAddress.slice(0, 8)}...{connectedAddress.slice(-6)}
                </div>
              )}
            </div>

            <div className="mb-6">
              {fetchingTxHistory ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p>Loading blockchain transactions...</p>
                </div>
              ) : transactionHistory.length > 0 ? (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {transactionHistory.slice(0, 10).map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            tx.status === "success"
                              ? "bg-green-500"
                              : tx.status === "failed"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {tx.type === "salary_split"
                              ? "Salary Split"
                              : tx.type === "compound"
                              ? "Yield Compound"
                              : "FLOW Token Transfer"}
                          </div>
                          <div className="text-sm text-gray-600">{tx.details}</div>
                          {tx.txId && (
                            <div className="text-xs text-blue-600 font-mono mt-1">
                              <a
                                href={`https://testnet.flowscan.io/tx/${tx.txId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {tx.txId.slice(0, 8)}...{tx.txId.slice(-8)} ↗
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {tx.amount > 0 ? formatCurrency(tx.amount) : "—"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Icon
                    icon="material-symbols:history"
                    className="mx-auto text-4xl mb-2 opacity-50"
                  />
                  <p>No transactions found</p>
                  <p className="text-sm">
                    {connectedAddress
                      ? "Your blockchain transactions will appear here"
                      : "Connect your wallet to see transaction history"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
