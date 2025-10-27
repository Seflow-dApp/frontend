"use client";

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export default function AboutPage() {
  const features = [
    {
      icon: "material-symbols:flash-on",
      title: "2-Minute Setup",
      description:
        "Get started with automated salary splitting in under 2 minutes. No complex configurations required.",
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      icon: "material-symbols:security",
      title: "Bank-Level Security",
      description:
        "Your funds are protected with enterprise-grade security and smart contract audits.",
      color: "text-green-500",
      bg: "bg-green-50",
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
      icon: "material-symbols:smartphone",
      title: "Mobile-First Design",
      description: "Manage your finances on the go with our beautiful, intuitive mobile interface.",
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      icon: "material-symbols:savings",
      title: "Automated Savings",
      description:
        "Never forget to save again. Your salary is automatically split according to your preferences.",
      color: "text-[#22C55E]",
      bg: "bg-green-50",
    },
    {
      icon: "material-symbols:analytics",
      title: "Real-Time Analytics",
      description: "Track your wealth growth with detailed analytics and performance insights.",
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
  ];

  const stats = [
    { value: "15%", label: "Average Annual Yield" },
    { value: "10K+", label: "Active Users" },
    { value: "$2M+", label: "Total Value Locked" },
    { value: "99.9%", label: "Uptime" },
  ];

  return (
    <div className="min-h-screen pt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
            <span data-editor-id="app/components/AboutPage.tsx:71:12">Making Wealth Building</span>
            <br />
            <span
              data-editor-id="app/components/AboutPage.tsx:73:12"
              className="text-[#22C55E] font-medium"
            >
              Effortless for Everyone
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            <span data-editor-id="app/components/AboutPage.tsx:76:12">
              Seflow automates your financial growth by intelligently splitting your salary across
              savings, DeFi investments, and spending - so you can focus on living your best life
              while your money works for you.
            </span>
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-linear-to-br from-[#22C55E]/5 to-green-50 rounded-3xl p-8 md:p-12 mb-16"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-[#22C55E] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icon icon="material-symbols:eco" className="text-3xl text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 mb-4">
              <span data-editor-id="app/components/AboutPage.tsx:93:14">Our Mission</span>
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed">
              <span data-editor-id="app/components/AboutPage.tsx:96:14">
                To democratize wealth building for young Indonesian professionals by making
                sophisticated financial strategies accessible, automated, and stress-free. We
                believe everyone deserves to grow their wealth without needing to become a financial
                expert.
              </span>
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-3xl md:text-4xl font-light text-[#22C55E] mb-2"
              >
                {stat.value}
              </motion.div>
              <p className="text-sm md:text-base text-gray-600 font-medium">
                <span data-editor-id={`app/components/AboutPage.tsx:119:16:${index}`}>
                  {stat.label}
                </span>
              </p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              <span data-editor-id="app/components/AboutPage.tsx:132:14">Why Choose Seflow?</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              <span data-editor-id="app/components/AboutPage.tsx:135:14">
                Built specifically for the Indonesian market with features that matter to young
                professionals
              </span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ y: -5, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.1)" }}
                className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}
                >
                  <Icon icon={feature.icon} className={`text-2xl ${feature.color}`} />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">
                  <span data-editor-id={`app/components/AboutPage.tsx:151:18:${index}`}>
                    {feature.title}
                  </span>
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  <span data-editor-id={`app/components/AboutPage.tsx:154:18:${index}`}>
                    {feature.description}
                  </span>
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gray-50 rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl font-medium text-gray-900 mb-4">
            <span data-editor-id="app/components/AboutPage.tsx:209:12">
              Ready to Start Growing?
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            <span data-editor-id="app/components/AboutPage.tsx:212:12">
              Join thousands of Indonesian professionals who are already building wealth
              automatically with Seflow.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#22C55E] hover:bg-green-600 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all duration-300 shadow-lg flex items-center space-x-2 cursor-pointer"
            >
              <span data-editor-id="app/components/AboutPage.tsx:222:14">Get Started Now</span>
              <Icon icon="material-symbols:arrow-forward" className="text-xl" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-[#0F766E] hover:text-[#0d5a52] px-6 py-4 rounded-xl text-lg font-medium transition-colors flex items-center space-x-2 group cursor-pointer"
            >
              <Icon
                icon="material-symbols:mail"
                className="text-xl group-hover:scale-110 transition-transform"
              />
              <span data-editor-id="app/components/AboutPage.tsx:232:14">Contact Us</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
