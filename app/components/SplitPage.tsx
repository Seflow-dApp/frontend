"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import { useSeflowSalary } from "@/app/hooks/useSeflowContract";

interface SplitPageProps {
  initialData?: {
    savings: number;
    deFi: number;
    spending: number;
  };
}

export default function SplitPage({
  initialData = { savings: 40, deFi: 30, spending: 30 },
}: SplitPageProps) {
  const [splits, setSplits] = useState(initialData);
  const { setSplitConfig, isLoading, error, configPending } = useSeflowSalary();
  const [isLockVault, setIsLockVault] = useState(false);
  const [animatingTokens, setAnimatingTokens] = useState<
    Array<{ id: number; type: string; x: number; y: number }>
  >([]);
  const [salaryAmount, setSalaryAmount] = useState(100); // Editable FLOW amount

  // Manual loading state management for better UX
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastTransactionTime, setLastTransactionTime] = useState<number | null>(null);

  const totalAllocated = splits.savings + splits.deFi + splits.spending;
  const remaining = 100 - totalAllocated;

  // Handle transaction with manual loading and success states
  const handleTransactionSubmit = async () => {
    setIsManualLoading(true);
    setLastTransactionTime(Date.now());

    try {
      // Execute the transaction
      await setSplitConfig(
        splits.savings,
        splits.deFi,
        splits.spending,
        isLockVault ? 1 : 0,
        salaryAmount > 0
      );

      // Show success after a reasonable delay (10 seconds)
      setTimeout(() => {
        setIsManualLoading(false);
        setShowSuccessToast(true);

        // Hide success toast after 5 seconds
        setTimeout(() => {
          setShowSuccessToast(false);
        }, 5000);
      }, 10000);

      console.log("🎉 Transaction submitted successfully!");
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      // On error, stop loading immediately
      setIsManualLoading(false);
    }
  };

  const handleSliderChange = (type: keyof typeof splits, value: number) => {
    setSplits((prev) => {
      const newSplits = { ...prev };

      // Set the new value for the changed slider
      newSplits[type] = value;

      // Get the other two types
      const otherTypes = Object.keys(newSplits).filter((key) => key !== type) as Array<
        keyof typeof splits
      >;

      // Distribute the difference proportionally among the other sliders
      const otherTotal = otherTypes.reduce((sum, key) => sum + newSplits[key], 0);

      if (otherTotal > 0) {
        // Calculate how much to adjust each other slider
        const adjustmentRatio = Math.max(0, 100 - value) / otherTotal;

        otherTypes.forEach((key) => {
          newSplits[key] = Math.round(newSplits[key] * adjustmentRatio);
        });

        // Fine-tune to ensure exact 100% total
        const currentTotal = Object.values(newSplits).reduce((sum, val) => sum + val, 0);
        const finalAdjustment = 100 - currentTotal;

        // Apply any small adjustment to the largest other slider
        if (finalAdjustment !== 0) {
          const largestOtherType = otherTypes.reduce((max, key) =>
            newSplits[key] > newSplits[max] ? key : max
          );
          newSplits[largestOtherType] = Math.max(0, newSplits[largestOtherType] + finalAdjustment);
        }
      } else {
        // If other sliders are at 0, distribute remaining evenly
        const remainingPerSlider = Math.floor((100 - value) / otherTypes.length);
        const remainder = (100 - value) % otherTypes.length;

        otherTypes.forEach((key, index) => {
          newSplits[key] = remainingPerSlider + (index < remainder ? 1 : 0);
        });
      }

      return newSplits;
    });

    // Trigger floating animation
    triggerTokenAnimation(type);
  };

  const triggerTokenAnimation = (type: string) => {
    const newToken = {
      id: Date.now(),
      type: type,
      x: Math.random() * 300 + 50,
      y: Math.random() * 200 + 100,
    };

    setAnimatingTokens((prev) => [...prev, newToken]);

    // Remove token after animation
    setTimeout(() => {
      setAnimatingTokens((prev) => prev.filter((token) => token.id !== newToken.id));
    }, 2000);
  };

  const calculateAmount = (percentage: number) => {
    return ((salaryAmount * percentage) / 100).toFixed(2);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            <span data-editor-id="app/components/SplitPage.tsx:66:12">Split Your Salary</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            <span data-editor-id="app/components/SplitPage.tsx:69:12">
              Automatically allocate your salary across savings, DeFi investments, and spending.
              Drag the sliders to customize your split.
            </span>
          </p>
        </motion.div>

        {/* Salary Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-[#22C55E]/20"
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              <span data-editor-id="app/components/SplitPage.tsx:81:14">Monthly Salary Amount</span>
            </p>
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
              <Icon icon="cryptocurrency:flow" className="text-2xl text-blue-600" />
              <div className="flex-1">
                <input
                  type="number"
                  value={salaryAmount}
                  onChange={(e) => setSalaryAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  min="0"
                  step="0.1"
                  className="w-full text-2xl font-medium text-gray-900 text-center border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-[#22C55E] focus:outline-none transition-colors"
                  placeholder="100.0"
                />
              </div>
              <span className="text-2xl font-medium text-gray-900">FLOW</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enter the amount you want to split across your allocations
            </p>
          </div>
        </motion.div>

        {/* Split Controls */}
        <div className="grid gap-8 mb-8 relative overflow-hidden">
          {/* Floating Token Animations */}
          <AnimatePresence>
            {animatingTokens.map((token) => (
              <motion.div
                key={token.id}
                initial={{ opacity: 1, scale: 1, x: token.x, y: token.y }}
                animate={{
                  opacity: 0,
                  scale: 0.5,
                  x: token.x + (Math.random() - 0.5) * 100,
                  y: token.y - 100,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute pointer-events-none z-10"
              >
                <Icon
                  icon={
                    token.type === "savings"
                      ? "material-symbols:savings"
                      : token.type === "deFi"
                      ? "mdi:chart-line"
                      : "material-symbols:shopping-cart"
                  }
                  className={`text-3xl ${
                    token.type === "savings"
                      ? "text-green-500"
                      : token.type === "deFi"
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Savings Slider */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Icon icon="material-symbols:savings" className="text-2xl text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <span data-editor-id="app/components/SplitPage.tsx:127:20">Savings</span>
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Icon icon="cryptocurrency:flow" className="text-sm text-blue-600" />
                    <span data-editor-id="app/components/SplitPage.tsx:130:20">
                      {calculateAmount(splits.savings)} FLOW
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-green-600">{splits.savings}%</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="80"
              value={splits.savings}
              onChange={(e) => handleSliderChange("savings", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-green"
            />
          </motion.div>

          {/* DeFi Slider */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Icon icon="mdi:chart-line" className="text-2xl text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <span data-editor-id="app/components/SplitPage.tsx:159:20">
                      DeFi Investments
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Icon icon="cryptocurrency:flow" className="text-sm text-blue-600" />
                    <span data-editor-id="app/components/SplitPage.tsx:162:20">
                      {calculateAmount(splits.deFi)} FLOW
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-blue-600">{splits.deFi}%</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="50"
              value={splits.deFi}
              onChange={(e) => handleSliderChange("deFi", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-blue"
            />
          </motion.div>

          {/* Spending Slider */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="material-symbols:shopping-cart"
                    className="text-2xl text-yellow-600"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    <span data-editor-id="app/components/SplitPage.tsx:191:20">Spending</span>
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <Icon icon="cryptocurrency:flow" className="text-sm text-blue-600" />
                    <span data-editor-id="app/components/SplitPage.tsx:194:20">
                      {calculateAmount(splits.spending)} FLOW
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-semibold text-yellow-600">{splits.spending}%</span>
              </div>
            </div>

            <input
              type="range"
              min="5"
              max="60"
              value={splits.spending}
              onChange={(e) => handleSliderChange("spending", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-yellow"
            />
          </motion.div>
        </div>

        {/* Lock Vault Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Icon icon="material-symbols:lock" className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  <span data-editor-id="app/components/SplitPage.tsx:224:18">
                    Lock in Vault (30 days)
                  </span>
                </h3>
                <p className="text-sm text-gray-500">
                  <span data-editor-id="app/components/SplitPage.tsx:227:18">
                    Earn additional 2% APY on locked savings
                  </span>
                </p>
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLockVault(!isLockVault)}
              className={`relative w-16 h-8 rounded-full transition-colors duration-300 cursor-pointer ${
                isLockVault ? "bg-[#22C55E]" : "bg-gray-300"
              }`}
            >
              <motion.div
                animate={{ x: isLockVault ? 32 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
              />
            </motion.button>
          </div>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            <span data-editor-id="app/components/SplitPage.tsx:251:12">Summary</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-gray-900">{totalAllocated}%</p>
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/SplitPage.tsx:256:16">Allocated</span>
              </p>
            </div>
            <div className="text-center">
              <p
                className={`text-2xl font-semibold ${
                  remaining === 0
                    ? "text-green-600"
                    : remaining > 0
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {remaining}%
              </p>
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/SplitPage.tsx:263:16">
                  {remaining === 0 ? "Perfect!" : "Remaining"}
                </span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">15%</p>
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/SplitPage.tsx:268:16">Expected Yield</span>
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-purple-600">{isLockVault ? "30" : "0"}</p>
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/SplitPage.tsx:273:16">Lock Days</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Apply Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTransactionSubmit}
            disabled={
              isManualLoading || configPending || isLoading || remaining !== 0 || salaryAmount <= 0
            }
            className={`px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg flex items-center space-x-2 mx-auto ${
              isManualLoading || configPending || isLoading || remaining !== 0 || salaryAmount <= 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#22C55E] hover:bg-green-600 text-white cursor-pointer"
            }`}
          >
            {isManualLoading || configPending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>
                  {isManualLoading
                    ? "Processing on Flow Blockchain..."
                    : "Processing Transaction..."}
                </span>
              </>
            ) : (
              <>
                <Icon icon="cryptocurrency:flow" className="text-xl" />
                <span data-editor-id="app/components/SplitPage.tsx:330:16">
                  {salaryAmount <= 0
                    ? "Enter salary amount"
                    : remaining === 0
                    ? `Split ${salaryAmount.toFixed(1)} FLOW`
                    : remaining > 0
                    ? `Allocate remaining ${remaining}%`
                    : "Reduce allocation (Over 100%)"}
                </span>
              </>
            )}
          </motion.button>

          {salaryAmount <= 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-yellow-600 text-sm text-center mt-4"
            >
              Please enter a valid salary amount greater than 0 FLOW
            </motion.p>
          )}

          {remaining !== 0 && salaryAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm text-center mt-4 ${
                remaining > 0 ? "text-yellow-600" : "text-red-600"
              }`}
            >
              {remaining > 0
                ? `You have ${remaining}% unallocated. Please adjust your splits to total 100%.`
                : `You're over by ${Math.abs(
                    remaining
                  )}%. Please reduce your allocations to total 100%.`}
            </motion.p>
          )}

          {remaining === 0 && salaryAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 text-sm text-center mt-4"
            >
              Ready to split! Will deduct{" "}
              {((salaryAmount * (splits.savings + splits.deFi)) / 100).toFixed(2)} FLOW (keeping{" "}
              {((salaryAmount * splits.spending) / 100).toFixed(2)} FLOW for spending)
            </motion.p>
          )}

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center mt-2"
            >
              Error: {error.message}
            </motion.p>
          )}

          {/* Success Toast */}
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50"
            >
              <Icon icon="material-symbols:check-circle" className="text-2xl" />
              <div>
                <p className="font-semibold">Transaction Successful! 🎉</p>
                <p className="text-sm opacity-90">
                  Your {salaryAmount.toFixed(1)} FLOW has been split successfully
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      <style jsx>{`
        .slider-green::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #22c55e;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
        }

        .slider-blue::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }

        .slider-yellow::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f59e0b;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
        }
      `}</style>
    </div>
  );
}
