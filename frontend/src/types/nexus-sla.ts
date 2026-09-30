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
  impact: ImpactLevel;
  duration_minutes: number;
  penalty_bps: number;
  payout_amount: number;
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
  payout_amount?: number;
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
  remaining_bond: number;
  quorum_required: number;
  pending_claim: PendingClaim | Record<string, never>;
  history: ClaimHistoryEntry[];
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

// --- Court Case Display ------------------------------------------------------

export interface CourtCaseDisplay {
  incidentId: string;
  impact: string;
  decision: string;
  penaltyBps: number;
  payoutAmount: number;
  status: ClaimStatus;
  durationMinutes?: number;
  sourcesAgreeing?: number;
  disputed?: boolean;
  filedAt?: number;
}
