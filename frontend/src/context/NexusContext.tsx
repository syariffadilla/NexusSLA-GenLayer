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
  CONTRACT_ADDRESS,
  DEFAULT_CONTRACT_ADDRESS,
  GENLAYER_RPC_URL,
  getContractConfig,
  getContractState,
  setActiveContractAddressInMemory,
  setCustomRpcUrl,
  testRpcConnection,
} from "@/lib/contract";

export type UserRole = "Provider" | "Client" | "Auditor" | "Unknown" | "Disconnected";

export interface RpcStatusInfo {
  connected: boolean;
  latencyMs?: number;
  error?: string;
  url: string;
}

export interface AgreementItem {
  address: string;
  title: string;
  provider?: string;
  client?: string;
  createdAt?: number;
}

const DEFAULT_KNOWN_CONTRACTS: AgreementItem[] = [
  {
    address: DEFAULT_CONTRACT_ADDRESS,
    title: "Benchmark SLA (Studio)",
    provider: "0xb70e5df6db91a26b6fece7a3c3069151eef3ea47",
    client: "0xb70e5df6db91a26b6fece7a3c3069151eef3ea48",
  },
];

const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

interface NexusContextType {
  // Wallet
  wallet: WalletState;
  connectWallet: (specificProvider?: unknown) => Promise<void>;
  disconnectWallet: () => void;
  userRole: UserRole;

  // Multi-Agreement Hub
  activeContractAddress: string;
  setActiveContractAddress: (addr: string) => void;
  knownContracts: AgreementItem[];
  addKnownContract: (item: AgreementItem) => void;
  removeKnownContract: (addr: string) => void;

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
  refreshState: (targetAddr?: string) => Promise<void>;

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

  // Active Contract State
  const [activeContractAddress, setActiveContractAddressState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlContract = new URLSearchParams(window.location.search).get("contract");
      if (urlContract && ADDRESS_RE.test(urlContract)) {
        setActiveContractAddressInMemory(urlContract);
        return urlContract;
      }
      const stored = localStorage.getItem("nexussla_active_contract");
      if (stored && ADDRESS_RE.test(stored)) {
        setActiveContractAddressInMemory(stored);
        return stored;
      }
    }
    setActiveContractAddressInMemory(CONTRACT_ADDRESS);
    return CONTRACT_ADDRESS;
  });

  const [knownContracts, setKnownContracts] = useState<AgreementItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("nexussla_known_contracts");
        if (stored) {
          const parsed = JSON.parse(stored) as AgreementItem[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure default contract is always included
            const hasDefault = parsed.some(
              (c) => c.address.toLowerCase() === DEFAULT_CONTRACT_ADDRESS.toLowerCase()
            );
            return hasDefault ? parsed : [...DEFAULT_KNOWN_CONTRACTS, ...parsed];
          }
        }
      } catch {
        // Ignore JSON error
      }
    }
    return DEFAULT_KNOWN_CONTRACTS;
  });

  const [contractState, setContractState] = useState<ContractGetState | null>(null);
  const [stateRaw, setStateRaw] = useState<string | null>(null);
  const [contractConfig, setContractConfig] = useState<ContractConfig | null>(null);
  const [configRaw, setConfigRaw] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number | null>(null);
  const [rpcUrl, setRpcUrlState] = useState(GENLAYER_RPC_URL);
  const [rpcStatus, setRpcStatus] = useState<RpcStatusInfo | null>(null);
  const [txState, setTxState] = useState<TransactionState | null>(null);

  // Switch Active Contract
  const setActiveContractAddress = useCallback((addr: string) => {
    const trimmed = (addr || "").trim();
    if (!ADDRESS_RE.test(trimmed)) return;
    setActiveContractAddressState(trimmed);
    setActiveContractAddressInMemory(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexussla_active_contract", trimmed);
      // Cleanly sync URL query without full page reload
      const url = new URL(window.location.href);
      url.searchParams.set("contract", trimmed);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  // Add Known Contract
  const addKnownContract = useCallback((item: AgreementItem) => {
    if (!ADDRESS_RE.test(item.address)) return;
    setKnownContracts((prev) => {
      const filtered = prev.filter(
        (c) => c.address.toLowerCase() !== item.address.toLowerCase()
      );
      const updated = [item, ...filtered];
      if (typeof window !== "undefined") {
        localStorage.setItem("nexussla_known_contracts", JSON.stringify(updated));
      }
      return updated;
    });
    setActiveContractAddress(item.address);
  }, [setActiveContractAddress]);

  // Remove Known Contract
  const removeKnownContract = useCallback((addr: string) => {
    setKnownContracts((prev) => {
      const updated = prev.filter(
        (c) => c.address.toLowerCase() !== addr.toLowerCase()
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("nexussla_known_contracts", JSON.stringify(updated));
      }
      return updated;
    });
  }, []);

  // Detect active browser wallet accounts on mount and on accountsChanged
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eth = (window as unknown as {
      ethereum?: {
        request: (args: { method: string }) => Promise<string[]>;
        on?: (event: string, handler: (data: unknown) => void) => void;
      };
    }).ethereum;

    if (eth) {
      eth
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts.length > 0) {
            setWallet({ connected: true, address: accounts[0], connecting: false });
          } else {
            setWallet({ connected: false, address: null, connecting: false });
            localStorage.removeItem("nexussla_connected_wallet");
          }
        })
        .catch(() => {
          setWallet({ connected: false, address: null, connecting: false });
        });

      eth.on?.("accountsChanged", (accs: unknown) => {
        const accounts = accs as string[];
        if (accounts && accounts.length > 0) {
          setWallet({ connected: true, address: accounts[0], connecting: false });
        } else {
          setWallet({ connected: false, address: null, connecting: false });
          localStorage.removeItem("nexussla_connected_wallet");
        }
      });
    } else {
      setWallet({ connected: false, address: null, connecting: false });
    }
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

  // Fetch get_state() and get_config() from the active contract.
  const refreshState = useCallback(async (targetAddr?: string) => {
    const effectiveAddr = (targetAddr || activeContractAddress || CONTRACT_ADDRESS).trim();
    if (!ADDRESS_RE.test(effectiveAddr)) {
      setError(`Invalid contract address: "${effectiveAddr}"`);
      setLoading(false);
      return;
    }

    setRefreshing(true);
    const started = Date.now();

    const [stateRes, configRes] = await Promise.allSettled([
      getContractState(effectiveAddr),
      getContractConfig(effectiveAddr),
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
      // Clear data to prevent rendering stale information
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
  }, [activeContractAddress, rpcUrl]);

  // Refresh whenever activeContractAddress or rpcUrl changes
  useEffect(() => {
    refreshState(activeContractAddress);
    const id = setInterval(() => refreshState(activeContractAddress), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeContractAddress, refreshState]);

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

  // Automated Role Detection based purely on connected wallet vs contract parties
  const userRole: UserRole = (() => {
    if (!wallet.connected || !wallet.address) return "Disconnected";
    if (!contractState) return "Unknown";
    const current = wallet.address.toLowerCase();
    if (contractState.provider && current === contractState.provider.toLowerCase()) return "Provider";
    if (contractState.client && current === contractState.client.toLowerCase()) return "Client";
    return "Auditor";
  })();

  return (
    <NexusContext.Provider
      value={{
        wallet,
        connectWallet,
        disconnectWallet,
        userRole,
        activeContractAddress,
        setActiveContractAddress,
        knownContracts,
        addKnownContract,
        removeKnownContract,
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
