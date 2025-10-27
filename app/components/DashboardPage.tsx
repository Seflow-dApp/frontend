"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";

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

export default function DashboardPage({
  data = { savings: 25, deFi: 15, spending: 10, yields: 0.15, froth: 1.5 },
}: DashboardPageProps) {
  const [showYieldsBanner, setShowYieldsBanner] = useState(true);
  const [animatingCoins, setAnimatingCoins] = useState<Array<{ id: number; x: number; y: number }>>(
    []
  );

  const salaryAmount = 10000000; // 10 million IDR sample

  const balances = {
    savings: ((salaryAmount * data.savings) / 100) * (1 + data.yields),
    deFi: ((salaryAmount * data.deFi) / 100) * (1 + data.yields * data.froth),
    spending: (salaryAmount * data.spending) / 100,
  };

  const totalBalance = balances.savings + balances.deFi + balances.spending;
  const totalGains =
    balances.savings + balances.deFi - (salaryAmount * (data.savings + data.deFi)) / 100;

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

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  const cards = [
    {
      title: "Savings Balance",
      amount: balances.savings,
      percentage: data.savings,
      icon: "material-symbols:savings",
      color: "green",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-green-500",
      textColor: "text-green-600",
      accentColor: "border-green-200",
    },
    {
      title: "DeFi Investments",
      amount: balances.deFi,
      percentage: data.deFi,
      icon: "mdi:chart-line",
      color: "blue",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-500",
      textColor: "text-blue-600",
      accentColor: "border-blue-200",
    },
    {
      title: "Spending Wallet",
      amount: balances.spending,
      percentage: data.spending,
      icon: "material-symbols:shopping-cart",
      color: "yellow",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
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
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            <span data-editor-id="app/components/DashboardPage.tsx:97:12">
              Your Financial Dashboard
            </span>
          </h1>
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
            <div className="bg-gradient-to-r from-[#22C55E] to-green-600 rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden">
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
            <p className="text-sm text-gray-500 mb-2">
              <span data-editor-id="app/components/DashboardPage.tsx:154:14">
                Total Portfolio Value
              </span>
            </p>
            <p className="text-4xl font-light text-gray-900 mb-4">
              <span data-editor-id="app/components/DashboardPage.tsx:157:14">
                {formatCurrency(totalBalance)}
              </span>
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">
                  <span data-editor-id="app/components/DashboardPage.tsx:162:18">
                    Monthly Gain: +
                    {(
                      (totalGains / ((salaryAmount * (data.savings + data.deFi)) / 100)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">
                  <span data-editor-id="app/components/DashboardPage.tsx:167:18">
                    Active Investments: 2
                  </span>
                </span>
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
                <div
                  className={`px-3 py-1 bg-white/70 ${card.textColor} rounded-full text-sm font-medium`}
                >
                  {card.percentage}%
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mb-2">
                <span data-editor-id={`app/components/DashboardPage.tsx:189:16:${index}`}>
                  {card.title}
                </span>
              </h3>

              <div className="space-y-2">
                <p className={`text-2xl font-semibold ${card.textColor}`}>
                  {formatCurrency(card.amount)}
                </p>

                {(card.color === "green" || card.color === "blue") && (
                  <div className="flex items-center space-x-1 text-sm text-green-600">
                    <Icon icon="material-symbols:trending-up" className="text-sm" />
                    <span data-editor-id={`app/components/DashboardPage.tsx:199:20:${index}`}>
                      +
                      {card.color === "green"
                        ? (data.yields * 100).toFixed(1)
                        : (data.yields * data.froth * 100).toFixed(1)}
                      % this month
                    </span>
                  </div>
                )}

                {card.color === "yellow" && (
                  <p className="text-sm text-gray-600">
                    <span data-editor-id={`app/components/DashboardPage.tsx:206:20:${index}`}>
                      Available for expenses
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-white rounded-xl p-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Icon icon="material-symbols:add" className="text-xl" />
            <span data-editor-id="app/components/DashboardPage.tsx:225:12">Add Funds</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(15, 118, 110, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-[#0F766E] text-[#0F766E] hover:bg-[#0F766E] hover:text-white rounded-xl p-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Icon icon="material-symbols:settings" className="text-xl" />
            <span data-editor-id="app/components/DashboardPage.tsx:234:12">Adjust Split</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.3)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white rounded-xl p-4 font-medium transition-all duration-300 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Icon icon="material-symbols:history" className="text-xl" />
            <span data-editor-id="app/components/DashboardPage.tsx:243:12">View History</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
