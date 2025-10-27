"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 404 Illustration */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-32 h-32 bg-[#22C55E] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Icon icon="material-symbols:search-off" className="text-white text-6xl" />
            </div>
          </motion.div>

          {/* Error Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Oops! The page you're looking for seems to have wandered off. 
              Don't worry, let's get you back to growing your wealth with Seflow!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <Icon icon="material-symbols:home" className="text-xl" />
                <span>Back to Home</span>
              </motion.button>
            </Link>

            <Link href="/split">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-[#0F766E] hover:text-[#0d5a52] px-6 py-4 rounded-xl text-lg font-medium transition-colors flex items-center space-x-2 group cursor-pointer"
              >
                <Icon
                  icon="lucide:split"
                  className="text-xl group-hover:scale-110 transition-transform"
                />
                <span>Start Splitting</span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex justify-center space-x-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              className="w-3 h-3 bg-[#22C55E] rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
              className="w-3 h-3 bg-[#0F766E] rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
              className="w-3 h-3 bg-[#1E3A8A] rounded-full"
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}