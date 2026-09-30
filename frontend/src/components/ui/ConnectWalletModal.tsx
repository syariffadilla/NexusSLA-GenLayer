"use client";

import React, { useState } from "react";
import { useNexus } from "@/context/NexusContext";
import {
  Wallet,
  X,
  Shield,
  Briefcase,
  UserCheck,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Terminal,
  Loader2,
} from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connectWallet, switchAccount } = useNexus();
  const [customAddress, setCustomAddress] = useState("");
  const [connectingBrowser, setConnectingBrowser] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasEthereum = typeof window !== "undefined" && Boolean((window as unknown as { ethereum?: unknown }).ethereum);

  const handleBrowserConnect = async () => {
    setConnectingBrowser(true);
    setErrorMsg(null);
    try {
      await connectWallet();
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to connect browser wallet");
    } finally {
      setConnectingBrowser(false);
    }
  };

  const handleSelectRole = (role: "provider" | "client") => {
    switchAccount(role);
    onClose();
  };

  const handleCustomConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAddress.trim() || !customAddress.startsWith("0x")) {
      setErrorMsg("Please enter a valid Ethereum address starting with 0x");
      return;
    }
    switchAccount("custom", customAddress.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 leading-tight">
                Connect Wallet
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">
                GenLayer Studionet · Chain 42
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Option 1: Real Web3 Browser Wallet */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Live Web3 Wallet
            </div>

            <button
              onClick={handleBrowserConnect}
              disabled={connectingBrowser}
              className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/30 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  🦊
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Browser Extension (MetaMask / Rabby)
                  </div>
                  <div className="text-[11px] text-slate-500 font-light">
                    {hasEthereum ? "Wallet detected · Click to sign in" : "No extension detected (Install MetaMask)"}
                  </div>
                </div>
              </div>

              {connectingBrowser ? (
                <Loader2 size={16} className="animate-spin text-purple-600" />
              ) : (
                <ChevronRight size={14} className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              )}
            </button>
          </div>

          {/* Option 2: Developer Testing Preset Roles (Studionet Testing) */}
          <div className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold flex items-center justify-between">
              <span>Developer Test Roles</span>
              <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-mono">
                No Gas Required
              </span>
            </div>

            <div className="space-y-2">
              {/* Provider Role */}
              <button
                onClick={() => handleSelectRole("provider")}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <Shield size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Provider (Issuer / Staker)
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      0x34242f...634cB232 · 1.00 GEN Bond
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-slate-700" />
              </button>

              {/* Client Role */}
              <button
                onClick={() => handleSelectRole("client")}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Client (Subscriber / Claim Filer)
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      0x90e164...e04A3F9D5d · Files Outages
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-slate-700" />
              </button>
            </div>
          </div>

          {/* Option 3: Custom Address Input */}
          <form onSubmit={handleCustomConnect} className="pt-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
              Or Enter Any Custom Address
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <button
                type="submit"
                className="btn-portal-secondary text-xs px-3 py-1.5"
              >
                Connect
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-light">
          <span>Contract: 0x006a4d...</span>
          <a
            href="https://studio.genlayer.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1 no-underline"
          >
            <span>Studionet Explorer</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
