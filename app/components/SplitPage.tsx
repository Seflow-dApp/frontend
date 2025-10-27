"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Icon } from "@iconify/react";

interface SplitPageProps {
  initialData?: {
    savings: number;
    deFi: number;
    spending: number;
  };
}

export default function SplitPage({
  initialData = { savings: 25, deFi: 15, spending: 10 },
}: SplitPageProps) {
  const [splits, setSplits] = useState(initialData);
  const [isLockVault, setIsLockVault] = useState(false);
  const [animatingTokens, setAnimatingTokens] = useState<
    Array<{ id: number; type: string; x: number; y: number }>
  >([]);
  const [salaryAmount] = useState(10000000); // 10 million IDR sample

  const totalAllocated = splits.savings + splits.deFi + splits.spending;
  const remaining = 100 - totalAllocated;

  const handleSliderChange = (type: keyof typeof splits, value: number) => {
    setSplits((prev) => ({ ...prev, [type]: value }));

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
    return ((salaryAmount * percentage) / 100).toLocaleString("id-ID");
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
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            <span data-editor-id="app/components/SplitPage.tsx:69:12">
              Automatically allocate your salary across savings, DeFi investments, and spending.
              Drag the sliders to customize your split.
            </span>
          </p>
        </motion.div>

        {/* Salary Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-[#22C55E]/20"
        >
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-2">
              <span data-editor-id="app/components/SplitPage.tsx:81:14">Monthly Salary</span>
            </p>
            <p className="text-3xl font-medium text-gray-900">
              <span data-editor-id="app/components/SplitPage.tsx:84:14">
                Rp {salaryAmount.toLocaleString("id-ID")}
              </span>
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
                  <p className="text-sm text-gray-500">
                    <span data-editor-id="app/components/SplitPage.tsx:130:20">
                      Rp {calculateAmount(splits.savings)}
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
                  <p className="text-sm text-gray-500">
                    <span data-editor-id="app/components/SplitPage.tsx:162:20">
                      Rp {calculateAmount(splits.deFi)}
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
                  <p className="text-sm text-gray-500">
                    <span data-editor-id="app/components/SplitPage.tsx:194:20">
                      Rp {calculateAmount(splits.spending)}
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
                  remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {remaining}%
              </p>
              <p className="text-sm text-gray-500">
                <span data-editor-id="app/components/SplitPage.tsx:263:16">Remaining</span>
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
            disabled={remaining < 0}
            className={`px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg ${
              remaining >= 0
                ? "bg-[#22C55E] hover:bg-green-600 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span data-editor-id="app/components/SplitPage.tsx:292:12">
              {remaining >= 0 ? "Apply Split Configuration" : "Adjust Allocation (Over 100%)"}
            </span>
          </motion.button>
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
