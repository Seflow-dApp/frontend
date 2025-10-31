"use client";

import { useEffect } from "react";
import { initializeFlowTestnet } from "@/app/_shared/lib/flow-config";

interface FlowConfigProviderProps {
  children: React.ReactNode;
}

export function FlowConfigProvider({ children }: FlowConfigProviderProps) {
  useEffect(() => {
    initializeFlowTestnet();
  }, []);

  return <>{children}</>;
}
