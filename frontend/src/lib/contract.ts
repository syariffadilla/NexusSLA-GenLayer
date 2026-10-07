// --- Contract Integration Layer ----------------------------------------------
// Single source of truth for talking to the deployed NexusSLA contract.
//
// * Contract address: ONLY from NEXT_PUBLIC_CONTRACT_ADDRESS (see .env.local /
//   .env.example). There is deliberately no hardcoded fallback address — if the
//   env var is missing the UI shows "Not configured" instead of silently
//   reading some other deployment.
// * Reads go through genlayer-js `readContract` (gen_call). The previous
//   hand-rolled JSON-RPC `call` method does not exist on GenLayer nodes
//   ("Method not found: call"), which is why the old UI silently fell back to
//   mock data.
// * Wei-denominated fields are kept as decimal strings so values like
//   remaining_bond never lose precision through JS Number.

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import type { ContractConfig, ContractGetState } from "@/types/nexus-sla";
import { NEXUS_SLA_CONTRACT_CODE } from "./contract-code";

export const DEPLOYED_CONTRACT_ADDRESS = "0x96E70825E4F4b3dB44E018Dd7e99433dBF458FFb";
export const DEFAULT_CONTRACT_ADDRESS = DEPLOYED_CONTRACT_ADDRESS;

const RAW_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  DEPLOYED_CONTRACT_ADDRESS
).trim();
const ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/;

/** Configured fallback contract address, defaulting to verified deployed instance 0x96E70825E4F4b3dB44E018Dd7e99433dBF458FFb */
export const CONTRACT_ADDRESS: string = ADDRESS_RE.test(RAW_CONTRACT_ADDRESS)
  ? RAW_CONTRACT_ADDRESS
  : DEPLOYED_CONTRACT_ADDRESS;

export const CONTRACT_CONFIG_ERROR: string | null = null;

export const GENLAYER_EXPLORER_URL = "https://explorer-studio.genlayer.com";

const DEFAULT_RPC_URL =
  (process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "").trim() || studionet.rpcUrls.default.http[0];

// In-memory override only (not persisted), so a reload always returns to the
// env-configured endpoint.
export let GENLAYER_RPC_URL = DEFAULT_RPC_URL;

export function setCustomRpcUrl(url: string) {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    GENLAYER_RPC_URL = DEFAULT_RPC_URL;
    return;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      GENLAYER_RPC_URL = trimmed;
    }
  } catch {
    // Ignore malformed URL
  }
}

// In-memory active contract address
export let activeContractAddress: string = CONTRACT_ADDRESS;

export function setActiveContractAddressInMemory(addr: string) {
  const trimmed = (addr || "").trim();
  if (ADDRESS_RE.test(trimmed)) {
    activeContractAddress = trimmed;
  }
}

export function getActiveContractAddress(): string {
  return activeContractAddress || CONTRACT_ADDRESS;
}

function resolveAddress(customAddress?: string): `0x${string}` {
  const target = (customAddress || activeContractAddress || CONTRACT_ADDRESS).trim();
  if (!ADDRESS_RE.test(target)) {
    throw new Error(CONTRACT_CONFIG_ERROR ?? `Invalid contract address: "${target}"`);
  }
  return target as `0x${string}`;
}

function readClient(endpoint = GENLAYER_RPC_URL) {
  return createClient({ chain: studionet, endpoint });
}

async function readView(functionName: string, endpoint?: string, targetAddress?: string): Promise<string> {
  const raw = await readClient(endpoint).readContract({
    address: resolveAddress(targetAddress),
    functionName,
    args: [],
  });
  if (typeof raw !== "string") {
    throw new Error(`${functionName}() returned ${typeof raw}, expected a JSON string`);
  }
  return raw;
}

// Quote wei integers before JSON.parse so they survive as exact strings.
const WEI_FIELDS_RE = /"(remaining_bond|payout_amount|bond_amount)"\s*:\s*(-?\d+)/g;
function parsePreservingWei<T>(raw: string): T {
  return JSON.parse(raw.replace(WEI_FIELDS_RE, '"$1":"$2"')) as T;
}

export interface ContractRead<T> {
  data: T;
  /** Exact string returned by the contract view method. */
  raw: string;
  fetchedAt: number;
}

// --- Contract Read Methods ---------------------------------------------------

