"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useSeflowSalary } from "@/app/hooks/useSeflowContract";
import { useAutoCompound } from "@/app/lib/hooks/useAutoCompound";

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
  const [recentlyClaimedYield, setRecentlyClaimedYield] = useState(false);

  // Auto-compound scheduling state
  const [autoCompoundEnabled, setAutoCompoundEnabled] = useState(false);
  const [autoCompoundInterval, setAutoCompoundInterval] = useState(7); // days
  const [nextCompoundTime, setNextCompoundTime] = useState<Date | null>(null);
  const [showAutoCompoundSuccess, setShowAutoCompoundSuccess] = useState(false);

  // Auto-compound hook
  const {
    enableAutoCompound,
    checkAutoCompoundStatus,
    isLoading: autoCompoundLoading,
    error: autoCompoundError,
    txId: autoCompoundTxId,
  } = useAutoCompound();

  // Get real contract data including FROTH and enhanced info
  const {
    getUserData,
    getSavingsInfo,
    getLPInfo,
    isLoading: contractLoading,
    refreshData,
    transactionHistory,
    fetchingTxHistory,
    connectedAddress,
    error: contractError,
    handleCompound,
    compoundPending,
    compoundTxId,
  } = useSeflowSalary();
  const realUserData = getUserData();
  const savingsInfo = getSavingsInfo();
  const lpInfo = getLPInfo();

  // Auto-refresh data every 30 seconds for live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove refreshData from dependencies to prevent restarts

  // Handle compound transaction success
  useEffect(() => {
    if (compoundTxId && !compoundPending) {
      console.log("✅ Yield compound successful! TxId:", compoundTxId);

      // Store the last claim time in localStorage
      const now = Date.now();
      localStorage.setItem(`lastYieldClaim_${connectedAddress}`, now.toString());
      setRecentlyClaimedYield(true);

      // Refresh data to show updated balances
      setTimeout(() => {
        refreshData();
      }, 2000); // Wait 2 seconds for blockchain to process

      // Clear the recently claimed flag after 30 seconds
      setTimeout(() => {
        setRecentlyClaimedYield(false);
      }, 30000); // Extended to 30 seconds
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compoundTxId, compoundPending, connectedAddress]);

  // Handle auto-compound transaction success
  useEffect(() => {
    if (autoCompoundTxId && !autoCompoundLoading) {
      console.log("✅ Auto-compound setup successful! TxId:", autoCompoundTxId);
      setShowAutoCompoundSuccess(true);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setShowAutoCompoundSuccess(false);
      }, 5000);
    }
  }, [autoCompoundTxId, autoCompoundLoading]);

  // Check auto-compound status on load and address change
  useEffect(() => {
    const checkStatus = async () => {
      if (connectedAddress) {
        try {
          // First check blockchain state
          const status = await checkAutoCompoundStatus(connectedAddress);
          const isEnabledOnChain = status.handlerExists && status.handlerCapabilityExists;

          // Then check localStorage for additional info
          const localEnabled =
            localStorage.getItem(`autoCompoundEnabled_${connectedAddress}`) === "true";
          const lastScheduledTime = localStorage.getItem(`autoCompoundTime_${connectedAddress}`);

          // Use blockchain state as source of truth, but localStorage for timing
          const isEnabled = isEnabledOnChain || localEnabled;

          console.log("Auto-compound status check:", {
            chainStatus: status,
            isEnabledOnChain,
            localEnabled,
            finalEnabled: isEnabled,
          });

          setAutoCompoundEnabled(isEnabled);

          // Set next compound time from localStorage if available
          if (isEnabled && lastScheduledTime) {
            setNextCompoundTime(new Date(parseInt(lastScheduledTime)));
          } else if (!isEnabled) {
            setNextCompoundTime(null);
          }
        } catch (error) {
          console.error("Error checking auto-compound status:", error);

          // Fallback to localStorage only
          const localEnabled =
            localStorage.getItem(`autoCompoundEnabled_${connectedAddress}`) === "true";
          const lastScheduledTime = localStorage.getItem(`autoCompoundTime_${connectedAddress}`);

          setAutoCompoundEnabled(localEnabled);
          if (localEnabled && lastScheduledTime) {
            setNextCompoundTime(new Date(parseInt(lastScheduledTime)));
          }
        }
      }
    };

    checkStatus();
  }, [connectedAddress, checkAutoCompoundStatus]); // Check if yield was recently claimed (persists across refreshes)
  const checkRecentClaim = () => {
    if (!connectedAddress) return false;

    const lastClaimTime = localStorage.getItem(`lastYieldClaim_${connectedAddress}`);
    if (!lastClaimTime) return false;

    const timeSinceLastClaim = Date.now() - parseInt(lastClaimTime);
    const thirtySecondsInMs = 30 * 1000;

    return timeSinceLastClaim < thirtySecondsInMs;
  };

  // Minimum yield threshold to show (0.01 FLOW = 1 cent)
  const minimumYieldThreshold = 1;
  const isYieldMeaningful = lpInfo.availableYield >= minimumYieldThreshold;
  const wasRecentlyClaimed = recentlyClaimedYield || checkRecentClaim(); // Remove refreshData from dependencies

  // Use real balances - always show real FLOW balance, 0 for savings/LP if no transactions
  console.log("🔍 Debug realUserData:", realUserData);
  console.log("🔍 Debug individual values:");
  console.log(
    "  - flowBalance raw:",
    realUserData.flowBalance,
    "type:",
    typeof realUserData.flowBalance
  );
  console.log(
    "  - savingsBalance raw:",
    realUserData.savingsBalance,
    "type:",
    typeof realUserData.savingsBalance
  );
  console.log("  - lpBalance raw:", realUserData.lpBalance, "type:", typeof realUserData.lpBalance);

  const balances = {
    savings: parseFloat(String(realUserData.savingsBalance)) || 0,
    deFi: parseFloat(String(realUserData.lpBalance)) || 0,
    spending: parseFloat(String(realUserData.flowBalance)) || 0,
    froth: parseFloat(String(realUserData.frothBalance)) || 0,
  };

  console.log("🔍 Debug converted balances:", balances);

  const totalBalance = Number(balances.savings + balances.deFi + balances.spending) || 0;
  // Calculate actual gains from LP yield and potential savings interest
  const totalGains = Number(lpInfo.availableYield + (lpInfo.totalYieldEarned || 0)) || 0;

  // Only show yields banner if yield is meaningful and not recently claimed
  const hasYields = isYieldMeaningful && !wasRecentlyClaimed;

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

  const formatFroth = (amount: number | undefined | null) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "0.00 FROTH";
    }
    return `${amount.toFixed(2)} FROTH`;
  };

  const formatDays = (remainingTime: number) => {
    const days = Math.ceil(remainingTime / 86400);
    return days > 0 ? `${days} days left` : "Unlocked";
  };

  const cards = [
    {
      title: "Savings Balance",
      amount: balances.savings,
      subtitle: savingsInfo.isLocked
        ? `🔒 ${formatDays(savingsInfo.remainingTime)}`
        : "💸 Available",
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
      subtitle:
        isYieldMeaningful && !wasRecentlyClaimed
          ? `💰 ${lpInfo.availableYield.toFixed(2)} FLOW yield ready`
          : wasRecentlyClaimed
          ? "✅ Yield claimed successfully!"
          : "📈 Earning 1% weekly",
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
      subtitle: "💳 Available for spending",
      icon: "material-symbols:shopping-cart",
      color: "yellow",
      bgColor: "bg-linear-to-br from-yellow-50 to-yellow-100",
      iconBg: "bg-yellow-500",
      textColor: "text-yellow-600",
      accentColor: "border-yellow-200",
    },
    {
      title: "FROTH Rewards",
      amount: balances.froth,
      subtitle: "🎉 Earned from salary splits",
      icon: "material-symbols:token",
      color: "purple",
      bgColor: "bg-linear-to-br from-purple-50 to-purple-100",
      iconBg: "bg-purple-500",
      textColor: "text-purple-600",
      accentColor: "border-purple-200",
      isToken: true, // Flag to show different formatting
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
              className="cursor-pointer p-2 bg-blue-100 hover:bg-blue-200 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Yields Compounded Banner - Only show if there are actual yields */}
        {showYieldsBanner && hasYields && (
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
                        {lpInfo.availableYield > 0
                          ? "💰 Yield Ready to Claim!"
                          : "🎉 Yields Compounded!"}
                      </span>
                    </h2>
                    <p className="text-green-100">
                      <span data-editor-id="app/components/DashboardPage.tsx:133:22">
                        {lpInfo.availableYield > 0
                          ? `${formatCurrency(lpInfo.availableYield)} available to claim`
                          : `You've earned ${formatCurrency(totalGains)} total`}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Claim Yield Button - Only show when yield is available */}
                  {lpInfo.availableYield > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (connectedAddress) {
                          handleCompound(connectedAddress);
                        }
                      }}
                      disabled={compoundPending || !connectedAddress}
                      className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors cursor-pointer border border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center space-x-2">
                        {compoundPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                            <span>Claiming...</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="material-symbols:download" className="text-lg" />
                            <span>Claim Yield</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  )}

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
            {contractError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-red-700 text-sm">
                  <span className="font-medium">Query Error:</span> {String(contractError)}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Showing transaction history only. Contract data unavailable.
                </p>
              </div>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <Icon
                    icon={card.isToken ? "cryptocurrency:frax-share" : "cryptocurrency:flow"}
                    className={card.isToken ? "text-purple-600" : "text-blue-600"}
                  />
                  <p className={`text-2xl font-semibold ${card.textColor}`}>
                    {card.isToken ? formatFroth(card.amount) : formatCurrency(card.amount)}
                  </p>
                </div>
                {card.subtitle && (
                  <p className="text-sm text-gray-600 flex items-center space-x-1">
                    <span>{card.subtitle}</span>
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Auto-Compound Scheduling Section */}
        {balances.deFi > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-linear-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-8 border border-purple-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
                  <Icon icon="material-symbols:schedule" className="text-2xl text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-gray-900">Auto-Compound Scheduler</h2>
                  <p className="text-gray-600">
                    Schedule automatic yield compounding using Flow&apos;s innovative scheduled
                    transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    autoCompoundEnabled ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {autoCompoundEnabled ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Settings Panel */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    <Icon icon="mdi:clock-outline" className="inline mr-2 text-purple-600" />
                    Compounding Frequency
                  </label>
                  <div className="relative">
                    <select
                      value={autoCompoundInterval}
                      onChange={(e) => setAutoCompoundInterval(parseInt(e.target.value))}
                      className="w-full px-4 py-3 pr-10 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium shadow-sm hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 appearance-none cursor-pointer"
                    >
                      <option value={1} className="py-2">
                        Daily (24 hours)
                      </option>
                      <option value={3} className="py-2">
                        Every 3 days
                      </option>
                      <option value={7} className="py-2">
                        Weekly (7 days)
                      </option>
                      <option value={14} className="py-2">
                        Bi-weekly (14 days)
                      </option>
                      <option value={30} className="py-2">
                        Monthly (30 days)
                      </option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Icon icon="mdi:chevron-down" className="text-gray-400 text-xl" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 flex items-center">
                    <Icon icon="mdi:information-outline" className="mr-1" />
                    More frequent compounding = higher yields but more transaction fees
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Fee per Transaction
                  </label>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Icon icon="cryptocurrency:flow" className="text-blue-500" />
                    <span>~0.001 FLOW</span>
                    <span className="text-xs">(Dynamic based on network)</span>
                  </div>
                </div>

                {nextCompoundTime && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Compound Scheduled
                    </label>
                    <div className="text-sm text-purple-600 font-medium">
                      {nextCompoundTime.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Panel */}
              <div className="flex flex-col justify-center space-y-4">
                <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Icon icon="material-symbols:robot" className="text-purple-500 text-2xl" />
                    <span className="text-lg font-medium text-gray-900">Autonomous DeFi</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Your LP yield will be automatically compounded without any manual intervention
                  </p>

                  {!autoCompoundEnabled ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={async () => {
                        if (connectedAddress && !autoCompoundLoading) {
                          try {
                            console.log("Setting up auto-compound...");
                            await enableAutoCompound(autoCompoundInterval);
                            setAutoCompoundEnabled(true);

                            const nextTime = new Date(
                              Date.now() + autoCompoundInterval * 24 * 60 * 60 * 1000
                            );
                            setNextCompoundTime(nextTime);

                            // Save to localStorage for persistence
                            localStorage.setItem(
                              `autoCompoundTime_${connectedAddress}`,
                              nextTime.getTime().toString()
                            );
                            localStorage.setItem(`autoCompoundEnabled_${connectedAddress}`, "true");

                            console.log("Auto-compound enabled successfully!");
                          } catch (error) {
                            console.error("Failed to enable auto-compound:", error);
                          }
                        }
                      }}
                      disabled={autoCompoundLoading || !connectedAddress}
                      className="cursor-pointer w-full px-6 py-3 bg-linear-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {autoCompoundLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
                            <span>Setting up...</span>
                          </>
                        ) : (
                          <>
                            <Icon icon="material-symbols:play-arrow" />
                            <span>Enable Auto-Compound</span>
                          </>
                        )}
                      </div>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        // This would call the cancel transaction
                        setAutoCompoundEnabled(false);
                        setNextCompoundTime(null);

                        // Clear localStorage
                        if (connectedAddress) {
                          localStorage.removeItem(`autoCompoundTime_${connectedAddress}`);
                          localStorage.removeItem(`autoCompoundEnabled_${connectedAddress}`);
                        }
                      }}
                      className="cursor-pointer w-full px-6 py-3 bg-linear-to-r from-red-500 to-pink-500 text-white rounded-lg font-medium hover:from-red-600 hover:to-pink-600 transition-colors"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Icon icon="material-symbols:stop" />
                        <span>Disable Auto-Compound</span>
                      </div>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {autoCompoundError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon icon="material-symbols:error" className="text-red-500 text-xl mt-0.5" />
                  <div className="text-sm">
                    <p className="text-red-800 font-medium mb-1">Auto-Compound Setup Error</p>
                    <p className="text-red-700">{autoCompoundError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Display */}
            {showAutoCompoundSuccess && autoCompoundTxId && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Icon
                    icon="material-symbols:check-circle"
                    className="text-green-500 text-xl mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="text-green-800 font-medium mb-1">Auto-Compound Enabled!</p>
                    <p className="text-green-700">
                      Transaction ID:{" "}
                      <a
                        href={`https://testnet.flowscan.io/tx/${autoCompoundTxId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        {autoCompoundTxId.slice(0, 8)}...{autoCompoundTxId.slice(-8)}
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Banner */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Icon icon="material-symbols:info" className="text-blue-500 text-xl mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium mb-1">
                    Powered by Flow Scheduled Transactions (Experimental)
                  </p>
                  <p className="text-blue-700">
                    This feature uses Flow&apos;s cutting-edge scheduled transaction system to
                    automatically execute yield compounding on the blockchain without requiring
                    external services or manual intervention.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

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
