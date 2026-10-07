"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { StatusBadge, EmptyState } from "@/components/ui/CoreComponents";
import { formatBps, formatBond, getClaimStatus } from "@/lib/formatters";
import { finalizeClaim } from "@/lib/contract";
import {
  FileText,
  Plus,
  ArrowRight,
  Scale,
  CheckCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { ClaimHistoryEntry } from "@/types/nexus-sla";

export default function ClaimsPage() {
  const { contractState, loading, wallet, refreshState } = useNexus();
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);

  const history = contractState?.history || [];
  const pendingClaim = contractState?.pending_claim as Record<string, unknown> | undefined;
  const hasPending = pendingClaim && Object.keys(pendingClaim).length > 0;
  const incidentId = hasPending ? String(pendingClaim.incident_id || "pending-claim") : "";

  const handleFinalize = async () => {
    if (!wallet.connected || !wallet.address) {
      alert("Please connect wallet first");
      return;
    }
    setFinalizing(true);
    try {
      await finalizeClaim(wallet.address);
      await refreshState();
      setFinalizeSuccess(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Finalize failed");
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Incident Registry
            </span>
            <span className="text-xs text-slate-400 font-mono">Claims &amp; Audits</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Claims &amp; Outage History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            SLA violation claims, decentralized web evidence verifications, and historical on-chain court payouts.
          </p>
        </div>
        <Link href="/claims/new" className="btn-portal-primary no-underline self-start sm:self-auto">
          <Plus size={13} />
          <span>File Outage Claim</span>
        </Link>
      </div>

      {/* Pending claim banner */}
      {hasPending && (
        <div className="glass-card-accent p-5 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="animate-pulse-glow">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: pendingClaim.disputed
                      ? "var(--status-warning)"
                      : "var(--accent-secondary)",
                  }}
                />
              </div>
              <span
                className="text-sm font-semibold"
                style={{
                  color: pendingClaim.disputed
                    ? "var(--status-warning)"
                    : "var(--accent-secondary)",
                }}
              >
                {pendingClaim.disputed
                  ? "Active Claim — Dispute Under Review"
                  : "Active Claim — Pending Finalization"}
              </span>
            </div>
            <StatusBadge
              status={
                finalizeSuccess
                  ? "SETTLED"
                  : pendingClaim.disputed
                  ? "DISPUTED"
                  : "PENDING"
              }
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Incident
              </div>
              <span className="mono font-semibold" style={{ color: "var(--text-primary)" }}>
                {incidentId}
              </span>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Impact
              </div>
              <span
                className="uppercase font-semibold text-xs"
                style={{
                  color:
                    pendingClaim.impact === "major"
                      ? "var(--status-danger)"
                      : "var(--status-warning)",
                }}
              >
                {String(pendingClaim.impact || "MAJOR")}
              </span>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Penalty
              </div>
              <span className="mono" style={{ color: "var(--accent-secondary)" }}>
                {pendingClaim.penalty_bps != null
                  ? formatBps(Number(pendingClaim.penalty_bps))
                  : "—"}
              </span>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Payout
              </div>
              <span className="mono" style={{ color: "var(--text-primary)" }}>
                {pendingClaim.payout_amount != null
                  ? formatBond(String(pendingClaim.payout_amount))
                  : "—"}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border-default)]">
            <Link
              href={`/court/${incidentId}`}
              className="btn-ghost no-underline text-xs inline-flex items-center gap-1.5"
            >
              <ExternalLink size={12} />
              View Case Analysis
            </Link>

            <div className="flex items-center gap-2">
              {!pendingClaim.disputed && (
                <Link
                  href={`/claims/${incidentId}/dispute`}
                  className="btn-secondary no-underline text-xs inline-flex items-center gap-1.5"
                >
                  <Scale size={12} />
                  Dispute Verdict
                </Link>
              )}
              <button
                onClick={handleFinalize}
                disabled={finalizing || finalizeSuccess}
                className="btn-primary text-xs"
                style={{ padding: "6px 14px" }}
              >
                {finalizing ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    Finalizing...
                  </>
                ) : finalizeSuccess ? (
                  <>
                    <CheckCircle size={12} />
                    Finalized
                  </>
                ) : (
                  <>
                    <CheckCircle size={12} />
                    Finalize Claim
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Claims history */}
      {loading ? (
        <div className="glass-card p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="skeleton w-20 h-4" />
                <div className="skeleton w-16 h-4" />
                <div className="skeleton w-24 h-4" />
                <div className="skeleton w-16 h-4" />
              </div>
            ))}
          </div>
        </div>
      ) : history.length === 0 ? (
        <div className="glass-card p-8">
          <EmptyState
            title="No Claims Yet"
            description="Claims submitted to NexusSLA will appear here."
            action="File Claim"
            onAction={() => (window.location.href = "/claims/new")}
          />
        </div>
      ) : (
        <div className="glass-card overflow-hidden animate-fade-in-up stagger-2">
          <div className="overflow-x-auto">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Impact</th>
                  <th>Penalty</th>
                  <th>Payout</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((claim: ClaimHistoryEntry, idx: number) => {
                  const status = getClaimStatus(claim);
                  return (
                    <tr key={idx}>
                      <td>
                        <div className="flex items-center gap-2">
                          <FileText size={14} style={{ color: "var(--accent-secondary)" }} />
                          <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                            {claim.incident_id || `Case #${idx + 1}`}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className="text-xs font-semibold uppercase"
                          style={{
                            color:
                              claim.impact === "major"
                                ? "var(--status-danger)"
                                : claim.impact === "minor"
                                ? "var(--status-warning)"
                                : "var(--text-muted)",
                          }}
                        >
                          {claim.impact?.toUpperCase() || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="mono text-sm">
                          {claim.penalty_bps != null ? formatBps(claim.penalty_bps) : "0 bps"}
                        </span>
                      </td>
                      <td>
                        <span className="mono text-sm">
                          {claim.payout_amount != null
                            ? formatBond(claim.payout_amount)
                            : "—"}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={status} />
                      </td>
                      <td>
                        <Link
                          href={`/court/${claim.incident_id || `case-${idx}`}`}
                          className="btn-ghost no-underline text-xs"
                          style={{ color: "var(--accent-secondary)" }}
                        >
                          Details <ArrowRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
