"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useNexus } from "@/context/NexusContext";
import { EVIDENCE_DOMAINS } from "@/lib/mock-data";
import { disputeClaim } from "@/lib/contract";
import { formatBps, formatBond } from "@/lib/formatters";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Send,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function DisputeClaimPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = (params.incidentId as string) || "INC-003";
  const { contractState, wallet, demoMode, refreshState } = useNexus();

  const [urls, setUrls] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registered domains
  const registeredDomains = useMemo(() => {
    return EVIDENCE_DOMAINS;
  }, []);

  // Get active claim details
  const pending = contractState?.pending_claim;
  const isTargetClaim = pending && ("incident_id" in pending) && pending.incident_id === incidentId;
  const claimData = isTargetClaim
    ? pending
    : {
        incident_id: incidentId,
        impact: "major",
        penalty_bps: 1500,
        payout_amount: 150000000000000000,
        sources_agreeing: 2,
      };

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (idx: number) => setUrls(urls.filter((_, i) => i !== idx));
  const updateUrl = (idx: number, val: string) => {
    const updated = [...urls];
    updated[idx] = val;
    setUrls(updated);
  };

  // URL Domain validation
  const getUrlValidation = (url: string) => {
    if (!url.trim()) return { valid: false, message: "", show: false };

    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.replace("www.", "");

      const domainMatch = registeredDomains.some(
        (d) => hostname === d || hostname.endsWith("." + d)
      );

      if (!domainMatch) {
        return { valid: false, message: "Domain not registered", show: true };
      }

      // Check uniqueness
      const allDomains = urls
        .filter(Boolean)
        .map((u) => {
          try {
            return new URL(u).hostname.replace("www.", "");
          } catch {
            return "";
          }
        });

      const occurrences = allDomains.filter((d) => d === hostname).length;
      if (occurrences > 1) {
        return { valid: false, message: "Duplicate domain", show: true };
      }

      return { valid: true, message: "Domain verified & source unique", show: true };
    } catch {
      return { valid: false, message: "Invalid URL format", show: true };
    }
  };

  const allValid =
    urls.filter(Boolean).length > 0 &&
    urls.every((u) => {
      const v = getUrlValidation(u);
      return v.valid;
    });

  const handleSubmit = async () => {
    if (!allValid) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (demoMode) {
        // Simulate dispute transaction
        await new Promise((r) => setTimeout(r, 2000));
        setSubmitted(true);
      } else {
        if (!wallet.connected || !wallet.address) {
          throw new Error("Wallet not connected. Connect provider wallet first.");
        }
        await disputeClaim(wallet.address, urls.filter(Boolean));
        await refreshState();
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to submit dispute");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container-nexus py-10">
        <div className="max-w-lg mx-auto text-center py-16 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(34, 197, 94, 0.12)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
          >
            <CheckCircle size={28} style={{ color: "var(--status-success)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Counter-Evidence Submitted
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Your counter-evidence for incident <strong className="text-white">{incidentId}</strong> has
            been submitted to GenLayer. The AI validator court will re-evaluate the incident to reach a
            revised consensus.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href={`/court/${incidentId}`} className="btn-secondary no-underline">
              View Court Case
            </Link>
            <Link href="/claims" className="btn-primary no-underline">
              Back to Claims
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-nexus py-10">
      <Link href="/claims" className="btn-ghost no-underline text-xs mb-6 inline-flex">
        <ArrowLeft size={14} />
        Back to Claims
      </Link>

      <div className="section-header">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.25)",
              color: "var(--status-warning)",
            }}
          >
            Dispute Window Active
          </span>
        </div>
        <h1>Dispute Claim</h1>
        <p>Submit counter-evidence to overturn or adjust an initial SLA outage determination.</p>
      </div>

      <div className="max-w-2xl">
        {/* Incident Summary Card */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  color: "var(--status-warning)",
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <div>
                <div className="text-xs text-muted">Incident Under Dispute</div>
                <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {incidentId}
                </h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border-default)]">
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Original Verdict
              </div>
              <span
                className="text-xs font-semibold uppercase px-2 py-0.5 rounded"
                style={{
                  background: "rgba(239, 68, 68, 0.12)",
                  color: "var(--status-danger)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                }}
              >
                {"impact" in claimData ? String(claimData.impact) : "MAJOR"}
              </span>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Calculated Penalty
              </div>
              <span className="mono font-semibold" style={{ color: "var(--accent-secondary)" }}>
                {"penalty_bps" in claimData ? formatBps(Number(claimData.penalty_bps)) : "1,500 bps"}
              </span>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                Collateral at Risk
              </div>
              <span className="mono font-semibold" style={{ color: "var(--text-primary)" }}>
                {"payout_amount" in claimData
                  ? formatBond(Number(claimData.payout_amount))
                  : "0.15 GEN"}
              </span>
            </div>
          </div>
        </div>

        {/* Registered Domains Whitelist */}
        <div
          className="p-4 rounded-xl mb-6"
          style={{
            background: "rgba(56, 189, 248, 0.06)",
            border: "1px solid rgba(56, 189, 248, 0.12)",
          }}
        >
          <div className="text-xs font-semibold mb-2" style={{ color: "var(--status-info)" }}>
            REGISTERED EVIDENCE DOMAINS (WHITELIST)
          </div>
          <div className="flex flex-wrap gap-2">
            {registeredDomains.map((domain) => (
              <span
                key={domain}
                className="mono text-xs px-2 py-1 rounded"
                style={{
                  background: "rgba(56, 189, 248, 0.08)",
                  color: "var(--text-secondary)",
                }}
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Counter Evidence Sources Input */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h3
            className="text-sm font-semibold tracking-widest uppercase mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Counter Evidence
          </h3>
          <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
            Provide public URLs proving that the service was operational, scheduled maintenance was announced, or the outage was outside SLA coverage.
          </p>

          <div className="space-y-4">
            {urls.map((url, idx) => {
              const validation = getUrlValidation(url);
              return (
                <div key={idx}>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      className="input-field input-mono flex-1"
                      placeholder="https://status.cloud.google.com/incidents/resolved.json"
                      value={url}
                      onChange={(e) => updateUrl(idx, e.target.value)}
                    />
                    {urls.length > 1 && (
                      <button
                        onClick={() => removeUrl(idx)}
                        className="p-2 rounded-lg"
                        style={{
                          background: "none",
                          border: "1px solid rgba(239, 68, 68, 0.2)",
                          color: "var(--status-danger)",
                          cursor: "pointer",
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Validation feedback */}
                  {validation.show && (
                    <div className="flex items-center gap-1.5 mt-2 ml-1">
                      {validation.valid ? (
                        <>
                          <CheckCircle size={12} style={{ color: "var(--status-success)" }} />
                          <span className="text-xs" style={{ color: "var(--status-success)" }}>
                            {validation.message}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={12} style={{ color: "var(--status-danger)" }} />
                          <span className="text-xs" style={{ color: "var(--status-danger)" }}>
                            {validation.message}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={addUrl}
            className="btn-ghost mt-4 text-xs"
            style={{ color: "var(--accent-secondary)" }}
          >
            <Plus size={14} />
            Add Source
          </button>
        </div>

        {errorMsg && (
          <div
            className="p-4 rounded-xl mb-6 flex items-start gap-3"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
            }}
          >
            <AlertTriangle size={16} style={{ color: "var(--status-danger)", flexShrink: 0, marginTop: 2 }} />
            <div className="text-xs" style={{ color: "var(--status-danger)" }}>
              {errorMsg}
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary w-full justify-center"
          style={{
            padding: "14px 24px",
            opacity: allValid ? 1 : 0.5,
            cursor: allValid ? "pointer" : "not-allowed",
          }}
          disabled={!allValid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting Counter-Evidence to GenLayer...
            </>
          ) : (
            <>
              <Send size={16} />
              Submit Counter-Evidence
            </>
          )}
        </button>

        {demoMode && (
          <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
            Demo mode active — dispute submission will be simulated on mock state
          </p>
        )}
      </div>
    </div>
  );
}
