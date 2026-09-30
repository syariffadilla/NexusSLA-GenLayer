"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNexus } from "@/context/NexusContext";
import {
  Wallet,
  X,
  Shield,
  Briefcase,
  Zap,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  RefreshCw,
  Globe,
} from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connectWallet, switchAccount } = useNexus();
  const [mounted, setMounted] = useState(false);
  const [customAddress, setCustomAddress] = useState("");
  const [connectingBrowser, setConnectingBrowser] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const hasEthereum =
    typeof window !== "undefined" &&
    Boolean((window as unknown as { ethereum?: unknown }).ethereum);

  // 1. Browser Extension Connect (MetaMask / Rabby / Brave)
  const handleBrowserConnect = async () => {
    setConnectingBrowser(true);
    setErrorMsg(null);
    try {
      const eth = (window as unknown as {
        ethereum?: {
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
      }).ethereum;

      if (!eth) {
        throw new Error(
          "No Web3 browser extension found. Please use Instant Session Wallet or select a Developer Role below."
        );
      }

      // Request accounts
      const accounts = (await eth.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized in your wallet.");
      }

      // Try suggesting GenLayer Studionet (Chain ID 42)
      try {
        await eth.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x2a" }], // 42 in hex
        });
      } catch (switchError: unknown) {
        // If chain is not added (error code 4902), try adding it
        const errObj = switchError as { code?: number };
        if (errObj && errObj.code === 4902) {
          try {
            await eth.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x2a",
                  chainName: "GenLayer Studionet",
                  nativeCurrency: {
                    name: "GEN",
                    symbol: "GEN",
                    decimals: 18,
                  },
                  rpcUrls: ["https://studio.genlayer.com/rpc"],
                  blockExplorerUrls: ["https://studio.genlayer.com"],
                },
              ],
            });
          } catch {
            // Ignore if user cancels chain add
          }
        }
      }

      await connectWallet();
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setErrorMsg("Connection request was rejected in your wallet.");
      } else if (error.code === -32002) {
        setErrorMsg("A connection request is already pending in your wallet extension. Please open your extension popup.");
      } else {
        setErrorMsg(
          error.message ||
            "Failed to connect wallet. Try using Instant Session Wallet or a Developer Test Role."
        );
      }
    } finally {
      setConnectingBrowser(false);
    }
  };

  // 2. Instant Session / Burner Wallet (Zero extension required)
  const handleInstantSessionWallet = () => {
    // Generate a clean pseudo-random test address
    const randomHex = Array.from({ length: 40 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    const sessionAddr = `0x${randomHex}`;
    switchAccount("custom", sessionAddr);
    onClose();
  };

  // 3. Preset Developer Roles
  const handleSelectRole = (role: "provider" | "client") => {
    switchAccount(role);
    onClose();
  };

  // 4. Custom Address Connect
  const handleCustomConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customAddress.trim();
    if (!clean || !clean.startsWith("0x") || clean.length < 10) {
      setErrorMsg("Please enter a valid address starting with 0x (e.g. 0x3424...)");
      return;
    }
    switchAccount("custom", clean);
    onClose();
  };

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box (Centered & max-height protected) */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                Connect Wallet
              </h3>
              <p className="text-[11px] text-slate-500 font-light mt-0.5">
                GenLayer Studionet · Chain ID 42
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

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold">Notice:</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Option 1: Live Web3 Extension */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
              Live Web3 Extensions
            </div>

            <button
              onClick={handleBrowserConnect}
              disabled={connectingBrowser}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-purple-500 bg-white hover:bg-purple-50/20 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 text-orange-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  🦊
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Browser Extension (MetaMask / Rabby)
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {hasEthereum
                      ? "Extension ready · Click to connect & sign"
                      : "Extension not detected · Click to check"}
                  </div>
                </div>
              </div>

              {connectingBrowser ? (
                <Loader2 size={15} className="animate-spin text-purple-600" />
              ) : (
                <ChevronRight
                  size={14}
                  className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all"
                />
              )}
            </button>
          </div>

          {/* Option 2: Instant Session Wallet (Zero Setup / No Extension Needed) */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold flex items-center justify-between">
              <span>Instant Web3 Session</span>
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-mono font-medium">
                100% Reliable
              </span>
            </div>

            <button
              onClick={handleInstantSessionWallet}
              className="w-full p-3 rounded-xl border border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/70 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Zap size={15} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Generate Instant Session Wallet
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Zero extension needed · Works in any browser instantly
                  </div>
                </div>
              </div>
              <ChevronRight
                size={13}
                className="text-emerald-500 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all"
              />
            </button>
          </div>

          {/* Option 3: Developer Test Roles */}
          <div className="pt-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold flex items-center justify-between">
              <span>Developer & Judge Test Roles</span>
              <span className="text-[9px] text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded font-mono">
                No Gas Required
              </span>
            </div>

            <div className="space-y-2">
              {/* Provider Role */}
              <button
                onClick={() => handleSelectRole("provider")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/70 hover:bg-purple-50/30 flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <Shield size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Provider (Issuer / Staker)
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      0x34242f...B232 · 1.00 GEN Bond
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-purple-600" />
              </button>

              {/* Client Role */}
              <button
                onClick={() => handleSelectRole("client")}
                className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/70 hover:bg-blue-50/30 flex items-center justify-between gap-2.5 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-900">
                      Client (Subscriber / Claim Filer)
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      0x90e164...9D5d · Files Outage Claims
                    </div>
                  </div>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
          </div>

          {/* Option 4: Custom Address */}
          <form onSubmit={handleCustomConnect} className="pt-1">
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
                className="btn-portal-secondary text-xs px-3 py-1.5 whitespace-nowrap"
              >
                Connect
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-light flex-shrink-0">
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

  return createPortal(modalNode, document.body);
}
