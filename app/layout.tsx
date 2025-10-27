import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./ClientLayout";

const primaryFont = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "Seflow - Auto-Grow Your Salary",
  description:
    "Split, Save, Earn Yields in 2 Minutes - Web3 budgeting for Indonesian professionals",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html data-editor-id="app/layout.tsx:27:5" lang="en" className={primaryFont.className}>
      <body
        data-editor-id="app/layout.tsx:31:7"
        className="antialiased"
        suppressHydrationWarning={true}
      >
        <main data-editor-id="app/layout.tsx:32:9" className="h-screen">
          <ClientLayout>{children}</ClientLayout>
        </main>
        {process.env.VISUAL_EDITOR_ACTIVE === "true" && (
          <script data-editor-id="app/layout.tsx:50:9" src="/editor.js" async />
        )}
      </body>
    </html>
  );
}
