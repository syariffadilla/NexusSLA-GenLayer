"use client";

import React from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { StatusBadge, EmptyState } from "@/components/ui/CoreComponents";
import { formatBps, formatBond, formatDuration, getClaimStatus } from "@/lib/formatters";
import { Scale, ArrowRight, ShieldAlert } from "lucide-react";
import type { ClaimHistoryEntry } from "@/types/nexus-sla";

export default function CourtPage() {
  const { contractState, loading } = useNexus();

  const history = contractState?.history || [];
  const pending = contractState?.pending_claim as Record<string, unknown> | undefined;
  const hasPending = pending && Object.keys(pending).length > 0;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Court Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Equivalence Consensus
            </span>
            <span className="text-xs text-slate-400 font-mono">Arbitration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Court Adjudications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Multi-validator AI jury consensus evaluates decentralized uptime evidence before releasing or slashing collateral bonds.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="skeleton w-48 h-5 mb-3" />
              <div className="skeleton w-full h-4 mb-2" />
              <div className="skeleton w-64 h-4" />
            </div>
          ))}
        </div>
      ) : !hasPending && history.length === 0 ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          <EmptyState
            title="No Court Cases"
            description="When SLA claims are filed, court cases will appear here with their adjudication details."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Pending Claim Card */}
          {hasPending && (
            <Link
              href={`/court/${String(pending.incident_id || "INC-003")}`}
              className="block bg-white border border-[#E2E8F0] border-l-4 border-l-amber-500 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all no-underline group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
                      Active Dispute Window
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                      {String(pending.incident_id || "INC-003")}: US-East Edge Gateway Timeout
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <StatusBadge status={pending.disputed ? "DISPUTED" : "PENDING"} />
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Impact</div>
                  <div className="text-xs font-bold text-red-600 uppercase">{String(pending.impact || "MAJOR")}</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Duration</div>
                  <div className="text-xs font-bold text-slate-800 mono">{formatDuration(Number(pending.duration_minutes || 47))}</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Calculated Penalty</div>
                  <div className="text-xs font-bold text-purple-700 mono">{formatBps(Number(pending.penalty_bps || 1500))}</div>
                </div>
                <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                  <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Payout At Risk</div>
                  <div className="text-xs font-bold text-slate-800 mono">{formatBond(Number(pending.payout_amount || 150000000000000000))}</div>
                </div>
              </div>
            </Link>
          )}

          {/* Settled / Dismissed Cases */}
          {history.map((claim: ClaimHistoryEntry, idx: number) => {
            const status = getClaimStatus(claim);
            const isDismissed = claim.status === "DISMISSED";
            const borderColor = isDismissed ? "border-l-slate-400" : "border-l-emerald-500";

            return (
              <Link
                key={idx}
                href={`/court/${claim.incident_id || `case-${idx}`}`}
                className={`block bg-white border border-[#E2E8F0] border-l-4 ${borderColor} rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all no-underline group`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl text-white flex items-center justify-center flex-shrink-0 ${
                        isDismissed ? "bg-slate-400" : "bg-emerald-500"
                      }`}
                    >
                      <Scale size={20} />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        {isDismissed ? "False Alarm Filtered" : "Adjudicated & Settled"}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {claim.incident_id || (isDismissed ? "Scheduled Maintenance Claim" : `Case #${idx + 1}`)}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isDismissed
                          ? "Claim dismissed — evidence shows scheduled maintenance window."
                          : "Multi-model quorum reached consensus. Penalty finalized."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <StatusBadge status={status} />
                    <ArrowRight size={14} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                  </div>
                </div>

                {!isDismissed ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Impact</div>
                      <div
                        className={`text-xs font-bold uppercase ${
                          claim.impact === "major" ? "text-red-600" : "text-amber-600"
                        }`}
                      >
                        {claim.impact?.toUpperCase() || "MAJOR"}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Duration</div>
                      <div className="text-xs font-bold text-slate-800 mono">
                        {claim.duration_minutes ? formatDuration(claim.duration_minutes) : "—"}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Penalty Slashed</div>
                      <div className="text-xs font-bold text-purple-700 mono">
                        {formatBps(claim.penalty_bps || 0)}
                      </div>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Payout Sent</div>
                      <div className="text-xs font-bold text-slate-800 mono">
                        {claim.payout_amount ? formatBond(claim.payout_amount) : "0 GEN"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Verdict</div>
                      <div className="text-xs font-bold text-slate-700">Dismissed (0 bps)</div>
                    </div>
                    <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3 sm:col-span-2">
                      <div className="text-[10px] text-slate-400 uppercase font-bold mb-0.5">Reason</div>
                      <div className="text-xs text-slate-600">{claim.reason || "Insufficient downtime evidence to satisfy quorum."}</div>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
