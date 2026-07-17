"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface SidebarCollapseValue {
  collapsed: boolean;
  setCollapsed: (next: boolean) => void;
}

const SidebarCollapseContext = createContext<SidebarCollapseValue | null>(null);

const STORAGE_KEY = "aksa-sidebar-collapsed";

/**
 * components/dashboard/SidebarCollapseContext.tsx
 *
 * Previously the sidebar's collapsed/expanded state lived only inside
 * <DashboardSidebar> itself, while the main content wrapper in
 * app/dashboard/layout.tsx (a server component) hardcoded `md:ml-64` —
 * so collapsing the sidebar to its narrow 64px rail left a dead 192px gap
 * of empty space next to it instead of the content actually expanding.
 * This context lifts that one boolean up so both the sidebar AND the
 * content wrapper (DashboardContentWrapper) read/write the same state.
 * Persisted to localStorage so the choice survives a page reload.
 */
export function SidebarCollapseProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "1") setCollapsedState(true);
    } catch {
      // localStorage unavailable (e.g. privacy mode) — just fall back to default.
    }
  }, []);

  function setCollapsed(next: boolean) {
    setCollapsedState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      // best-effort only
    }
  }

  return (
    <SidebarCollapseContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarCollapseContext.Provider>
  );
}

export function useSidebarCollapse() {
  const ctx = useContext(SidebarCollapseContext);
  if (!ctx) {
    // Defensive fallback so a page rendered outside the provider (shouldn't
    // happen under app/dashboard/layout.tsx) doesn't crash — just behaves
    // as if the sidebar is always expanded.
    return { collapsed: false, setCollapsed: () => {} };
  }
  return ctx;
}
