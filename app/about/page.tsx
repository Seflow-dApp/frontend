"use client";

import Navbar from "@/app/_shared/components/Navbar";
import AboutPage from "@/app/_shared/components/AboutPage";
import Footer from "@/app/_shared/components/Footer";

export default function AboutRoute() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-50">
      <Navbar />
      <main>
        <AboutPage />
      </main>
      <Footer />
    </div>
  );
}
