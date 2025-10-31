"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useSeflowSalary } from "@/app/_shared/hooks/useSeflowContract";

interface SplitPageProps {
  initialData?: {
    savings: number;
    deFi: number;
    spending: number;
  };
}

export default function SplitPage({
  initialData = { savings: 0, deFi: 0, spending: 0 },
}: SplitPageProps) {
  const [splits, setSplits] = useState(initialData);
  const { setSplitConfig, isLoading, error, configPending } = useSeflowSalary();
  const [isLockVault, setIsLockVault] = useState(false);
  const [salaryAmount, setSalaryAmount] = useState(0); // Editable FLOW amount
  const [salaryInput, setSalaryInput] = useState(""); // Display value for input

  // Manual loading state management for better UX
  const [isManualLoading, setIsManualLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastTransactionTime, setLastTransactionTime] = useState<number | null>(null);

  const totalAllocated = splits.savings + splits.deFi + splits.spending;

  // Check if we're in cooldown period (10 seconds)
  const isInCooldown = lastTransactionTime && Date.now() - lastTransactionTime < 10000;
  const remaining = 100 - totalAllocated;

  // Handle transaction with manual loading and success states
  const handleTransactionSubmit = async () => {
    if (isInCooldown) {
      console.log("⏰ Transaction in cooldown period");
      setErrorMessage("Transaction in cooldown period");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
      return;
    }

    // Validate percentages must equal exactly 100%
    if (totalAllocated !== 100) {
      alert(`Percentages must sum to exactly 100%. Currently: ${totalAllocated}%`);
      return;
    }

    setIsManualLoading(true);

    try {
      // Execute the transaction and wait for real blockchain result
      const result = await setSplitConfig(
        salaryAmount, // amount: total FLOW amount
        splits.savings, // save: savings percentage
        splits.deFi, // lp: DeFi/LP percentage
        splits.spending, // spend: spending percentage
        isLockVault // vault: boolean for vault lock
      );

      // Only set cooldown time after successful transaction submission
      setLastTransactionTime(Date.now());

      // Show success only after transaction confirms on blockchain
      setIsManualLoading(false);
      setShowSuccessToast(true);

      // Hide success toast after 5 seconds
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);

      console.log("🎉 Transaction confirmed on blockchain!", result);
    } catch (error: any) {
      console.error("❌ Transaction failed:", error);
      setIsManualLoading(false);
      // Don't set cooldown time if transaction failed or was rejected

      // Handle different types of errors
      let errorMsg = "Transaction failed";
      if (error?.message) {
        if (
          error.message.includes("Signatures Declined") ||
          error.message.includes("User rejected")
        ) {
          errorMsg = "Signatures Declined: User rejected the request";
        } else {
          errorMsg = error.message;
        }
      }

      setErrorMessage(errorMsg);
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 5000);
    }
  };

  const handleSliderChange = (type: keyof typeof splits, value: number) => {
    setSplits((prev) => {
      const newSplits = { ...prev };

      // Set the new value for the changed slider
      newSplits[type] = value;

      // Get the current total after the change
      const currentTotal = Object.values(newSplits).reduce((sum, val) => sum + val, 0);

      // If total exceeds 100%, adjust other sliders proportionally down
      if (currentTotal > 100) {
        const excess = currentTotal - 100;
        const otherTypes = Object.keys(newSplits).filter((key) => key !== type) as Array<
          keyof typeof splits
        >;

        // Calculate total of other sliders
        const otherTotal = otherTypes.reduce((sum, key) => sum + newSplits[key], 0);

        if (otherTotal > 0) {
          // Reduce other sliders proportionally
          let remainingExcess = excess;
          otherTypes.forEach((key) => {
            const reduction = Math.min(newSplits[key], (newSplits[key] / otherTotal) * excess);
            newSplits[key] = Math.max(0, newSplits[key] - Math.round(reduction));
            remainingExcess -= reduction;
          });

          // Handle any remaining excess by reducing the largest other slider
          if (remainingExcess > 0) {
            const largestOtherType = otherTypes.reduce((max, key) =>
              newSplits[key] > newSplits[max] ? key : max
            );
            if (largestOtherType && newSplits[largestOtherType] > 0) {
              newSplits[largestOtherType] = Math.max(
                0,
                newSplits[largestOtherType] - Math.round(remainingExcess)
              );
            }
          }
        }

        // If other sliders can't accommodate, reduce the current slider
        const finalTotal = Object.values(newSplits).reduce((sum, val) => sum + val, 0);
        if (finalTotal > 100) {
          newSplits[type] = Math.max(0, newSplits[type] - (finalTotal - 100));
        }
      }

      return newSplits;
    });
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
            <h3 className="text-sm font-medium text-gray-600 mb-4 text-center tracking-wide uppercase">
              Monthly Salary Amount
            </h3>
            <div className="flex items-center justify-center space-x-4 max-w-md mx-auto">
              <Icon icon="cryptocurrency:flow" className="text-2xl text-blue-600" />
              <div className="flex-1">
                <input
                  type="text"
                  value={salaryInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, numbers, and decimal point
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setSalaryInput(value);
                      const numValue = parseFloat(value) || 0;
                      setSalaryAmount(Math.max(0, numValue));
                    }
                  }}
                  onBlur={() => {
                    // Clean up the display when losing focus
                    if (salaryAmount === 0 || salaryInput === "" || salaryInput === "0") {
                      setSalaryInput("");
                    } else {
                      // Ensure the display shows a clean number format
                      setSalaryInput(salaryAmount.toString());
                    }
                  }}
                  className="w-full text-2xl font-medium text-gray-900 text-center border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-[#22C55E] focus:outline-none transition-colors"
                  placeholder="0.0"
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
                    <span data-editor-id="app/components/SplitPage.tsx:127:20">
                      Savings (Vault)
                    </span>
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
                <div className="flex items-center space-x-1 group">
                  <input
                    type="text"
                    value={splits.savings}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*$/.test(value)) {
                        const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                        handleSliderChange("savings", numValue);
                      }
                    }}
                    className="w-16 text-2xl font-semibold text-green-600 text-right bg-green-50/50 border border-green-200/50 outline-none focus:bg-green-50 focus:border-green-400 hover:border-green-300 rounded-md px-2 py-1 transition-all duration-200 cursor-text"
                    maxLength={3}
                    title="Click to edit percentage"
                  />
                  <span className="text-2xl font-semibold text-green-600">%</span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
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
                      DeFi Investments (Liquidity Pool)
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
                <div className="flex items-center space-x-1 group">
                  <input
                    type="text"
                    value={splits.deFi}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*$/.test(value)) {
                        const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                        handleSliderChange("deFi", numValue);
                      }
                    }}
                    className="w-16 text-2xl font-semibold text-blue-600 text-right bg-blue-50/50 border border-blue-200/50 outline-none focus:bg-blue-50 focus:border-blue-400 hover:border-blue-300 rounded-md px-2 py-1 transition-all duration-200 cursor-text"
                    maxLength={3}
                    title="Click to edit percentage"
                  />
                  <span className="text-2xl font-semibold text-blue-600">%</span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
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
                    <span data-editor-id="app/components/SplitPage.tsx:191:20">
                      Spending (Wallet)
                    </span>
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
                <div className="flex items-center space-x-1 group">
                  <input
                    type="text"
                    value={splits.spending}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*$/.test(value)) {
                        const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
                        handleSliderChange("spending", numValue);
                      }
                    }}
                    className="w-16 text-2xl font-semibold text-yellow-600 text-right bg-yellow-50/50 border border-yellow-200/50 outline-none focus:bg-yellow-50 focus:border-yellow-400 hover:border-yellow-300 rounded-md px-2 py-1 transition-all duration-200 cursor-text"
                    maxLength={3}
                    title="Click to edit percentage"
                  />
                  <span className="text-2xl font-semibold text-yellow-600">%</span>
                </div>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
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

        {/* FROTH Rewards Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 mb-8 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-linear-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Icon icon="material-symbols:token" className="text-2xl text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <span>FROTH Rewards</span>
                  <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                    NEW
                  </span>
                </h3>
                <p className="text-sm text-gray-600">
                  Earn FROTH tokens for every salary split transaction
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <Icon icon="material-symbols:lock-open" className="text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Standard Split</span>
              </div>
              <p className="text-lg font-semibold text-purple-600">
                {(salaryAmount * 0.01).toFixed(2)} FROTH
              </p>
              <p className="text-xs text-gray-500">1% of salary amount</p>
            </div>

            <div className="bg-white/70 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <Icon icon="material-symbols:lock" className="text-purple-500" />
                <span className="text-sm font-medium text-gray-700">Vault Locked</span>
              </div>
              <p className="text-lg font-semibold text-purple-600">
                {(salaryAmount * 0.015).toFixed(2)} FROTH
              </p>
              <p className="text-xs text-gray-500">1.5% of salary amount</p>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-purple-100">
            <p className="text-sm text-gray-600 flex items-center space-x-2">
              <Icon icon="material-symbols:info" className="text-purple-500" />
              <span>
                You will earn{" "}
                <strong className="text-purple-600">
                  {(salaryAmount * (isLockVault ? 0.015 : 0.01)).toFixed(2)} FROTH
                </strong>{" "}
                for this transaction
              </span>
            </p>
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
              isManualLoading ||
              configPending ||
              isLoading ||
              salaryAmount <= 0 ||
              totalAllocated !== 100 ||
              isInCooldown
            }
            className={`px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg flex items-center space-x-2 mx-auto ${
              isManualLoading ||
              configPending ||
              isLoading ||
              salaryAmount <= 0 ||
              totalAllocated !== 100 ||
              isInCooldown
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
                    : totalAllocated !== 100
                    ? `Allocate ${100 - totalAllocated}% more to reach 100%`
                    : isInCooldown
                    ? "Transaction in cooldown period"
                    : `Split ${salaryAmount.toFixed(1)} FLOW`}
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

          {totalAllocated !== 100 && salaryAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-sm text-center mt-4 ${
                totalAllocated === 0
                  ? "text-yellow-600"
                  : remaining > 0
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              {totalAllocated === 0
                ? "Please set your allocation percentages using the sliders above"
                : remaining > 0
                ? `You need to allocate ${remaining}% more to reach 100%`
                : `You're over by ${Math.abs(
                    remaining
                  )}%. Please reduce your allocations to total 100%`}
            </motion.p>
          )}

          {totalAllocated === 100 && salaryAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 text-sm text-center mt-4"
            >
              Perfect! All ${salaryAmount.toFixed(1)} FLOW will be allocated across your splits.
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

          {/* Error Toast */}
          {showErrorToast && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-20 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 z-50"
            >
              <Icon icon="material-symbols:error" className="text-2xl" />
              <div>
                <p className="font-semibold">Transaction Failed! ❌</p>
                <p className="text-sm opacity-90">{errorMessage}</p>
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
