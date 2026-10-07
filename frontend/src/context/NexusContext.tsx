"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type {
  ContractConfig,
  ContractGetState,
  TransactionState,
  WalletState,
} from "@/types/nexus-sla";
import {
  CONTRACT_CONFIG_ERROR,
  GENLAYER_RPC_URL,
  getContractConfig,
  getContractState,
  setCustomRpcUrl,
  testRpcConnection,
} from "@/lib/contract";

// NOTE: There is intentionally NO demo / mock mode. Every value exposed by this
// context is either the parsed result of a live readContract() call against
// NEXT_PUBLIC_CONTRACT_ADDRESS, or null (UI must render a skeleton / "Not
// available"). On RPC failure we clear state rather than fall back to fixtures.

export type UserRole = "Provider" | "Client" | "Auditor" | "Unknown" | "Disconnected";

export interface RpcStatusInfo {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  url: string;
}

interface NexusContextType {
  // Wallet
  wallet: WalletState;
  connectWallet: (specificProvider?: unknown) => Promise<void>;
  disconnectWallet: () => void;
  switchAccount: (role: "provider" | "client" | "custom", customAddress?: string) => void;
  userRole: UserRole;

  // Contract state — get_state()
  contractState: ContractGetState | null;
  stateRaw: string | null;
  // Contract config — get_config()
  contractConfig: ContractConfig | null;
  configRaw: string | null;
  configError: string | null;

  /** true until the first get_state() attempt resolves */
  loading: boolean;
  /** true while any refresh is in flight */
  refreshing: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  refreshState: () => Promise<void>;

