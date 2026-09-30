"use client";

import React from "react";
import { StatusBadge, AddressDisplay } from "@/components/ui/CoreComponents";
import { formatBond, formatBps, formatDuration, formatTimestamp } from "@/lib/formatters";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  ArrowDown,
  Shield,
  Coins,
  Activity,
} from "lucide-react";
import type { ClaimHistoryEntry } from "@/types/nexus-sla";

/* --- Case Summary -------------------------------------------------- */

export function CaseSummary({ claim }: { claim: ClaimHistoryEntry }) {
  const isDismissed = claim.status === "DISMISSED";

  return (
    <div className="glass-card-accent p-6 mb-6 animate-fade-in-up">
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
            COURT CASE
          </div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {claim.incident_id || "Case Review"}
          </h2>
          {!isDismissed && claim.impact && (
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {claim.impact === "major" ? "API Service Outage" : "Service Degradation"}
            </p>
          )}
        </div>
        <StatusBadge status={isDismissed ? "DISMISSED" : claim.disputed ? (claim.finalized ? "SETTLED" : "DISPUTED") : (claim.finalized ? "SETTLED" : "PENDING")} />
      </div>

      {isDismissed ? (
        <div className="p-4 rounded-lg" style={{ background: "rgba(100, 116, 139, 0.1)", border: "1px solid rgba(100, 116, 139, 0.15)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {claim.reason || "Claim dismissed — insufficient evidence."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Impact</div>
            <span className="text-sm font-semibold uppercase" style={{
              color: claim.impact === "major" ? "var(--status-danger)" : "var(--status-warning)"
            }}>
              {claim.impact?.toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Duration</div>
            <span className="mono text-sm" style={{ color: "var(--text-primary)" }}>
              {claim.duration_minutes ? formatDuration(claim.duration_minutes) : "—"}
            </span>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Sources</div>
            <span className="text-sm" style={{ color: "var(--text-primary)" }}>
              {claim.sources_agreeing || 0} / {claim.sources_agreeing || 0}
            </span>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Penalty</div>
            <span className="mono text-sm font-semibold" style={{ color: "var(--accent-secondary)" }}>
              {formatBps(claim.penalty_bps || 0)}
            </span>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Payout</div>
            <span className="mono text-sm" style={{ color: "var(--text-primary)" }}>
              {claim.payout_amount ? formatBond(claim.payout_amount) : "—"}
            </span>
          </div>
          <div>
            <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Filed</div>
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {claim.filed_at ? formatTimestamp(claim.filed_at) : "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* --- Penalty Engine Visualization ---------------------------------- */

export function PenaltyEngine({ claim }: { claim: ClaimHistoryEntry }) {
  if (!claim.duration_minutes || !claim.penalty_bps) return null;

  // Reverse-engineer uptime from penalty
  const estimatedUptime = 100 - (claim.penalty_bps / 100);
  const bondImpact = claim.payout_amount ? formatBond(claim.payout_amount) : "0 GEN";

  const steps = [
    { label: "DOWNTIME", value: formatDuration(claim.duration_minutes), icon: <Clock size={16} /> },
    { label: "UPTIME CALCULATION", value: `${estimatedUptime.toFixed(2)}%`, icon: <Activity size={16} /> },
    { label: "THRESHOLD", value: `≤ 99.90%`, icon: <AlertTriangle size={16} /> },
    { label: "PENALTY", value: formatBps(claim.penalty_bps), icon: <Shield size={16} /> },
    { label: "BOND IMPACT", value: bondImpact, icon: <Coins size={16} /> },
  ];

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--text-muted)" }}>
        Penalty Engine
      </h3>

      <div className="flex flex-col items-center gap-2">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div
              className="w-full max-w-xs p-4 rounded-xl text-center"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-default)",
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1" style={{ color: "var(--accent-secondary)" }}>
                {step.icon}
                <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                  {step.label}
                </span>
              </div>
              <span className="mono text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {step.value}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <ArrowDown size={16} style={{ color: "var(--accent-primary)", opacity: 0.5 }} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div
        className="mt-6 p-4 rounded-lg text-center text-xs"
        style={{
          background: "rgba(139, 92, 246, 0.06)",
          border: "1px solid rgba(139, 92, 246, 0.12)",
          color: "var(--text-secondary)",
        }}
      >
        <strong style={{ color: "var(--text-primary)" }}>AI judgment</strong> determines whether an incident is supported.{" "}
        <strong style={{ color: "var(--text-primary)" }}>Deterministic contract logic</strong> calculates the financial consequence.
      </div>
    </div>
  );
}

/* --- Consensus Visualization --------------------------------------- */

export function ConsensusVisualization({ claim }: { claim: ClaimHistoryEntry }) {
  if (claim.status === "DISMISSED") {
    return (
      <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <h3 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
          AI Consensus
        </h3>
        <div className="flex flex-col items-center py-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(100, 116, 139, 0.15)", color: "var(--text-muted)" }}
          >
            <AlertTriangle size={20} />
          </div>
          <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
            NO CONSENSUS
          </p>
          <p className="text-xs text-center" style={{ color: "var(--text-muted)", maxWidth: 300 }}>
            Evidence did not support an incident meeting the quorum requirement.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--text-muted)" }}>
        AI Consensus
      </h3>

      {/* Visual flow */}
      <div className="flex flex-col items-center gap-3">
        {/* Evidence node */}
        <div
          className="px-6 py-3 rounded-xl text-center"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
        >
          <FileText size={16} className="mx-auto mb-1" style={{ color: "var(--accent-secondary)" }} />
          <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>Evidence</span>
        </div>

        <ArrowDown size={14} style={{ color: "var(--accent-primary)", opacity: 0.4 }} />

        {/* AI Consensus node */}
        <div
          className="px-6 py-4 rounded-xl text-center glow-violet"
          style={{
            background: "rgba(139, 92, 246, 0.08)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
          }}
        >
          <div className="text-xs font-semibold mb-2" style={{ color: "var(--accent-bright)" }}>
            MAJORITY AGREE
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div style={{ color: "var(--text-muted)" }}>Impact</div>
              <div className="font-semibold uppercase" style={{
                color: claim.impact === "major" ? "var(--status-danger)" : "var(--status-warning)"
              }}>
                {claim.impact}
              </div>
            </div>
            <div>
              <div style={{ color: "var(--text-muted)" }}>Sources</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                {claim.sources_agreeing || 0} agreeing
              </div>
            </div>
          </div>
        </div>

        <ArrowDown size={14} style={{ color: "var(--accent-primary)", opacity: 0.4 }} />

        {/* Verdict node */}
        <div
          className="px-6 py-3 rounded-xl text-center"
          style={{
            background: claim.disputed
              ? "rgba(245, 158, 11, 0.08)"
              : "rgba(34, 197, 94, 0.08)",
            border: `1px solid ${claim.disputed ? "rgba(245, 158, 11, 0.2)" : "rgba(34, 197, 94, 0.2)"}`,
          }}
        >
          <CheckCircle size={16} className="mx-auto mb-1" style={{
            color: claim.disputed ? "var(--status-warning)" : "var(--status-success)"
          }} />
          <span className="text-xs font-semibold" style={{
            color: claim.disputed ? "var(--status-warning)" : "var(--status-success)"
          }}>
            {claim.disputed ? "DISPUTED → REVIEWED" : "VERDICT FINALIZED"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* --- Court Timeline ------------------------------------------------ */

export function CourtTimeline({ claim }: { claim: ClaimHistoryEntry }) {
  const isDismissed = claim.status === "DISMISSED";

  type Step = { label: string; completed: boolean; active: boolean };

  const steps: Step[] = isDismissed
    ? [
        { label: "CLAIM FILED", completed: true, active: false },
        { label: "EVIDENCE VERIFIED", completed: true, active: false },
        { label: "AI ADJUDICATION", completed: true, active: false },
        { label: "DISMISSED", completed: true, active: true },
      ]
    : [
        { label: "CLAIM FILED", completed: true, active: false },
        { label: "EVIDENCE VERIFIED", completed: true, active: false },
        { label: "AI ADJUDICATION", completed: true, active: false },
        { label: "CONSENSUS REACHED", completed: true, active: false },
        { label: "DISPUTE WINDOW", completed: !!claim.disputed || !!claim.finalized, active: !claim.finalized && !claim.disputed },
        { label: "FINALIZED", completed: !!claim.finalized, active: false },
        { label: "SETTLED", completed: !!claim.finalized, active: !!claim.finalized },
      ];

  return (
    <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "var(--text-muted)" }}>
        Claim Lifecycle
      </h3>

      <div className="space-y-0">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {/* Timeline dot and line */}
            <div className="flex flex-col items-center">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  background: step.completed
                    ? step.active
                      ? "var(--accent-primary)"
                      : "var(--status-success)"
                    : "var(--bg-hover)",
                  border: step.completed ? "none" : "2px solid var(--border-default)",
                  boxShadow: step.active ? "0 0 8px var(--accent-glow-strong)" : "none",
                }}
              />
              {idx < steps.length - 1 && (
                <div
                  className="w-px h-6"
                  style={{
                    background: step.completed ? "rgba(34, 197, 94, 0.3)" : "var(--border-default)",
                  }}
                />
              )}
            </div>

            {/* Label */}
            <span
              className="text-xs font-medium -mt-0.5"
              style={{
                color: step.active
                  ? "var(--accent-bright)"
                  : step.completed
                  ? "var(--text-secondary)"
                  : "var(--text-muted)",
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- Evidence Panel ------------------------------------------------ */

export function EvidencePanel({ claim }: { claim: ClaimHistoryEntry }) {
  const urls = claim.evidence_provided || [];

  return (
    <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
      <h3 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
        Evidence Sources
      </h3>

      {urls.length > 0 ? (
        <div className="space-y-3">
          {urls.map((url, idx) => {
            // Extract domain
            let domain = url;
            try {
              domain = new URL(url).hostname.replace("www.", "");
            } catch {
              // use raw url
            }

            return (
              <div
                key={idx}
                className="p-4 rounded-xl"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} style={{ color: "var(--status-success)" }} />
                  <span className="text-xs font-semibold uppercase" style={{ color: "var(--status-success)" }}>
                    Verified Domain
                  </span>
                </div>
                <div className="text-sm font-medium mb-1" style={{ color: "var(--text-primary)" }}>
                  {domain}
                </div>
                <div className="mono text-xs truncate" style={{ color: "var(--text-muted)" }}>
                  {url}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-4 rounded-lg text-center" style={{ background: "var(--bg-secondary)" }}>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Evidence source submitted to GenLayer
          </p>
        </div>
      )}
    </div>
  );
}
