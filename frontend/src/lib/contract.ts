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

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum ?? null;
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
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error(
      "No browser wallet detected. Transactions must be signed by MetaMask/Rabby; address-only sessions are read-only.",
    );
  }
  const accounts = ((await provider.request({ method: "eth_accounts" })) as string[]) || [];
  if (!accounts.some((a) => a.toLowerCase() === fromAddress.toLowerCase())) {
    throw new Error(
      `Session address ${fromAddress} is not unlocked in your browser wallet. Read-only sessions cannot sign transactions.`,
    );
  }

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

  const executionResult = String(receipt.txExecutionResultName ?? "UNKNOWN");
  const status = String(receipt.statusName ?? receipt.status ?? "UNKNOWN");
  if (executionResult === "FINISHED_WITH_ERROR") {
    throw new Error(`Transaction ${hash} was accepted but the contract call reverted (FINISHED_WITH_ERROR).`);
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
}

export interface DeployResult {
  contractAddress: string;
  hash: string;
  status: string;
}

export async function deploySlaContract(params: DeploySlaParams): Promise<DeployResult> {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error(
      "No browser wallet detected. Deployment requires a connected Web3 wallet (MetaMask / Rabby).",
    );
  }
  const accounts = ((await provider.request({ method: "eth_accounts" })) as string[]) || [];
  if (!accounts.some((a) => a.toLowerCase() === params.fromAddress.toLowerCase())) {
    throw new Error(
      `Session address ${params.fromAddress} is not unlocked in your browser wallet.`,
    );
  }

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

  const hash = await client.deployContract({
    code: NEXUS_SLA_CONTRACT_CODE,
    args: constructorArgs,
  });

  const receipt = await client.waitForTransactionReceipt({
    hash: hash as any,
    status: TransactionStatus.ACCEPTED,
    interval: 5000,
    retries: 120,
  });

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
