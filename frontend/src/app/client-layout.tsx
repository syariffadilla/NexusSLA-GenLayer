"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { NexusProvider } from "@/context/NexusContext";
import { LayoutProvider, useLayout } from "@/context/LayoutContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { BotWidget } from "@/components/ui/BotWidget";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const { isDesktopCollapsed } = useLayout();
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    // Official GenLayer Portal splash duration
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  if (isLanding) {
    return (
      <>
        {showSplash && (
          <div id="global-loader">
            <div className="genlayer-spinner large">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path
                  className="gl-path gl-center"
                  d="M 99,95 L 92,109 L 92,111 L 86,122 L 86,124 L 98,130 L 101,130 L 113,124 L 113,122 Z"
                />
                <path
                  className="gl-path gl-right"
                  d="M 107,28 L 107,77 L 132,128 L 130,132 L 109,142 L 174,167 Z"
                />
                <path
                  className="gl-path gl-left"
                  d="M 92,28 L 25,167 L 90,142 L 69,132 L 67,128 L 92,77 Z"
                />
              </svg>
            </div>
            <p>Loading Portal...</p>
          </div>
        )}
        <div className="min-h-screen bg-[#08090A] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
          {children}
          <BotWidget />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Official GenLayer Portal Initial Global Loader (Screenshot 1) */}
      {showSplash && (
        <div id="global-loader">
          <div className="genlayer-spinner large">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                className="gl-path gl-center"
                d="M 99,95 L 92,109 L 92,111 L 86,122 L 86,124 L 98,130 L 101,130 L 113,124 L 113,122 Z"
              />
              <path
                className="gl-path gl-right"
                d="M 107,28 L 107,77 L 132,128 L 130,132 L 109,142 L 174,167 Z"
              />
              <path
                className="gl-path gl-left"
                d="M 92,28 L 25,167 L 90,142 L 69,132 L 67,128 L 92,77 Z"
              />
            </svg>
          </div>
          <p>Loading Portal...</p>
        </div>
      )}

      {/* Main Responsive Layout Structure */}
      <div className="min-h-screen flex bg-[#F8FAFC]">
        {/* Responsive Sidebar (off-canvas on mobile, fixed on desktop) */}
        <Sidebar />

        {/* Content Wrapper — ml-0 on mobile, responsive ml on desktop */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            isDesktopCollapsed ? "lg:ml-16" : "lg:ml-64"
          } ml-0`}
        >
          {/* Top Sticky Header */}
          <Header />

          {/* Page Content with ambient pastel aurora glow & bottom padding */}
          <main className="flex-1 portal-aurora-bg pb-24">
            {children}
          </main>
        </div>

        {/* Cyber-cat floating concierge bot */}
        <BotWidget />
      </div>
    </>
  );
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <NexusProvider>
      <LayoutProvider>
        <LayoutContent>{children}</LayoutContent>
      </LayoutProvider>
    </NexusProvider>
  );
}
