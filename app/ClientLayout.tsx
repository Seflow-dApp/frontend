"use client";

import { CosmicAnalyticsProvider } from "cosmic-analytics";
import { FlowProvider } from "@onflow/react-sdk";
import { FlowAuthProvider } from "@/app/contexts/FlowAuthContext";
import { FlowConfigProvider } from "@/app/components/FlowConfigProvider";
import flowJson from "../flow.json";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <FlowConfigProvider>
      <FlowProvider
        config={{
          accessNodeUrl: "https://rest-testnet.onflow.org",
          flowNetwork: "testnet",
          appDetailTitle: "Seflow",
          appDetailIcon: "https://seflow.app/icon.png",
          appDetailDescription: "Web3 Salary Management and DeFi Investment Made Simple",
          appDetailUrl: "http://localhost:3000",
        }}
        flowJson={flowJson}
      >
        <FlowAuthProvider>
          <CosmicAnalyticsProvider>{children}</CosmicAnalyticsProvider>
        </FlowAuthProvider>
      </FlowProvider>
    </FlowConfigProvider>
  );
}