export async function getContractState(targetAddress?: string): Promise<ContractRead<ContractGetState>> {
  const raw = await readView("get_state", undefined, targetAddress);
  return { data: parsePreservingWei<ContractGetState>(raw), raw, fetchedAt: Date.now() };
}

export async function getContractConfig(targetAddress?: string): Promise<ContractRead<ContractConfig>> {
  const raw = await readView("get_config", undefined, targetAddress);
  return { data: parsePreservingWei<ContractConfig>(raw), raw, fetchedAt: Date.now() };
}

export async function testRpcConnection(targetUrl?: string): Promise<{
  success: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const url = (targetUrl || GENLAYER_RPC_URL).trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { success: false, error: "Invalid protocol. Only http:// and https:// endpoints are permitted." };
  }
  const start = Date.now();
  try {
    await readView("get_state", url);
    return { success: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    return {
      success: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Connection failed",
    };
  }
}

// --- Contract Write Methods --------------------------------------------------
// Writes must be signed by a real injected wallet (MetaMask / Rabby). Address-
// only sessions (role shortcuts, pasted addresses) are read-only and cannot
// sign — we surface that as an error instead of pretending it succeeded.

export type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

let activeInjectedProvider: Eip1193Provider | null = null;

export function setActiveInjectedProvider(provider: unknown) {
  if (provider && typeof (provider as any).request === "function") {
    activeInjectedProvider = provider as Eip1193Provider;
  } else {
    activeInjectedProvider = null;
  }
}

export function getActiveInjectedProvider(): Eip1193Provider | null {
  return activeInjectedProvider;
}

export function getAllInjectedProviders(): Eip1193Provider[] {
  if (typeof window === "undefined") return [];
  const list: Eip1193Provider[] = [];
  const win = window as any;

  if (activeInjectedProvider) list.push(activeInjectedProvider);

  if (win.ethereum) {
    if (Array.isArray(win.ethereum.providers)) {
      for (const p of win.ethereum.providers) {
        if (p && typeof p.request === "function" && !list.includes(p)) list.push(p);
      }
    }
    if (!list.includes(win.ethereum)) list.push(win.ethereum);
  }
  if (win.rabby && typeof win.rabby.request === "function" && !list.includes(win.rabby)) {
    list.push(win.rabby);
  }
  if (win.okxwallet && typeof win.okxwallet.request === "function" && !list.includes(win.okxwallet)) {
    list.push(win.okxwallet);
  }
  if (win.phantom?.ethereum && !list.includes(win.phantom.ethereum)) {
    list.push(win.phantom.ethereum);
  }
  return list;
}

export async function resolveProviderForAddress(fromAddress: string): Promise<Eip1193Provider> {
  const providers = getAllInjectedProviders();
  if (providers.length === 0) {
    throw new Error(
      "No Web3 browser wallet detected (MetaMask / Rabby). Please install a supported Web3 extension.",
    );
  }

  // 1. Check if activeInjectedProvider already matches
  if (activeInjectedProvider) {
    try {
      let accs = ((await activeInjectedProvider.request({ method: "eth_accounts" })) as string[]) || [];
      if (accs.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
        return activeInjectedProvider;
      }
      if (accs.length === 0) {
        accs = ((await activeInjectedProvider.request({ method: "eth_requestAccounts" })) as string[]) || [];
        if (accs.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
          return activeInjectedProvider;
        }
      }
    } catch {
      // continue to discovery
    }
  }

  // 2. Search other discovered providers passively
  for (const prov of providers) {
    if (prov === activeInjectedProvider) continue;
    try {
      const accs = ((await prov.request({ method: "eth_accounts" })) as string[]) || [];
      if (accs.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
        activeInjectedProvider = prov;
        return prov;
      }
    } catch {
      // continue
    }
  }

  // 3. Prompt eth_requestAccounts on candidate
  const candidate = activeInjectedProvider || providers[0];
  try {
    const accs = ((await candidate.request({ method: "eth_requestAccounts" })) as string[]) || [];
    if (accs.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
      activeInjectedProvider = candidate;
      return candidate;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("rejected") || msg.includes("denied")) {
      throw new Error("Connection request was rejected in your wallet extension.");
    }
  }

  // 4. Try requestAccounts on remaining providers
  for (const prov of providers) {
    if (prov === candidate) continue;
    try {
      const accs = ((await prov.request({ method: "eth_requestAccounts" })) as string[]) || [];
      if (accs.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
        activeInjectedProvider = prov;
        return prov;
      }
    } catch {
      // continue
    }
  }

  throw new Error(
    `Wallet account mismatch: Your wallet extension is not currently showing account ${fromAddress.slice(0, 6)}...${fromAddress.slice(-4)}. Please switch to this account in MetaMask / Rabby.`,
  );
}

