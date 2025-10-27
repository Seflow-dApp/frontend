"use client";

import Navbar from "@/app/components/Navbar";
import AboutPage from "@/app/components/AboutPage";
import Footer from "@/app/components/Footer";

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
