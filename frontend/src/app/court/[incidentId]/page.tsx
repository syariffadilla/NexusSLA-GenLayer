"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useNexus } from "@/context/NexusContext";
import {
  CaseSummary,
  ConsensusVisualization,
  PenaltyEngine,
  CourtTimeline,
  EvidencePanel,
} from "@/components/court/CourtComponents";
import { finalizeClaim } from "@/lib/contract";
import type { ClaimHistoryEntry } from "@/types/nexus-sla";
import {
  ArrowLeft,
  ShieldAlert,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Scale,
} from "lucide-react";

export default function CourtCaseDetail() {
  const params = useParams();
  const incidentId = params.incidentId as string;
  const { contractState, loading, wallet, refreshState, activeContractAddress } = useNexus();

  const [finalizing, setFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading || !contractState) {
    return (
      <div className="container-nexus py-10">
        <div className="space-y-4">
          <div className="skeleton w-48 h-8 mb-6" />
          <div className="glass-card p-6">
            <div className="skeleton w-full h-32" />
          </div>
        </div>
      </div>
    );
  }

  // 1. Check if incident matches pending_claim
  let claim: ClaimHistoryEntry | null = null;
  const pending = contractState.pending_claim as Record<string, unknown> | undefined;

  if (
    pending &&
    Object.keys(pending).length > 0 &&
    String(pending.incident_id || "").toLowerCase() === incidentId.toLowerCase()
  ) {
    const rawImpact = String(pending.impact || "major").toLowerCase();
    const impactLevel: "major" | "minor" | "none" =
      rawImpact === "minor" ? "minor" : rawImpact === "none" ? "none" : "major";

    claim = {
      incident_id: String(pending.incident_id || incidentId),
      impact: impactLevel,
      penalty_bps: Number(pending.penalty_bps ?? 0),
      payout_amount: String(pending.payout_amount ?? "0"),
      sources_agreeing: Number(pending.sources_agreeing ?? 0),
      disputed: Boolean(pending.disputed),
      finalized: Boolean(pending.finalized),
      filed_at: pending.filed_at ? Number(pending.filed_at) : undefined,
      dispute_deadline: pending.dispute_deadline ? Number(pending.dispute_deadline) : undefined,
      duration_minutes: pending.duration_minutes ? Number(pending.duration_minutes) : undefined,
      evidence_provided: Array.isArray(pending.evidence_provided)
        ? (pending.evidence_provided as string[])
        : [],
    };
  }

  // 2. Fallback to claims history
  if (!claim) {
    claim =
      contractState.history.find((c) => c.incident_id === incidentId) ||
      contractState.history.find((_, idx) => `case-${idx}` === incidentId) ||
      null;
  }

  const handleFinalize = async () => {
    setFinalizing(true);
    setActionError(null);
    try {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected");
      }
      await finalizeClaim(wallet.address, activeContractAddress);
      await refreshState(activeContractAddress);
      setFinalizeSuccess(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to finalize claim");
    } finally {
      setFinalizing(false);
    }
  };

  if (!claim) {
    return (
      <div className="container-nexus py-10">
        <Link href="/court" className="btn-ghost no-underline text-xs mb-6 inline-flex">
          <ArrowLeft size={14} />
          Back to Court
        </Link>
        <div className="glass-card p-12 text-center">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            Case Not Found
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            The court case &ldquo;{incidentId}&rdquo; could not be found in active claims or records.
          </p>
        </div>
      </div>
    );
  }

  const isPending = !claim.finalized;
  const nowUnix = Math.floor(Date.now() / 1000);
  const disputeDeadline = claim.dispute_deadline || 0;
  const disputeActive = !claim.disputed && disputeDeadline > 0 && nowUnix < disputeDeadline;

  return (
    <div className="container-nexus py-10">
      <Link href="/court" className="btn-ghost no-underline text-xs mb-6 inline-flex">
        <ArrowLeft size={14} />
        Back to Court
      </Link>

      {/* Pending / Dispute Action Banner */}
      {isPending && !finalizeSuccess && (
        <div
          className="glass-card p-5 mb-6 animate-fade-in-up"
          style={{
            borderLeft: `4px solid ${
              claim.disputed ? "var(--status-warning)" : "var(--accent-primary)"
            }`,
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 16, 22, 0.95) 100%)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: claim.disputed
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(139, 92, 246, 0.15)",
                  color: claim.disputed
                    ? "var(--status-warning)"
                    : "var(--accent-secondary)",
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  {claim.disputed
                    ? "Dispute Under Court Review"
                    : "Adjudication Verdict Pending Finalization"}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">
                  {claim.disputed
                    ? "The provider has submitted counter-evidence. GenLayer AI validators are reviewing consensus."
                    : disputeActive
                    ? "The dispute window is open. Provider may dispute before settlement unlocks."
                    : "The dispute window has concluded. Settlement is ready to be finalized."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!claim.disputed && (
                <Link
                  href={`/claims/${claim.incident_id}/dispute`}
                  className="btn-secondary no-underline text-xs"
                >
                  <Scale size={14} />
                  Dispute Verdict
                </Link>
              )}
              <button
                onClick={handleFinalize}
                disabled={finalizing || disputeActive}
                className="btn-primary text-xs"
                title={disputeActive ? "Finalize is locked during active dispute window" : undefined}
              >
                {finalizing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    Finalize Settlement
                  </>
                )}
              </button>
            </div>
          </div>

          {actionError && (
            <div className="mt-3 text-xs text-[var(--status-danger)] flex items-center gap-2">
              <AlertTriangle size={14} />
              {actionError}
            </div>
          )}
        </div>
      )}

      {finalizeSuccess && (
        <div
          className="p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in-up"
          style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.25)",
          }}
        >
          <CheckCircle size={18} style={{ color: "var(--status-success)" }} />
          <div className="text-sm text-white font-medium">
            Claim finalized successfully. Collateral transfer dispatched on GenLayer.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <CaseSummary claim={claim} />
          <EvidencePanel claim={claim} />
          <ConsensusVisualization claim={claim} />
          {claim.status !== "DISMISSED" && <PenaltyEngine claim={claim} />}
        </div>

        {/* Sidebar */}
        <div>
          <CourtTimeline claim={claim} />
        </div>
      </div>
    </div>
  );
}
