"use client";

import Navbar from "@/app/_shared/components/Navbar";
import HeroSection from "@/app/_shared/components/HeroSection";
import Footer from "@/app/_shared/components/Footer";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/split");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <Navbar />
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
      </main>
      <Footer />
    </div>
  );
}
