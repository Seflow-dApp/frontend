"use client";

import Navbar from "@/app/components/Navbar";
import SplitPage from "@/app/components/SplitPage";
import LoginPrompt from "@/app/components/LoginPrompt";
import Footer from "@/app/components/Footer";
import { useAuth } from "@/app/contexts/FlowAuthContext";

export default function SplitRoute() {
  const { isConnected } = useAuth();
  // Sample data starting from zero - users will configure their own splits
  const sampleData = {
    savings: 0,
    deFi: 0,
    spending: 0,
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
          <SplitPage
            initialData={{
              savings: sampleData.savings,
              deFi: sampleData.deFi,
              spending: sampleData.spending,
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
