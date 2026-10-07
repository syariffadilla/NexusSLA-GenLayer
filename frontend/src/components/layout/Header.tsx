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
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react";

export function Header() {
  const {
    wallet,
    connectWallet,
    disconnectWallet,
    userRole,
    contractState,
    activeContractAddress,
    setActiveContractAddress,
    knownContracts,
    addKnownContract,
  } = useNexus();
  const { setIsMobileNavOpen } = useLayout();
  const [walletDropdown, setWalletDropdown] = useState(false);
  const [contractDropdown, setContractDropdown] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customAddressInput, setCustomAddressInput] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  const pending = contractState?.pending_claim as Record<string, unknown> | undefined;
  const hasPending = pending && Object.keys(pending).length > 0;

  const activeAgreement = knownContracts.find(
    (c) => c.address.toLowerCase() === activeContractAddress.toLowerCase()
  );

  const handleLoadCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    const trimmed = customAddressInput.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) {
      setCustomError("Enter a valid 40-character 0x address");
      return;
    }
    addKnownContract({
      address: trimmed,
      title: `Custom SLA (${trimmed.slice(0, 6)}...${trimmed.slice(-4)})`,
    });
    setCustomAddressInput("");
    setContractDropdown(false);
  };

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

          {/* Agreement / Contract Selector Pill */}
          <div className="relative">
            <button
              onClick={() => {
                setContractDropdown(!contractDropdown);
                setWalletDropdown(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200 cursor-pointer text-left"
              title={`Active Agreement: ${activeContractAddress}`}
            >
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <FileText size={11} />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 leading-none truncate max-w-[90px] sm:max-w-[130px]">
                  {activeAgreement?.title || "Active SLA"}
                </span>
                <span className="text-[9px] text-slate-500 mono leading-none mt-0.5 hidden xs:inline">
                  {activeContractAddress.slice(0, 4)}...{activeContractAddress.slice(-3)}
                </span>
              </div>
              <ChevronDown size={11} className="text-slate-400" />
            </button>

            {/* Agreement Selector Dropdown */}
            {contractDropdown && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setContractDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden p-4 animate-fade-in-up">
                  {/* Current Active Contract Summary */}
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Active SLA Agreement
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                        {contractState?.state || "LOADING"}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mb-1">
                      {activeAgreement?.title || "Custom SLA Agreement"}
                    </div>
                    <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <span className="mono text-[11px] text-slate-700 break-all select-all">
                        {activeContractAddress}
                      </span>
                      <CopyButton text={activeContractAddress} />
                    </div>

                    {/* Parties Summary */}
                    {contractState && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                        <div>
                          <span className="text-slate-400 block font-medium">Provider:</span>
                          <span className="mono font-semibold text-slate-700">
                            {contractState.provider ? `${contractState.provider.slice(0, 6)}...${contractState.provider.slice(-4)}` : "None"}
                          </span>
                          {wallet.address && contractState.provider?.toLowerCase() === wallet.address.toLowerCase() && (
                            <span className="ml-1 text-purple-600 font-bold">(You)</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium">Client:</span>
                          <span className="mono font-semibold text-slate-700">
                            {contractState.client ? `${contractState.client.slice(0, 6)}...${contractState.client.slice(-4)}` : "None"}
                          </span>
                          {wallet.address && contractState.client?.toLowerCase() === wallet.address.toLowerCase() && (
                            <span className="ml-1 text-indigo-600 font-bold">(You)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Saved / Available Agreements */}
                  <div className="py-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
                      Saved Agreements ({knownContracts.length})
                    </div>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {knownContracts.map((item) => {
                        const isActive =
                          item.address.toLowerCase() === activeContractAddress.toLowerCase();
                        return (
                          <button
                            key={item.address}
                            onClick={() => {
                              setActiveContractAddress(item.address);
                              setContractDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left border cursor-pointer transition-all ${
                              isActive
                                ? "bg-purple-50/70 border-purple-200 text-purple-900"
                                : "bg-white hover:bg-slate-50 border-slate-100 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <Layers size={13} className={isActive ? "text-purple-600" : "text-slate-400"} />
                              <div className="truncate">
                                <div className="text-xs font-semibold leading-tight truncate">
                                  {item.title}
                                </div>
                                <div className="mono text-[10px] text-slate-400 leading-tight">
                                  {item.address.slice(0, 8)}...{item.address.slice(-6)}
                                </div>
                              </div>
                            </div>
                            {isActive && <Check size={14} className="text-purple-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Load Custom Contract Address Form */}
                  <form onSubmit={handleLoadCustom} className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 px-1">
                      Load Contract Address
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={customAddressInput}
                        onChange={(e) => setCustomAddressInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 mono outline-none focus:border-purple-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1 border-none cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                    {customError && (
                      <p className="text-[10px] text-red-500 mt-1 px-1">{customError}</p>
                    )}
                  </form>

                  {/* Actions: Deploy New + Explorer */}
                  <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href="/sla/create"
                      onClick={() => setContractDropdown(false)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 no-underline"
                    >
                      <Plus size={13} />
                      Deploy New SLA
                    </Link>
                    <a
                      href={`${GENLAYER_EXPLORER_URL}/contracts/${activeContractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 no-underline"
                    >
                      Explorer
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Wallet Button / Account Switcher Pill */}
          {wallet.connected && wallet.address ? (
            <div className="relative">
              <button
                onClick={() => {
                  setWalletDropdown(!walletDropdown);
                  setContractDropdown(false);
                }}
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
                      <div className="text-[11px] text-slate-500 mt-1">
                        {userRole === "Provider"
                          ? "Designated Service Provider (Bond Depositor)"
                          : userRole === "Client"
                          ? "Designated Enterprise Client (Outage Claimant)"
                          : "Observer Account"}
                      </div>
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