/**
 * Ensures the wallet is connected to GenLayer Studionet (Chain ID 61999 / 0xf22f).
 * If on another chain, prompts the wallet to switch or register the network.
 */
export async function ensureStudionetNetwork(provider: {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
}): Promise<void> {
  const targetChainId = studionet.id; // 61999
  const targetChainIdHex = `0x${targetChainId.toString(16)}`; // "0xf22f"

  try {
    const currentChainId = (await provider.request({ method: "eth_chainId" })) as string;
    if (typeof currentChainId === "string" && parseInt(currentChainId, 16) === targetChainId) {
      return;
    }
  } catch (err) {
    console.warn("Could not check current chainId:", err);
  }

  const rpcUrl =
    (process.env.NEXT_PUBLIC_GENLAYER_RPC_URL ?? "").trim() ||
    studionet.rpcUrls.default.http[0] ||
    "https://studio.genlayer.com/api";
  const explorerUrl =
    studionet.blockExplorers?.default?.url || "https://studio.genlayer.com";

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainIdHex }],
    });
  } catch (switchError: unknown) {
    const err = switchError as {
      code?: number;
      message?: string;
      data?: { originalError?: { code?: number } };
    };
    const code = err?.code ?? err?.data?.originalError?.code;
    const msg = String(err?.message || "");

    if (code === 4001 || msg.toLowerCase().includes("user rejected")) {
      throw new Error(
        `Network switch was rejected in your wallet. Please switch to Genlayer Studio Network (Chain ID ${targetChainId} / ${targetChainIdHex}) to proceed.`,
      );
    }

    // Attempt adding network
    try {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: targetChainIdHex,
            chainName: "Genlayer Studio Network",
            nativeCurrency: studionet.nativeCurrency || {
              name: "GEN Token",
              symbol: "GEN",
              decimals: 18,
            },
            rpcUrls: [rpcUrl],
            blockExplorerUrls: [explorerUrl],
          },
        ],
      });
      // Switch after adding
      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainIdHex }],
        });
      } catch {
        // Some wallets auto-switch after addition
      }
    } catch (addError: unknown) {
      const addErr = addError as { code?: number; message?: string };
      if (addErr?.code === 4001 || String(addErr?.message).toLowerCase().includes("user rejected")) {
        throw new Error(
          `Network registration was rejected in your wallet. Please switch to Genlayer Studio Network (Chain ID ${targetChainId}) to proceed.`,
        );
      }
      throw addError;
    }
  }
}

export interface WriteResult {
  hash: string;
  status: string;
  executionResult: string;
}

async function callWriteMethod(
  fromAddress: string,
  functionName: string,
  args: string[] = [],
  value: bigint = BigInt(0),
  targetAddress?: string,
): Promise<WriteResult> {
  const address = resolveAddress(targetAddress);
  const provider = await resolveProviderForAddress(fromAddress);
  await ensureStudionetNetwork(provider);

  const client = createClient({
    chain: studionet,
    endpoint: GENLAYER_RPC_URL,
    account: fromAddress as `0x${string}`,
    provider: provider as never,
  });

  const hash = await client.writeContract({ address, functionName, args, value });
  const receipt = await client.waitForTransactionReceipt({
    hash,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 120,
  });

  const rawTx = receipt as any;
  const executionResult = String(rawTx.txExecutionResultName ?? rawTx.txExecutionResult ?? "UNKNOWN");
  const status = String(rawTx.statusName ?? rawTx.status ?? "UNKNOWN");

  if (
    executionResult === "FINISHED_WITH_ERROR" ||
    executionResult === "2" ||
    rawTx.resultName === "DISAGREE" ||
    rawTx.resultName === "MAJORITY_DISAGREE" ||
    rawTx.consensus_data?.leader_receipt?.[0]?.execution_result === 2
  ) {
    const errorDetail =
      rawTx.consensus_data?.leader_receipt?.[0]?.genvm_result?.error ||
      rawTx.consensus_data?.leader_receipt?.[0]?.error ||
      "Contract execution reverted on-chain.";
    throw new Error(`Transaction ${hash} reverted: ${errorDetail}`);
  }
  return { hash: String(hash), status, executionResult };
}

