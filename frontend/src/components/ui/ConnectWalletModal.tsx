"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNexus } from "@/context/NexusContext";
import { CONTRACT_ADDRESS, GENLAYER_EXPLORER_URL, ensureStudionetNetwork } from "@/lib/contract";
import { truncateAddress } from "@/lib/formatters";
import {
  X,
  ExternalLink,
  ChevronRight,
  Loader2,
  Shield,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalletItem {
  id: string;
  name: string;
  installUrl: string;
  icon: React.ReactNode;
}

const WALLET_LIST: WalletItem[] = [
  {
    id: "metamask",
    name: "MetaMask",
    installUrl: "https://metamask.io/download/",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 318.6 318.6" fill="none">
        <path
          d="M274.1 35.5l-99.5 73.9L193 65.8l81.1-30.3z"
          fill="#E2761B"
          stroke="#E2761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M44.5 35.5l81.1 30.3 18.4 43.6-99.5-73.9z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M238.3 206.8l-26.4 40.5 47.9 13.2 13.8-46.1-35.3-7.6z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M45 214.4l13.8 46.1 47.9-13.2-26.4-40.5-35.3 7.6z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M86.8 135.5l-19.4 29.3 48.6 2.1-1.7-52.6-27.5 21.2z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M231.8 135.5l-27.5-21.2-1.7 52.6 48.6-2.1-19.4-29.3z"
          fill="#E4761B"
          stroke="#E4761B"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M106.7 247.3l29.7-14.4-25.6-20-4.1 34.4z"
          fill="#D7C1B3"
          stroke="#D7C1B3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M182.2 232.9l29.7 14.4-4.1-34.4-25.6 20z"
          fill="#D7C1B3"
          stroke="#D7C1B3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M136.4 232.9l22.9-11.2 22.9 11.2-22.9 17.6-22.9-17.6z"
          fill="#233447"
          stroke="#233447"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M159.3 113.8l-18.4-43.6 18.4-14.7 18.4 14.7-18.4 43.6z"
          fill="#CD6116"
          stroke="#CD6116"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "rabby",
    name: "Rabby Wallet",
    installUrl: "https://rabby.io/",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#7084FF" />
        <path
          d="M20 10C15 10 11 14 11 19C11 23.5 14 27.2 18.2 28.5L16.5 32H23.5L21.8 28.5C26 27.2 29 23.5 29 19C29 14 25 10 20 10ZM16.5 18C15.7 18 15 17.3 15 16.5C15 15.7 15.7 15 16.5 15C17.3 15 18 15.7 18 16.5C18 17.3 17.3 18 16.5 18ZM23.5 18C22.7 18 22 17.3 22 16.5C22 15.7 22.7 15 23.5 15C24.3 15 25 15.7 25 16.5C25 17.3 24.3 18 23.5 18Z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    id: "okx",
    name: "OKX Wallet",
    installUrl: "https://www.okx.com/web3",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#000000" />
        <rect x="10" y="10" width="7" height="7" fill="white" />
        <rect x="23" y="10" width="7" height="7" fill="white" />
        <rect x="16.5" y="16.5" width="7" height="7" fill="white" />
        <rect x="10" y="23" width="7" height="7" fill="white" />
        <rect x="23" y="23" width="7" height="7" fill="white" />
      </svg>
    ),
  },
  {
    id: "phantom",
    name: "Phantom",
    installUrl: "https://phantom.app/",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#AB9FF2" />
        <path
          d="M12 20C12 15.58 15.58 12 20 12C24.42 12 28 15.58 28 20V26C28 27.1 27.1 28 26 28C25.4 28 24.9 27.7 24.5 27.3L22.5 24.7C22.1 24.3 21.6 24 21 24C20.4 24 19.9 24.3 19.5 24.7L17.5 27.3C17.1 27.7 16.6 28 16 28C14.9 28 14 27.1 14 26L12 20Z"
          fill="white"
        />
        <circle cx="18" cy="18" r="1.5" fill="#4B3F72" />
        <circle cx="23" cy="18" r="1.5" fill="#4B3F72" />
      </svg>
    ),
  },
  {
    id: "trust",
    name: "Trust Wallet",
    installUrl: "https://trustwallet.com/",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0500FF" />
        <path
          d="M20 11L13 14.5V21C13 25.5 16 29 20 30C24 29 27 25.5 27 21V14.5L20 11Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "coinbase",
    name: "Coinbase Wallet",
    installUrl: "https://www.coinbase.com/wallet",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="8" fill="#0052FF" />
        <circle cx="20" cy="20" r="10" fill="white" />
        <rect x="17" y="17" width="6" height="6" rx="1.5" fill="#0052FF" />
      </svg>
    ),
  },
];

interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: unknown;
}

export function ConnectWalletModal({ isOpen, onClose }: ConnectWalletModalProps) {
  const { connectWallet } = useNexus();
  const [mounted, setMounted] = useState(false);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [eip6963List, setEip6963List] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    setMounted(true);

    function onAnnounce(event: Event) {
      const customEvent = event as CustomEvent<EIP6963ProviderDetail>;
      if (!customEvent.detail) return;
      setEip6963List((prev) => {
        if (prev.some((p) => p.info.uuid === customEvent.detail.info.uuid)) return prev;
        return [...prev, customEvent.detail];
      });
    }

    if (typeof window !== "undefined") {
      window.addEventListener("eip6963:announceProvider", onAnnounce);
      window.dispatchEvent(new Event("eip6963:requestProvider"));
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("eip6963:announceProvider", onAnnounce);
      }
    };
  }, []);

  // Detect which wallet extensions are active in the browser
  const detectionMap = useMemo(() => {
    if (typeof window === "undefined") {
      return {} as Record<string, { detected: boolean; provider: unknown }>;
    }

    const win = window as unknown as {
      ethereum?: {
        isMetaMask?: boolean;
        isRabby?: boolean;
        isOkxWallet?: boolean;
        isPhantom?: boolean;
        isTrust?: boolean;
        isTrustWallet?: boolean;
        isCoinbaseWallet?: boolean;
        isBraveWallet?: boolean;
        providers?: Array<{
          isMetaMask?: boolean;
          isRabby?: boolean;
          isOkxWallet?: boolean;
          isPhantom?: boolean;
          isTrust?: boolean;
          isTrustWallet?: boolean;
          isCoinbaseWallet?: boolean;
          isBraveWallet?: boolean;
          request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        }>;
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
      rabby?: unknown;
      okxwallet?: unknown;
      phantom?: { ethereum?: unknown };
      trustwallet?: unknown;
      coinbaseWalletExtension?: unknown;
    };

    const eth = win.ethereum;
    const providers = Array.isArray(eth?.providers) ? eth.providers : eth ? [eth] : [];

    const findEip = (keyword: string) =>
      eip6963List.find(
        (p) =>
          p.info.rdns?.toLowerCase().includes(keyword) ||
          p.info.name?.toLowerCase().includes(keyword)
      )?.provider;

    // Rabby
    const rabbyProvider =
      findEip("rabby") ||
      win.rabby ||
      providers.find((p) => p.isRabby) ||
      (eth?.isRabby ? eth : null);

    // MetaMask: detected via EIP-6963, explicit MetaMask provider, or window.ethereum
    const metamaskProvider =
      findEip("metamask") ||
      providers.find((p) => p.isMetaMask && !p.isRabby) ||
      providers.find((p) => p.isMetaMask) ||
      (eth?.isMetaMask ? eth : null);

    // OKX
    const okxProvider =
      findEip("okx") ||
      findEip("okex") ||
      win.okxwallet ||
      providers.find((p) => p.isOkxWallet) ||
      (eth?.isOkxWallet ? eth : null);

    // Phantom
    const phantomProvider =
      findEip("phantom") ||
      win.phantom?.ethereum ||
      providers.find((p) => p.isPhantom) ||
      (eth?.isPhantom ? eth : null);

    // Trust
    const trustProvider =
      findEip("trust") ||
      win.trustwallet ||
      providers.find((p) => p.isTrust || p.isTrustWallet) ||
      (eth?.isTrust || eth?.isTrustWallet ? eth : null);

    // Coinbase
    const coinbaseProvider =
      findEip("coinbase") ||
      win.coinbaseWalletExtension ||
      providers.find((p) => p.isCoinbaseWallet) ||
      (eth?.isCoinbaseWallet ? eth : null);

    return {
      metamask: { detected: Boolean(metamaskProvider), provider: metamaskProvider },
      rabby: { detected: Boolean(rabbyProvider), provider: rabbyProvider },
      okx: { detected: Boolean(okxProvider), provider: okxProvider },
      phantom: { detected: Boolean(phantomProvider), provider: phantomProvider },
      trust: { detected: Boolean(trustProvider), provider: trustProvider },
      coinbase: { detected: Boolean(coinbaseProvider), provider: coinbaseProvider },
    };
  }, [mounted, isOpen, eip6963List]);

  if (!isOpen || !mounted) return null;

  const handleWalletClick = async (wallet: WalletItem) => {
    const detection = detectionMap[wallet.id];

    if (!detection?.detected || !detection.provider) {
      // Wallet is not installed: navigate to official install page
      window.open(wallet.installUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setConnectingId(wallet.id);
    setErrorMsg(null);

    try {
      const provider = detection.provider as {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };

      // 1. Request accounts
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts authorized in your wallet.");
      }

      // 2. Suggest / switch to GenLayer Studionet (Chain ID 61999 / 0xf22f)
      try {
        await ensureStudionetNetwork(provider);
      } catch (switchError: unknown) {
        console.warn("Could not switch to Studionet automatically during connect:", switchError);
      }

      // 3. Complete connection in context
      await connectWallet(provider);
      onClose();
    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setErrorMsg("Connection request was rejected in your wallet.");
      } else if (error.code === -32002) {
        setErrorMsg("A connection request is already pending in your wallet extension. Please open your extension popup.");
      } else {
        setErrorMsg(error.message || `Failed to connect with ${wallet.name}.`);
      }
    } finally {
      setConnectingId(null);
    }
  };

  const modalNode = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden z-10 my-auto flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0 bg-white">
          <div>
            <h3 className="text-base font-semibold text-slate-900 leading-tight">
              Connect wallet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose how you want to sign in. No transaction required.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center border-none bg-transparent cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body: Flat List of Wallets */}
        <div className="p-6 space-y-2.5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2 mb-3">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-semibold">Notice:</p>
                <p className="text-[11px] mt-0.5">{errorMsg}</p>
              </div>
            </div>
          )}

          {WALLET_LIST.map((wallet) => {
            const isDetected = Boolean(detectionMap[wallet.id]?.detected);
            const isConnecting = connectingId === wallet.id;

            return (
              <button
                key={wallet.id}
                onClick={() => handleWalletClick(wallet)}
                disabled={Boolean(connectingId)}
                className={`w-full p-3.5 rounded-xl border flex items-center justify-between gap-3 text-left transition-all cursor-pointer group ${
                  isDetected
                    ? "bg-white border-slate-200/90 hover:border-purple-500 hover:bg-purple-50/20 shadow-2xs"
                    : "bg-slate-50/60 border-slate-200/60 hover:bg-slate-100/70 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {wallet.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 group-hover:text-purple-700 transition-colors">
                      {wallet.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isDetected ? "Detected in this browser" : "Extension not detected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isConnecting ? (
                    <Loader2 size={16} className="animate-spin text-purple-600" />
                  ) : isDetected ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Ready
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200">
                      <span>Install</span>
                      <ArrowUpRight size={12} className="text-slate-400" />
                    </span>
                  )}
                  {isDetected && !isConnecting && (
                    <ChevronRight
                      size={15}
                      className="text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all"
                    />
                  )}
                </div>
              </button>
            );
          })}

          {/* Reassurance line */}
          <div className="pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2.5">
              <Shield size={14} className="text-purple-600 flex-shrink-0" />
              <span>
                Sign-in only. Connecting asks for a signature. It never moves funds or costs gas.
              </span>
            </div>
          </div>
        </div>

        {/* Footer info showing single configured contract */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between font-light flex-shrink-0">
          <span className="font-mono">
            Contract: {CONTRACT_ADDRESS ? truncateAddress(CONTRACT_ADDRESS) : "Not configured"}
          </span>
          {CONTRACT_ADDRESS && (
            <a
              href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center gap-1 no-underline"
            >
              <span>Studionet Explorer</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