  // RPC
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

const POLL_INTERVAL_MS = 30_000;

export function NexusProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    connecting: false,
  });

  const [contractState, setContractState] = useState<ContractGetState | null>(null);
  const [stateRaw, setStateRaw] = useState<string | null>(null);
  const [contractConfig, setContractConfig] = useState<ContractConfig | null>(null);
  const [configRaw, setConfigRaw] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(CONTRACT_CONFIG_ERROR);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [rpcUrl, setRpcUrlState] = useState(GENLAYER_RPC_URL);
  const [rpcStatus, setRpcStatus] = useState<RpcStatusInfo | null>(null);
  const [txState, setTxState] = useState<TransactionState | null>(null);

  // Restore saved session address / detect browser wallet on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedWallet = localStorage.getItem("nexussla_connected_wallet");
    if (savedWallet) {
      setWallet({ connected: true, address: savedWallet, connecting: false });
      return;
    }

    const eth = (window as unknown as {
      ethereum?: {
        request: (args: { method: string }) => Promise<string[]>;
        on?: (event: string, handler: (data: unknown) => void) => void;
      };
    }).ethereum;
    if (!eth) return;

    eth
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setWallet({ connected: true, address: accounts[0], connecting: false });
        }
      })
      .catch(() => {
        // Ignore
      });

    eth.on?.("accountsChanged", (accs: unknown) => {
      const accounts = accs as string[];
      if (accounts && accounts.length > 0) {
        setWallet({ connected: true, address: accounts[0], connecting: false });
        localStorage.setItem("nexussla_connected_wallet", accounts[0]);
      } else {
        setWallet({ connected: false, address: null, connecting: false });
        localStorage.removeItem("nexussla_connected_wallet");
      }
    });
  }, []);

  const setRpcUrl = useCallback((newUrl: string) => {
    setCustomRpcUrl(newUrl);
    setRpcUrlState(newUrl);
  }, []);

  const checkRpc = useCallback(
    async (testUrl?: string): Promise<RpcStatusInfo> => {
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
    },
    [rpcUrl],
  );

  // Fetch get_state() and get_config() from the live contract.
  const refreshState = useCallback(async () => {
    if (CONTRACT_CONFIG_ERROR) {
      setError(CONTRACT_CONFIG_ERROR);
      setLoading(false);
      return;
    }
    setRefreshing(true);
    const started = Date.now();

    const [stateRes, configRes] = await Promise.allSettled([
      getContractState(),
      getContractConfig(),
    ]);

    if (stateRes.status === "fulfilled") {
      setContractState(stateRes.value.data);
      setStateRaw(stateRes.value.raw);
      setLastFetchedAt(stateRes.value.fetchedAt);
      setError(null);
      setRpcStatus({ connected: true, latencyMs: Date.now() - started, url: rpcUrl });
    } else {
      const msg =
        stateRes.reason instanceof Error ? stateRes.reason.message : "Failed to read get_state()";
      // Do NOT keep stale data or substitute fixtures — clear it.
      setContractState(null);
      setStateRaw(null);
      setError(`get_state() failed via ${rpcUrl}: ${msg}`);
      setRpcStatus({ connected: false, error: msg, url: rpcUrl });
    }

    if (configRes.status === "fulfilled") {
      setContractConfig(configRes.value.data);
      setConfigRaw(configRes.value.raw);
      setConfigError(null);
    } else {
      setContractConfig(null);
      setConfigRaw(null);
      setConfigError(
        configRes.reason instanceof Error
          ? configRes.reason.message
          : "get_config() not available from current contract",
      );
    }

    setRefreshing(false);
    setLoading(false);
  }, [rpcUrl]);

  useEffect(() => {
    refreshState();
    const id = setInterval(refreshState, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refreshState]);

  // Connect a real injected browser wallet (MetaMask / Rabby / OKX / Phantom, etc.).
  const connectWallet = useCallback(async (specificProvider?: unknown) => {
    setWallet((prev) => ({ ...prev, connecting: true }));
    try {
      const eth = (specificProvider || (
        typeof window !== "undefined"
          ? (window as unknown as {
              ethereum?: { request: (args: { method: string }) => Promise<string[]> };
            }).ethereum
          : undefined
      )) as { request: (args: { method: string }) => Promise<string[]> } | undefined;

      if (eth) {
        const accounts = await eth.request({ method: "eth_requestAccounts" });
        if (accounts && accounts.length > 0) {
          setWallet({ connected: true, address: accounts[0], connecting: false });
          localStorage.setItem("nexussla_connected_wallet", accounts[0]);
          return;
        }
      }
      throw new Error("No Web3 wallet found. Please install a supported Web3 extension.");
    } catch (err) {
      setWallet({ connected: false, address: null, connecting: false });
      throw err;
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setWallet({ connected: false, address: null, connecting: false });
    if (typeof window !== "undefined") {
      localStorage.removeItem("nexussla_connected_wallet");
    }
  }, []);

  // Read-only address session. Provider/Client addresses come from the live
  // get_state() result — never from a hardcoded constant.
  const switchAccount = useCallback(
    (role: "provider" | "client" | "custom", customAddress?: string) => {
      let addr: string | undefined;
      if (role === "provider") addr = contractState?.provider;
      else if (role === "client") addr = contractState?.client;
      else addr = customAddress;
      if (!addr) {
        throw new Error(
          role === "custom"
            ? "No address provided"
            : `Cannot select ${role}: get_state() has not returned yet.`,
        );
      }
      setWallet({ connected: true, address: addr, connecting: false });
      if (typeof window !== "undefined") {
        localStorage.setItem("nexussla_connected_wallet", addr);
      }
    },
    [contractState],
  );

  const userRole: UserRole = (() => {
    if (!wallet.connected || !wallet.address) return "Disconnected";
    if (!contractState) return "Unknown";
    const current = wallet.address.toLowerCase();
    if (current === contractState.provider.toLowerCase()) return "Provider";
    if (current === contractState.client.toLowerCase()) return "Client";
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
        stateRaw,
        contractConfig,
        configRaw,
        configError,
        loading,
        refreshing,
        error,
        lastFetchedAt,
        refreshState,
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