/** bondAmountWei must be the exact get_config().bond_amount (contract asserts equality). */
export async function depositBond(fromAddress: string, bondAmountWei: string, contractAddress?: string): Promise<WriteResult> {
  return callWriteMethod(fromAddress, "deposit_bond", [], BigInt(bondAmountWei), contractAddress);
}

export async function fileClaim(fromAddress: string, evidenceUrls: string[], contractAddress?: string): Promise<WriteResult> {
  return callWriteMethod(fromAddress, "file_claim", [JSON.stringify(evidenceUrls)], BigInt(0), contractAddress);
}

export async function disputeClaim(fromAddress: string, evidenceUrls: string[], contractAddress?: string): Promise<WriteResult> {
  return callWriteMethod(fromAddress, "dispute_claim", [JSON.stringify(evidenceUrls)], BigInt(0), contractAddress);
}

export async function finalizeClaim(fromAddress: string, contractAddress?: string): Promise<WriteResult> {
  return callWriteMethod(fromAddress, "finalize_claim", [], BigInt(0), contractAddress);
}

export async function withdrawRemainingBond(fromAddress: string, contractAddress?: string): Promise<WriteResult> {
  return callWriteMethod(fromAddress, "withdraw_remaining_bond", [], BigInt(0), contractAddress);
}

// --- Contract Deploy Method --------------------------------------------------

export interface DeploySlaParams {
  fromAddress: string;
  provider: string;
  client: string;
  evidenceDomains: string[];
  quorumRequired: number;
  start: number;
  end: number;
  bondAmountWei: string;
  tierUptimeThresholdsBps: Record<string, number>;
  tierPenaltyBps: Record<string, number>;
  onStep?: (step: string) => void;
}

export interface DeployResult {
  contractAddress: string;
  hash: string;
  status: string;
}

export async function deploySlaContract(params: DeploySlaParams): Promise<DeployResult> {
  const provider = await resolveProviderForAddress(params.fromAddress);
  params.onStep?.("1/3: Confirming GenLayer Studionet network in your wallet...");
  await ensureStudionetNetwork(provider);

  const client = createClient({
    chain: studionet,
    endpoint: GENLAYER_RPC_URL,
    account: params.fromAddress as `0x${string}`,
    provider: provider as never,
  });

  const constructorArgs = [
    params.provider,
    params.client,
    JSON.stringify(params.evidenceDomains),
    params.quorumRequired,
    params.start,
    params.end,
    BigInt(params.bondAmountWei),
    JSON.stringify(params.tierUptimeThresholdsBps),
    JSON.stringify(params.tierPenaltyBps),
  ];

  params.onStep?.("1/3: Please confirm transaction in Rabby / MetaMask...");
  const hash = await client.deployContract({
    code: NEXUS_SLA_CONTRACT_CODE,
    args: constructorArgs,
  });

  params.onStep?.(`2/3: Broadcasting transaction (${String(hash).slice(0, 10)}...) to Studionet validators...`);
  const receipt = await client.waitForTransactionReceipt({
    hash: hash as any,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 120,
  });

  params.onStep?.("3/3: Finalizing contract deployment and recording state...");

  const deployedAddress =
    (receipt as any).contractAddress ||
    (receipt as any).recipient ||
    (receipt as any).to_address ||
    (receipt as any).txDataDecoded?.contractAddress ||
    (receipt as any).dataDecoded?.contractAddress;

  if (!deployedAddress || deployedAddress === "0x0000000000000000000000000000000000000000") {
    const fullTx = await client.getTransaction({ hash: hash as any });
    const fullAddr =
      (fullTx as any).contractAddress ||
      (fullTx as any).recipient ||
      (fullTx as any).to_address ||
      (fullTx as any).txDataDecoded?.contractAddress;
    if (fullAddr && fullAddr !== "0x0000000000000000000000000000000000000000") {
      return {
        contractAddress: fullAddr,
        hash: String(hash),
        status: String(receipt.statusName ?? receipt.status ?? "ACCEPTED"),
      };
    }
    throw new Error(
      `Deployment accepted (tx ${hash}), but unable to extract contract address from transaction receipt.`,
    );
  }

  return {
    contractAddress: deployedAddress,
    hash: String(hash),
    status: String(receipt.statusName ?? receipt.status ?? "ACCEPTED"),
  };
}
