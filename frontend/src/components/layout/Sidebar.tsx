"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GenLayerLogo } from "@/components/ui/CoreComponents";
import { useNexus } from "@/context/NexusContext";
import { useLayout } from "@/context/LayoutContext";
import { truncateAddress } from "@/lib/formatters";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { ConnectWalletModal } from "@/components/ui/ConnectWalletModal";
import {
  LayoutDashboard,
  Shield,
  Scale,
  FileText,
  Search,
  PlusCircle,
  FileWarning,
  Coins,
  ChevronLeft,
  ChevronRight,
  Activity,
  X,
  BookOpen,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const {
    userRole,
    contractState,
    wallet,
    rpcStatus,
    refreshing,
    refreshState,
    disconnectWallet,
    activeContractAddress,
  } = useNexus();
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const {
    isMobileNavOpen,
    setIsMobileNavOpen,
    isDesktopCollapsed,
    toggleDesktopCollapse,
  } = useLayout();

  const pendingCount =
    contractState?.pending_claim && Object.keys(contractState.pending_claim).length > 0
      ? 1
      : 0;

  const protocolLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      label: "SLA Contracts",
      href: "/sla",
      icon: Shield,
      badge: contractState?.state === "ACTIVE" ? "1 Active" : contractState?.state,
    },
    {
      label: "Court Adjudications",
      href: "/court",
      icon: Scale,
      badge: pendingCount > 0 ? "Review" : undefined,
    },
    {
      label: "Claims & History",
      href: "/claims",
      icon: FileText,
      count: contractState?.history?.length ?? 0,
    },
    { label: "Contract Explorer", href: "/explorer", icon: Search },
    { label: "Documentation", href: "/docs", icon: BookOpen },
  ];

  const actionLinks = [
    { label: "Create SLA Agreement", href: "/sla/create", icon: PlusCircle },
    { label: "Deposit Collateral", href: "/sla/deposit", icon: Coins },
    { label: "File Outage Claim", href: "/claims/new", icon: FileWarning },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E2E8F0] flex flex-col transition-all duration-300 ease-in-out ${
          // Mobile state
          isMobileNavOpen
            ? "translate-x-0 w-72 shadow-2xl"
            : "-translate-x-full lg:translate-x-0"
        } ${
          // Desktop state
          isDesktopCollapsed ? "lg:w-16" : "lg:w-64"
        }`}
        style={{
          boxShadow: "1px 0 3px rgba(0,0,0,0.02)",
        }}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#F1F5F9] flex-shrink-0">
          <Link
            href="/dashboard"
            onClick={() => setIsMobileNavOpen(false)}
            className="flex items-center gap-2.5 no-underline overflow-hidden"
          >
            <GenLayerLogo size={24} fill="#0F172A" />
            {(!isDesktopCollapsed || isMobileNavOpen) && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#0F172A] leading-tight">
                  NexusSLA
                </span>
                <span className="text-[10px] font-semibold text-purple-600 tracking-wider uppercase">
                  Autonomous Court
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleDesktopCollapse}
            className="hidden lg:flex w-7 h-7 rounded-full items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileNavOpen(false)}
            className="lg:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Scroll Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Role / Wallet Badge Indicator */}
          {(!isDesktopCollapsed || isMobileNavOpen) && (
            <div className={`px-3 py-2.5 rounded-xl border text-xs transition-all ${
              wallet.connected 
                ? "bg-purple-50/70 border-purple-100" 
                : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {wallet.connected ? "Connected Role" : "Wallet Status"}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  wallet.connected 
                    ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]" 
                    : "bg-amber-400"
                }`} />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-slate-800">
                  {wallet.connected ? userRole : "Disconnected"}
                </span>
                {!wallet.connected ? (
                  <button
                    onClick={() => setIsConnectModalOpen(true)}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 bg-purple-100/80 hover:bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
                  >
                    Connect
                  </button>
                ) : (
                  <button
                    onClick={disconnectWallet}
                    className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors bg-transparent border-none cursor-pointer p-0"
                    title="Disconnect wallet"
                  >
                    Disconnect
                  </button>
                )}
              </div>
              {wallet.connected && wallet.address && (
                <div className="mt-1 pt-1.5 border-t border-purple-100/80">
                  <div className="text-[10px] font-mono text-slate-500 truncate" title={wallet.address}>
                    {truncateAddress(wallet.address, 6, 4)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Protocol Section */}
          <div>
            {(!isDesktopCollapsed || isMobileNavOpen) && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                SLA Protocol
              </div>
            )}
            <nav className="space-y-0.5">
              {protocolLinks.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-colors no-underline ${
                      active
                        ? "bg-slate-100 text-slate-900 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={isDesktopCollapsed && !isMobileNavOpen ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        size={16}
                        className={active ? "text-purple-600" : "text-slate-400"}
                      />
                      {(!isDesktopCollapsed || isMobileNavOpen) && <span>{item.label}</span>}
                    </div>
                    {(!isDesktopCollapsed || isMobileNavOpen) && item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">
                        {item.badge}
                      </span>
                    )}
                    {(!isDesktopCollapsed || isMobileNavOpen) && item.count !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
                        {item.count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Actions Section */}
          <div>
            {(!isDesktopCollapsed || isMobileNavOpen) && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
                Actions
              </div>
            )}
            <nav className="space-y-0.5">
              {actionLinks.map((item) => {
                const active = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors no-underline ${
                      active
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    title={isDesktopCollapsed && !isMobileNavOpen ? item.label : undefined}
                  >
                    <Icon size={16} className={active ? "text-purple-600" : "text-slate-400"} />
                    {(!isDesktopCollapsed || isMobileNavOpen) && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bottom Footer Section */}
        <div className="p-3 border-t border-[#F1F5F9] space-y-2 flex-shrink-0">
          {(!isDesktopCollapsed || isMobileNavOpen) && (
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
              <div className="text-[9px] font-bold uppercase text-slate-400">
                Active Contract
              </div>
              <div
                className="mono font-semibold text-slate-700 truncate"
                title={activeContractAddress || undefined}
              >
                {activeContractAddress ? truncateAddress(activeContractAddress, 8, 6) : "Not configured"}
              </div>
            </div>
          )}

          {/* Live RPC Status */}
          <div
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-[12px] font-medium text-slate-700 bg-slate-100"
            title={rpcStatus?.url || "GenLayer RPC"}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  rpcStatus?.connected
                    ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"
                    : "bg-amber-400"
                }`}
              />
              {(!isDesktopCollapsed || isMobileNavOpen) && (
                <span className="text-[11px]">
                  {rpcStatus?.connected ? "Live RPC" : "RPC Connecting"}
                </span>
              )}
            </div>
            {(!isDesktopCollapsed || isMobileNavOpen) && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white font-mono font-bold text-slate-700 shadow-2xs">
                {rpcStatus?.latencyMs != null ? `${rpcStatus.latencyMs}ms` : "Studionet"}
              </span>
            )}
          </div>
        </div>
      </aside>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </>
  );
}
