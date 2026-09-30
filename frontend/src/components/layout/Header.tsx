"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { useLayout } from "@/context/LayoutContext";
import { CopyButton, GenLayerLogo } from "@/components/ui/CoreComponents";
import { ConnectWalletModal } from "@/components/ui/ConnectWalletModal";
import { GENLAYER_EXPLORER_URL } from "@/lib/contract";
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  LogOut,
  ExternalLink,
  Wallet,
  Check,
  UserCheck,
  Menu,
} from "lucide-react";

export function Header() {
  const { wallet, connectWallet, disconnectWallet, switchAccount, userRole, contractState } = useNexus();
  const { setIsMobileNavOpen } = useLayout();
  const [walletDropdown, setWalletDropdown] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pending = contractState?.pending_claim as Record<string, unknown> | undefined;
  const hasPending = pending && Object.keys(pending).length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] h-14 sm:h-16 w-full">
      <div className="h-full px-3 sm:px-6 flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Left: Mobile Hamburger + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileNavOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200 flex items-center justify-center cursor-pointer"
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <Menu size={18} />
          </button>

          {/* Logo on Mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-1.5 no-underline">
            <GenLayerLogo size={20} fill="#0F172A" />
            <span className="font-extrabold text-sm text-slate-900 tracking-tight hidden xs:inline">
              NexusSLA
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-400 border border-transparent transition-all w-48 lg:w-64">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search SLA, claims, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Notification Alert Bell */}
          <Link
            href="/court"
            className="relative w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Adjudication Alerts"
          >
            <Bell size={16} />
            {hasPending && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </Link>

          {/* Wallet Button / Account Switcher Pill */}
          {wallet.connected && wallet.address ? (
            <div className="relative">
              <button
                onClick={() => setWalletDropdown(!walletDropdown)}
                className="flex items-center gap-1.5 px-2 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer text-left"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {userRole[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-800 leading-none">
                    {userRole}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 mono leading-none mt-0.5 hidden xs:inline">
                    {wallet.address.slice(0, 4)}...{wallet.address.slice(-3)}
                  </span>
                </div>
                <ChevronDown size={11} className="text-slate-400" />
              </button>

              {/* Wallet Dropdown & Switcher */}
              {walletDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setWalletDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-4 animate-fade-in-up">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Active Account
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                          {userRole}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="mono text-xs font-bold text-slate-800 break-all">
                          {wallet.address}
                        </span>
                        <CopyButton text={wallet.address} />
                      </div>
                    </div>

                    {/* Quick Switch Roles */}
                    <div className="py-3 border-b border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                        Switch SLA Role for Testing
                      </div>

                      <button
                        onClick={() => {
                          switchAccount("provider");
                          setWalletDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors border-none cursor-pointer ${
                          userRole === "Provider"
                            ? "bg-purple-50 text-purple-800 font-bold"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-purple-600" />
                          <span>Provider (0x3424...)</span>
                        </div>
                        {userRole === "Provider" && <Check size={14} className="text-purple-600" />}
                      </button>

                      <button
                        onClick={() => {
                          switchAccount("client");
                          setWalletDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors border-none cursor-pointer ${
                          userRole === "Client"
                            ? "bg-purple-50 text-purple-800 font-bold"
                            : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck size={14} className="text-purple-600" />
                          <span>Client (0x90e1...)</span>
                        </div>
                        {userRole === "Client" && <Check size={14} className="text-purple-600" />}
                      </button>

                      <button
                        onClick={() => {
                          connectWallet();
                          setWalletDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors border-none cursor-pointer"
                      >
                        <Wallet size={14} className="text-slate-500" />
                        <span>Browser Wallet</span>
                      </button>
                    </div>

                    <div className="pt-2 space-y-1">
                      <button
                        onClick={() => {
                          setWalletDropdown(false);
                          setIsConnectModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 text-left border-none bg-transparent cursor-pointer"
                      >
                        <Wallet size={13} className="text-purple-600" />
                        Switch / Connect Wallet
                      </button>
                      <a
                        href={`${GENLAYER_EXPLORER_URL}/address/${wallet.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 no-underline"
                      >
                        <ExternalLink size={13} />
                        View on Studio Explorer
                      </a>
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setWalletDropdown(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 text-left border-none bg-transparent cursor-pointer"
                      >
                        <LogOut size={13} />
                        Disconnect
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsConnectModalOpen(true)}
              className="btn-portal-primary text-xs"
              style={{ padding: "6px 14px" }}
            >
              <Wallet size={13} />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Primary Action Button: File Claim */}
          <Link
            href="/claims/new"
            className="btn-portal-secondary no-underline text-xs flex items-center gap-1.5"
            style={{ padding: "6px 12px" }}
          >
            <Plus size={13} />
            <span className="hidden xs:inline">File Claim</span>
          </Link>
        </div>
      </div>

      {/* Connect Wallet Modal */}
      <ConnectWalletModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
      />
    </header>
  );
}
