"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

interface LayoutContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  isDesktopCollapsed: boolean;
  setIsDesktopCollapsed: (collapsed: boolean) => void;
  toggleDesktopCollapse: () => void;
}

const LayoutContext = createContext<LayoutContextType | null>(null);

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used inside LayoutProvider");
  return ctx;
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  const toggleDesktopCollapse = () => {
    setIsDesktopCollapsed((prev) => !prev);
  };

  return (
    <LayoutContext.Provider
      value={{
        isMobileNavOpen,
        setIsMobileNavOpen,
        isDesktopCollapsed,
        setIsDesktopCollapsed,
        toggleDesktopCollapse,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
