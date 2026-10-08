// --- Contract Types ----------------------------------------------------------

export type ContractState =
  | "UNINITIALIZED"
  | "ACTIVE"
  | "CLAIM_PENDING"
  | "DISPUTE_WINDOW"
  | "CLOSED";

export type ClaimStatus =
  | "ACTIVE"
  | "PENDING"
  | "DISPUTED"
  | "SETTLED"
  | "DISMISSED";

export type ImpactLevel = "major" | "minor" | "none";

export interface PendingClaim {
  incident_id: string;
  filed_at: number;
  dispute_deadline?: number;
  incident_start?: number;
  incident_end?: number;
  impact: ImpactLevel;
  duration_minutes: number;
  penalty_bps: number;
  /** wei, exact decimal string */
  payout_amount: string;
  sources_agreeing: number;
  disputed: boolean;
  finalized: boolean;
}

export interface ClaimHistoryEntry {
  incident_id?: string;
  filed_at?: number;
  impact?: ImpactLevel;
  duration_minutes?: number;
  penalty_bps?: number;
  /** wei, exact decimal string */
  payout_amount?: string;
  sources_agreeing?: number;
  disputed?: boolean;
  finalized?: boolean;
  status?: string;
  reason?: string;
  evidence_provided?: string[];
}

export interface ContractGetState {
  state: ContractState;
  provider: string;
  client: string;
  /** wei, exact decimal string */
  remaining_bond: string;
  quorum_required: number;
  pending_claim: PendingClaim | Record<string, never>;
  history: ClaimHistoryEntry[];
}

/** Exact shape returned by get_config(). */
export interface ContractConfig {
  /** wei, exact decimal string */
  bond_amount: string;
  start: number;
  end: number;
  dispute_period_seconds?: number;
  evidence_domains: string[];
  tier_uptime_thresholds_bps: number[];
  tier_penalty_bps: number[];
}

// --- UI Types ----------------------------------------------------------------

export interface StatCardData {
  label: string;
  value: string | number;
  subtitle: string;
  icon: string;
  trend?: string;
}

export type TransactionStatus =
  | "preparing"
  | "wallet"
  | "processing"
  | "success"
  | "error";

export interface TransactionState {
  status: TransactionStatus;
  hash?: string;
  error?: string;
}

// --- Wallet Types ------------------------------------------------------------

export interface WalletState {
  connected: boolean;
  address: string | null;
  connecting: boolean;
}
