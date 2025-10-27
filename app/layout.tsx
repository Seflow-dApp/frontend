import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CosmicAnalyticsProvider } from "cosmic-analytics";
import { AuthProvider } from "@/app/contexts/AuthContext";

const primaryFont = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

// Change the title and description to your own.
export const metadata: Metadata = {
  title: "Seflow - Auto-Grow Your Salary",
  description:
    "Split, Save, Earn Yields in 2 Minutes - Web3 budgeting for Indonesian professionals",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-editor-id="app/layout.tsx:27:5" lang="en" className={primaryFont.className}>
      <body data-editor-id="app/layout.tsx:31:7" className="antialiased">
        <main data-editor-id="app/layout.tsx:32:9" className="h-screen">
          <AuthProvider>
            <CosmicAnalyticsProvider>{children}</CosmicAnalyticsProvider>
          </AuthProvider>
        </main>
        {process.env.VISUAL_EDITOR_ACTIVE === "true" && (
          <script data-editor-id="app/layout.tsx:50:9" src="/editor.js" async />
        )}
      </body>
    </html>
  );
}
