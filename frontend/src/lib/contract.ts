// --- Contract Integration Layer ----------------------------------------------
// Connects to the deployed NexusSLA contract on GenLayer Studio.
// Uses JSON-RPC calls to interact with the GenLayer node.

import type { ContractGetState } from "@/types/nexus-sla";

export const CONTRACT_ADDRESS = "0x006a4d15EC51F5cb1F7721A291429181db8D3519";
export const GENLAYER_EXPLORER_URL = "https://explorer-studio.genlayer.com";

// Fixed Official GenLayer Chain Configurations
export const GENLAYER_NETWORKS = {
  studionet: {
    name: "GenLayer Studionet",
    rpcUrl: "https://studio.genlayer.com/api",
    localRpcUrl: "http://localhost:4000/api",
    explorerUrl: "https://explorer-studio.genlayer.com",
    nativeCurrency: { name: "GenLayer Token", symbol: "GEN", decimals: 18 },
  },
  asimov: {
    name: "GenLayer Asimov Testnet",
    rpcUrl: "https://asimov.genlayer.com/api",
    explorerUrl: "https://explorer-asimov.genlayer.com",
    nativeCurrency: { name: "GenLayer Token", symbol: "GEN", decimals: 18 },
  },
  bradbury: {
    name: "GenLayer Bradbury Testnet",
    rpcUrl: "https://bradbury.genlayer.com/api",
    explorerUrl: "https://explorer-bradbury.genlayer.com",
    nativeCurrency: { name: "GenLayer Token", symbol: "GEN", decimals: 18 },
  },
} as const;

// Deployed Ecosystem Contracts on Studionet (referenced in uptime-rouge.vercel.app/sla-integration)
export const STUDIONET_CONTRACTS = {
  nexusSla: "0x006a4d15EC51F5cb1F7721A291429181db8D3519",
  slaVerifier: "0x8D926888B6781d9C987dB89693E771D702366D85",
  uptimeMonitor: "0x1AE5Eb9a7A1ece2E873689e0ED33b818dd2f2573",
  sla001: "0x2A3139E97262F25DFd0B039D55cdD99c1C192B36", // Matter Labs (ZKSync bridge)
  sla002: "0x90287aec8e7028EF57Ad58fb9060a7Bdb3D5d548", // GenLayer Foundation -> GenLayer Labs
} as const;

export let GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

export function setCustomRpcUrl(url: string) {
  if (url && url.trim()) {
    const trimmed = url.trim();
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        GENLAYER_RPC_URL = trimmed;
      }
    } catch {
      // Ignore malformed URL
    }
  }
}

export async function testRpcConnection(targetUrl?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  error?: string;
  isGenLayer?: boolean;
}> {
  const url = targetUrl || GENLAYER_RPC_URL;
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return {
      success: false,
      error: "Invalid protocol. Only http:// and https:// endpoints are permitted.",
    };
  }
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: [
          {
            to: CONTRACT_ADDRESS,
            data: { method: "get_state", args: [] },
          },
        ],
        id: Date.now(),
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - start;
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, latencyMs };
    }
    const data = await response.json();
    if (data.error) {
      return { success: false, error: data.error.message || "RPC returned error", latencyMs };
    }
    return { success: true, latencyMs, isGenLayer: true };
  } catch (err: unknown) {
    const latencyMs = Date.now() - start;
    const msg = err instanceof Error ? err.message : "Connection failed";
    return { success: false, error: msg, latencyMs };
  }
}

/**
 * Call a read method on the deployed contract via GenLayer JSON-RPC.
 */
async function callReadMethod<T>(
  method: string,
  args: unknown[] = [],
): Promise<T> {
  const response = await fetch(GENLAYER_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: [
        {
          to: CONTRACT_ADDRESS,
          data: { method, args },
        },
      ],
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Contract call failed");
  }

  return data.result as T;
}

/**
 * Call a write method on the deployed contract via GenLayer JSON-RPC.
 */
async function callWriteMethod(
  method: string,
  args: unknown[] = [],
  value: number = 0,
  fromAddress?: string,
): Promise<string> {
  const params: Record<string, unknown> = {
    to: CONTRACT_ADDRESS,
    data: { method, args },
  };

  if (value > 0) {
    params.value = value;
  }
  if (fromAddress) {
    params.from = fromAddress;
  }

  const response = await fetch(GENLAYER_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "send_transaction",
      params: [params],
      id: Date.now(),
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error.message || "Transaction failed");
  }

  return data.result as string;
}

// --- Contract Read Methods ---------------------------------------------------

export async function getContractState(): Promise<ContractGetState> {
  const raw = await callReadMethod<string>("get_state");
  return JSON.parse(raw);
}

export interface ContractConfig {
  bond_amount: number;
  start: number;
  end: number;
  evidence_domains: string[];
  tier_uptime_thresholds_bps: number[];
  tier_penalty_bps: number[];
}

export async function getContractConfig(): Promise<ContractConfig | null> {
  try {
    const raw = await callReadMethod<string>("get_config");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// --- Contract Write Methods --------------------------------------------------

export async function depositBond(fromAddress: string, bondAmountWei: number): Promise<string> {
  return callWriteMethod("deposit_bond", [], bondAmountWei, fromAddress);
}

export async function fileClaim(
  fromAddress: string,
  evidenceUrls: string[],
): Promise<string> {
  return callWriteMethod(
    "file_claim",
    [JSON.stringify(evidenceUrls)],
    0,
    fromAddress,
  );
}

export async function disputeClaim(
  fromAddress: string,
  evidenceUrls: string[],
): Promise<string> {
  return callWriteMethod(
    "dispute_claim",
    [JSON.stringify(evidenceUrls)],
    0,
    fromAddress,
  );
}

export async function finalizeClaim(fromAddress: string): Promise<string> {
  return callWriteMethod("finalize_claim", [], 0, fromAddress);
}

export async function withdrawRemainingBond(fromAddress: string): Promise<string> {
  return callWriteMethod("withdraw_remaining_bond", [], 0, fromAddress);
}
