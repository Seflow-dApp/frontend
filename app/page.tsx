"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import SplitPage from "@/app/components/SplitPage";
import DashboardPage from "@/app/components/DashboardPage";
import AboutPage from "@/app/components/AboutPage";
import LoginPrompt from "@/app/components/LoginPrompt";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/FlowAuthContext";

type ActiveTab = "home" | "split" | "dashboard" | "about";

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("home");
  const { isConnected } = useAuth();

  // Sample data matching the requirements
  const sampleData = {
    savings: 25,
    deFi: 15,
    spending: 10,
    yields: 0.15,
    froth: 1.5,
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as ActiveTab);
  };

  const handleGetStarted = () => {
    setActiveTab("split");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HeroSection onGetStarted={handleGetStarted} />;
      case "split":
        // Check if user is connected for Split page
        if (!isConnected) {
          return <LoginPrompt />;
        }
        return (
          <SplitPage
            initialData={{
              savings: sampleData.savings,
              deFi: sampleData.deFi,
              spending: sampleData.spending,
            }}
          />
        );
      case "dashboard":
        // Check if user is connected for Dashboard page
        if (!isConnected) {
          return <LoginPrompt />;
        }
        return <DashboardPage data={sampleData} />;
      case "about":
        return <AboutPage />;
      default:
        return <HeroSection onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="flex-1">{renderContent()}</div>
      <Footer />
    </div>
  );
}
