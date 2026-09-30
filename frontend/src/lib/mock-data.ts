// --- Demo / Mock Data --------------------------------------------------------
// Used when Demo Mode is active or when the real contract is unreachable.
// All demo data is clearly labeled in the UI as "DEMO DATA".

import type { ContractGetState, CourtCaseDisplay } from "@/types/nexus-sla";

export const DEMO_CONTRACT_STATE: ContractGetState = {
  state: "ACTIVE",
  provider: "0x34242f09a2646eF4383C672b8a6BFDC9634cB232",
  client: "0x90e1644d995B2488d4a2Bf24b88D67e04A3F9D5d",
  remaining_bond: 850000000000000000, // 0.85 GEN
  quorum_required: 2,
  pending_claim: {},
  history: [
    {
      incident_id: "INC-001",
      filed_at: 1727600000,
      impact: "major",
      duration_minutes: 47,
      penalty_bps: 1500,
      payout_amount: 150000000000000000,
      sources_agreeing: 2,
      disputed: false,
      finalized: true,
    },
    {
      status: "DISMISSED",
      reason:
        "AI Oracle: Tidak ditemukan bukti downtime/insiden yang memenuhi syarat kuorum.",
      evidence_provided: ["https://www.githubstatus.com/api/v2/incidents.json"],
    },
    {
      incident_id: "INC-003",
      filed_at: 1727700000,
      impact: "major",
      duration_minutes: 23,
      penalty_bps: 500,
      payout_amount: 50000000000000000,
      sources_agreeing: 2,
      disputed: true,
      finalized: true,
    },
  ],
};

export const DEMO_COURT_CASES: CourtCaseDisplay[] = [
  {
    incidentId: "INC-001",
    impact: "MAJOR",
    decision: "UPHELD",
    penaltyBps: 1500,
    payoutAmount: 150000000000000000,
    status: "SETTLED",
    durationMinutes: 47,
    sourcesAgreeing: 2,
    disputed: false,
    filedAt: 1727600000,
  },
  {
    incidentId: "INC-002",
    impact: "MINOR",
    decision: "DISMISSED",
    penaltyBps: 0,
    payoutAmount: 0,
    status: "DISMISSED",
    filedAt: 1727650000,
  },
  {
    incidentId: "INC-003",
    impact: "MAJOR",
    decision: "DISPUTED",
    penaltyBps: 500,
    payoutAmount: 50000000000000000,
    status: "SETTLED",
    durationMinutes: 23,
    sourcesAgreeing: 2,
    disputed: true,
    filedAt: 1727700000,
  },
];

export const EVIDENCE_DOMAINS = [
  "githubstatus.com",
  "status.cloud.google.com",
];
