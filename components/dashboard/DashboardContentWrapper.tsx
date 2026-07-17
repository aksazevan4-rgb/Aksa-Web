"use client";

import { useSidebarCollapse } from "./SidebarCollapseContext";

/**
 * components/dashboard/DashboardContentWrapper.tsx
 * Replaces the old hardcoded `md:ml-64` on the content column — now the
 * margin follows the sidebar's real collapsed/expanded width.
 */
export function DashboardContentWrapper({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapse();

  return (
    <div
      className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
        collapsed ? "md:ml-16" : "md:ml-64"
      }`}
    >
      {children}
    </div>
  );
}
