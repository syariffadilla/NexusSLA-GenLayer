"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { ContractGetState, TransactionState, WalletState } from "@/types/nexus-sla";
import { getContractState, setCustomRpcUrl, testRpcConnection, GENLAYER_RPC_URL } from "@/lib/contract";
import { DEMO_CONTRACT_STATE } from "@/lib/mock-data";

export type UserRole = "Provider" | "Client" | "Auditor" | "Disconnected";

export interface RpcStatusInfo {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  url: string;
}

interface NexusContextType {
  // Wallet
  wallet: WalletState;
  connectWallet: (targetAddress?: string) => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (role: "provider" | "client" | "custom", customAddress?: string) => void;
  userRole: UserRole;

  // Contract state
  contractState: ContractGetState | null;
  loading: boolean;
  error: string | null;
  refreshState: () => Promise<void>;

  // Demo / Live RPC mode
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  rpcUrl: string;
  setRpcUrl: (url: string) => void;
  rpcStatus: RpcStatusInfo | null;
  checkRpc: (testUrl?: string) => Promise<RpcStatusInfo>;

  // Transaction
  txState: TransactionState | null;
  setTxState: (s: TransactionState | null) => void;
}

const NexusContext = createContext<NexusContextType | null>(null);

export function useNexus() {
  const ctx = useContext(NexusContext);
  if (!ctx) throw new Error("useNexus must be used inside NexusProvider");
  return ctx;
}

const DEMO_PROVIDER_ADDRESS = "0x34242f09a2646eF4383C672b8a6BFDC9634cB232";
const DEMO_CLIENT_ADDRESS = "0x90e1644d995B2488d4a2Bf24b88D67e04A3F9D5d";

export function NexusProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    connecting: false,
  });

  const [contractState, setContractState] = useState<ContractGetState | null>(DEMO_CONTRACT_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(true);
  const [rpcUrl, setRpcUrlState] = useState(GENLAYER_RPC_URL);
  const [rpcStatus, setRpcStatus] = useState<RpcStatusInfo | null>(null);
  const [txState, setTxState] = useState<TransactionState | null>(null);

  // Check saved connection or browser wallet on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedWallet = localStorage.getItem("nexussla_connected_wallet");
      if (savedWallet) {
        setWallet({
          connected: true,
          address: savedWallet,
          connecting: false,
        });
        return;
      }

      const eth = (window as unknown as { ethereum?: {
        request: (args: { method: string }) => Promise<string[]>;
        on?: (event: string, handler: (data: unknown) => void) => void;
      } }).ethereum;

      if (eth) {
        eth
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            if (accounts && accounts.length > 0) {
              setWallet({
                connected: true,
                address: accounts[0],
                connecting: false,
              });
            }
          })
          .catch(() => {
            // Ignore
          });

        if (eth.on) {
          eth.on("accountsChanged", (accs: unknown) => {
            const accounts = accs as string[];
            if (accounts && accounts.length > 0) {
              setWallet({
                connected: true,
                address: accounts[0],
                connecting: false,
              });
              localStorage.setItem("nexussla_connected_wallet", accounts[0]);
            } else {
              setWallet({
                connected: false,
                address: null,
                connecting: false,
              });
              localStorage.removeItem("nexussla_connected_wallet");
            }
          });
        }
      }
    }
  }, []);

  const setRpcUrl = useCallback((newUrl: string) => {
    const trimmed = newUrl.trim();
    setRpcUrlState(trimmed);
    setCustomRpcUrl(trimmed);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nexussla_rpc_url", trimmed);
      } catch {
        // ignore
      }
    }
  }, []);

  const checkRpc = useCallback(async (testUrl?: string): Promise<RpcStatusInfo> => {
    const url = testUrl || rpcUrl;
    const res = await testRpcConnection(url);
    const info: RpcStatusInfo = {
      connected: res.success,
      latencyMs: res.latencyMs,
      error: res.error,
      url,
    };
    setRpcStatus(info);
    return info;
  }, [rpcUrl]);

  // Load persisted RPC URL if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("nexussla_rpc_url");
        if (saved) {
          setRpcUrlState(saved);
          setCustomRpcUrl(saved);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch contract state
  const refreshState = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (demoMode) {
      await new Promise((r) => setTimeout(r, 400));
      setContractState(DEMO_CONTRACT_STATE);
      setLoading(false);
      return;
    }

    try {
      const state = await getContractState();
      setContractState(state);
      setRpcStatus({
        connected: true,
        url: rpcUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch contract state";
      setError(
        `GenLayer RPC unreachable at ${rpcUrl}. (${msg}). Pastikan GenLayer node / Studio sedang berjalan atau gunakan Simulator / Demo Mode.`
      );
      setRpcStatus({
        connected: false,
        error: msg,
        url: rpcUrl,
      });
      // Fallback to demo state so UI doesn't break
      setContractState(DEMO_CONTRACT_STATE);
    } finally {
      setLoading(false);
    }
  }, [demoMode, rpcUrl]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  // Connect wallet
  const connectWallet = useCallback(async (targetAddress?: string) => {
    if (targetAddress) {
      const addr =
        targetAddress === "provider"
          ? DEMO_PROVIDER_ADDRESS
          : targetAddress === "client"
          ? DEMO_CLIENT_ADDRESS
          : targetAddress;
      setWallet({
        connected: true,
        address: addr,
        connecting: false,
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("nexussla_connected_wallet", addr);
      }
      return;
    }

    setWallet((prev) => ({ ...prev, connecting: true }));

    try {
      const eth =
        typeof window !== "undefined"
          ? (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum
          : undefined;

      if (eth) {
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWallet({
            connected: true,
            address: accounts[0],
            connecting: false,
          });
          if (typeof window !== "undefined") {
            localStorage.setItem("nexussla_connected_wallet", accounts[0]);
          }
          return;
        }
      }
      throw new Error("No Web3 wallet found. Please install MetaMask or select a Developer Test Role.");
    } catch (err) {
      setWallet({
        connected: false,
        address: null,
        connecting: false,
      });
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({ connected: false, address: null, connecting: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexussla_connected_wallet");
    }
  }, []);

  // Switch between accounts easily for testing/demo
  const switchAccount = useCallback((role: "provider" | "client" | "custom", customAddress?: string) => {
    let addr = DEMO_PROVIDER_ADDRESS;
    if (role === "provider") addr = DEMO_PROVIDER_ADDRESS;
    else if (role === "client") addr = DEMO_CLIENT_ADDRESS;
    else if (customAddress) addr = customAddress;

    setWallet({ connected: true, address: addr, connecting: false });
    if (typeof window !== "undefined") {
      localStorage.setItem("nexussla_connected_wallet", addr);
    }
  }, []);

  // Compute current user role
  const userRole: UserRole = (() => {
    if (!wallet.connected || !wallet.address) return "Disconnected";
    const current = wallet.address.toLowerCase();
    const provider = (contractState?.provider || DEMO_PROVIDER_ADDRESS).toLowerCase();
    const client = (contractState?.client || DEMO_CLIENT_ADDRESS).toLowerCase();

    if (current === provider) return "Provider";
    if (current === client) return "Client";
    return "Auditor";
  })();

  return (
    <NexusContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        switchAccount,
        userRole,
        contractState,
        loading,
        error,
        refreshState,
        demoMode,
        setDemoMode,
        rpcUrl,
        setRpcUrl,
        rpcStatus,
        checkRpc,
        txState,
        setTxState,
      }}
    >
      {children}
    </NexusContext.Provider>
  );
}
