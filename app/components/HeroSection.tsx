"use client";

import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Icon } from "@iconify/react";

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const coinAnimationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (coinAnimationRef.current) {
      const coins = coinAnimationRef.current.querySelectorAll(".coin");

      // Set initial positions
      gsap.set(coins, { y: 50, opacity: 0, scale: 0 });

      // Create the coin stacking animation
      const timeline = gsap.timeline({ repeat: -1, repeatDelay: 2 });

      coins.forEach((coin, index) => {
        timeline.to(
          coin,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "bounce.out",
            delay: index * 0.2,
          },
          index * 0.2
        );
      });

      // Add floating animation
      timeline.to(
        coins,
        {
          y: "-=10",
          duration: 1.5,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
          stagger: 0.1,
        },
        "+=0.5"
      );

      // Reset for next cycle
      timeline.to(
        coins,
        {
          y: 50,
          opacity: 0,
          scale: 0,
          duration: 0.3,
          stagger: -0.1,
        },
        "+=1"
      );
    }
  }, []);

  return (
    <div className="min-h-screen pt-16 bg-white flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-light text-gray-900 mb-6 leading-tight"
          >
            <span data-editor-id="app/components/HeroSection.tsx:52:12">Seflow: Auto-Grow</span>
            <br />
            <span
              data-editor-id="app/components/HeroSection.tsx:54:12"
              className="text-[#22C55E] font-medium"
            >
              Your Salary
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-600 font-light mb-12 max-w-2xl mx-auto"
          >
            <span data-editor-id="app/components/HeroSection.tsx:63:12">
              Split, Save, Earn Yields in 2 Minutes
            </span>
          </motion.p>

          {/* Coin Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            ref={coinAnimationRef}
            className="relative h-48 mb-12 flex items-end justify-center"
          >
            <div className="relative">
              {/* Coins stack from bottom to top */}
              <div className="coin absolute bottom-0 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:coins" className="text-white text-2xl" />
                </div>
              </div>

              <div className="coin absolute bottom-8 left-1/2 transform -translate-x-1/2 -translate-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="material-symbols:savings" className="text-white text-2xl" />
                </div>
              </div>

              <div className="coin absolute bottom-16 left-1/2 transform -translate-x-1/2 translate-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="mdi:chart-line" className="text-white text-2xl" />
                </div>
              </div>

              <div className="coin absolute bottom-24 left-1/2 transform -translate-x-1/2 -translate-x-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="ri:coins-fill" className="text-white text-2xl" />
                </div>
              </div>

              <div className="coin absolute bottom-32 left-1/2 transform -translate-x-1/2 translate-x-2">
                <div className="w-16 h-16 bg-gradient-to-br from-[#22C55E] to-green-700 rounded-full flex items-center justify-center shadow-lg">
                  <Icon icon="material-symbols:wallet" className="text-white text-2xl" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-medium transition-all duration-300 shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <span data-editor-id="app/components/HeroSection.tsx:117:14">Start Splitting</span>
              <Icon icon="material-symbols:arrow-forward" className="text-xl" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-[#0F766E] hover:text-[#0d5a52] px-6 py-4 rounded-lg text-lg font-medium transition-colors flex items-center space-x-2 group cursor-pointer"
            >
              <Icon
                icon="material-symbols:play-circle"
                className="text-xl group-hover:scale-110 transition-transform"
              />
              <span data-editor-id="app/components/HeroSection.tsx:127:14">Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Icon icon="material-symbols:security" className="text-2xl text-[#22C55E]" />
              <span
                data-editor-id="app/components/HeroSection.tsx:139:14"
                className="text-sm font-medium"
              >
                Bank-level Security
              </span>
            </div>

            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Icon icon="material-symbols:flash-on" className="text-2xl text-[#22C55E]" />
              <span
                data-editor-id="app/components/HeroSection.tsx:144:14"
                className="text-sm font-medium"
              >
                2-Minute Setup
              </span>
            </div>

            <div className="flex items-center justify-center space-x-3 text-gray-600">
              <Icon icon="material-symbols:trending-up" className="text-2xl text-[#22C55E]" />
              <span
                data-editor-id="app/components/HeroSection.tsx:149:14"
                className="text-sm font-medium"
              >
                Average 15% Yields
              </span>
            </div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-20 bg-gray-50 rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                Trusted by Thousands
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Join the growing community of Indonesian professionals building wealth automatically
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "15%", label: "Average Annual Yield" },
                { value: "10K+", label: "Active Users" },
                { value: "$2M+", label: "Total Value Locked" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                    className="text-3xl md:text-4xl font-light text-[#22C55E] mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-sm md:text-base text-gray-600 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                Why Choose Seflow?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Built specifically for young Indonesian professionals who want to grow wealth
                effortlessly
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                {
                  icon: "material-symbols:flash-on",
                  title: "2-Minute Setup",
                  description:
                    "Get started with automated salary splitting in under 2 minutes. No complex configurations required.",
                  color: "text-yellow-500",
                  bg: "bg-yellow-50",
                },
                {
                  icon: "mdi:chart-line",
                  title: "Smart DeFi Yields",
                  description:
                    "Automatically invest in the best-performing DeFi protocols with risk management.",
                  color: "text-blue-500",
                  bg: "bg-blue-50",
                },
                {
                  icon: "material-symbols:savings",
                  title: "Automated Savings",
                  description:
                    "Never forget to save again. Your salary is automatically split according to your preferences.",
                  color: "text-[#22C55E]",
                  bg: "bg-green-50",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.8 + index * 0.1 }}
                  whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    className={`mx-auto w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                  >
                    <Icon icon={feature.icon} className={`text-2xl ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
