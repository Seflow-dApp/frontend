"use client";

import Navbar from "@/app/_shared/components/Navbar";
import DashboardPage from "@/app/_shared/components/DashboardPage";
import LoginPrompt from "@/app/_shared/components/LoginPrompt";
import Footer from "@/app/_shared/components/Footer";
import { useAuth } from "@/app/_shared/contexts/FlowAuthContext";

export default function DashboardRoute() {
  const { isConnected } = useAuth();

  // Sample data matching the requirements
  const sampleData = {
    savings: 25,
    deFi: 15,
    spending: 10,
    yields: 0.15,
    froth: 1.5,
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <Navbar />
      <main>
        {!isConnected ? (
          <LoginPrompt />
        ) : (
          <DashboardPage
            data={{
              savings: sampleData.savings,
              deFi: sampleData.deFi,
              spending: sampleData.spending,
              yields: sampleData.yields,
              froth: sampleData.froth,
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
