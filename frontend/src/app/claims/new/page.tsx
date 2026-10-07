"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { fileClaim } from "@/lib/contract";
import { truncateAddress, formatBond } from "@/lib/formatters";
import {
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Globe,
  Cpu,
  Scale,
  Sparkles,
  AlertCircle,
  Coins,
} from "lucide-react";

const ADJUDICATION_STEPS = [
  { id: 1, label: "Evidence collected", icon: Globe },
  { id: 2, label: "Domains verified against whitelist", icon: CheckCircle },
  { id: 3, label: "Validators rendering & analyzing web evidence", icon: Cpu },
  { id: 4, label: "Semantic consensus evaluation", icon: Scale },
  { id: 5, label: "Final court verdict calculated", icon: Sparkles },
];

export default function FileClaimPage() {
  const { contractState, contractConfig, wallet, refreshState, activeContractAddress, userRole } = useNexus();
  const [urls, setUrls] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isClient =
    wallet.connected &&
    wallet.address &&
    contractState?.client &&
    wallet.address.toLowerCase() === contractState.client.toLowerCase();

  const isProvider =
    wallet.connected &&
    wallet.address &&
    contractState?.provider &&
    wallet.address.toLowerCase() === contractState.provider.toLowerCase();

  const isContractActive = contractState?.state === "ACTIVE";

  // Domain whitelist comes directly from live contract get_config()
  const registeredDomains = useMemo(() => {
    return contractConfig?.evidence_domains ?? [];
  }, [contractConfig]);

  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (idx: number) => setUrls(urls.filter((_, i) => i !== idx));
  const updateUrl = (idx: number, val: string) => {
    const updated = [...urls];
    updated[idx] = val;
    setUrls(updated);
  };

  // Validate each URL
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

      return { valid: true, message: "Domain verified & unique", show: true };
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

    if (!wallet.connected || !wallet.address) {
      setErrorMsg("Wallet not connected. Please connect your Web3 wallet first.");
      return;
    }

    if (isProvider) {
      setErrorMsg(
        `Role Restriction: You are currently connected as the Provider (${truncateAddress(contractState?.provider || "")}). Under the bilateral SLA agreement, claims can ONLY be filed by the designated Client (${truncateAddress(contractState?.client || "")}). Please switch accounts in Rabby / MetaMask.`,
      );
      return;
    }

    if (contractState?.client && !isClient) {
      setErrorMsg(
        `Unauthorized: Only the designated Client (${truncateAddress(contractState.client)}). Your current wallet is ${truncateAddress(wallet.address || "")}.`,
      );
      return;
    }

    if (!isContractActive) {
      setErrorMsg(
        `Agreement is not ACTIVE (current status: ${contractState?.state || "UNINITIALIZED"}). The Provider must deposit the collateral bond before any downtime claims can be evaluated by the court.`,
      );
      return;
    }

    setSubmitting(true);
    setActiveStep(1);
    setErrorMsg(null);

    try {
      setActiveStep(2);
      await fileClaim(wallet.address, urls.filter(Boolean), activeContractAddress);

      setActiveStep(3);
      await new Promise((r) => setTimeout(r, 600));

      setActiveStep(4);
      await new Promise((r) => setTimeout(r, 600));

      setActiveStep(5);
      await refreshState(activeContractAddress);
      setSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to adjudicate claim");
      setSubmitting(false);
    }
  };

  if (submitting && !submitted) {
    return (
      <div className="container-nexus py-12">
        <div className="max-w-2xl mx-auto">
          {/* Adjudication Experience Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                color: "var(--accent-secondary)",
              }}>
              <Scale size={14} />
              NEXUSSLA COURT
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Adjudicating Claim...</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Independent evidence is being processed by GenLayer intelligent contracts.
            </p>
          </div>

          {/* Adjudication Architecture Flowchart */}
          <div className="glass-card p-6 mb-8 relative overflow-hidden">
            <div className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase mb-6 text-center">
              ADJUDICATION PIPELINE
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center relative z-10">
              {[
                { title: "EVIDENCE", desc: "Multi-Source", step: 1 },
                { title: "WEB RENDER", desc: "Non-Deterministic", step: 2 },
                { title: "AI VALIDATORS", desc: "Semantic Quorum", step: 3 },
                { title: "CONSENSUS", desc: "Majority Agree", step: 4 },
                { title: "VERDICT", desc: "Deterministic", step: 5 },
              ].map((item, idx) => {
                const isPast = activeStep > item.step;
                const isCurrent = activeStep === item.step;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl transition-all duration-300 relative"
                    style={{
                      background: isCurrent
                        ? "rgba(139, 92, 246, 0.2)"
                        : isPast
                        ? "rgba(34, 197, 94, 0.1)"
                        : "rgba(255, 255, 255, 0.03)",
                      border: `1px solid ${
                        isCurrent
                          ? "var(--accent-primary)"
                          : isPast
                          ? "rgba(34, 197, 94, 0.3)"
                          : "var(--border-default)"
                      }`,
                    }}
                  >
                    <div
                      className="text-xs font-bold mb-1"
                      style={{
                        color: isCurrent
                          ? "var(--accent-secondary)"
                          : isPast
                          ? "var(--status-success)"
                          : "var(--text-muted)",
                      }}
                    >
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[var(--text-secondary)]">{item.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Steps Checklist */}
          <div className="glass-card p-6 space-y-4">
            {ADJUDICATION_STEPS.map((s) => {
              const isPast = activeStep > s.id;
              const isCurrent = activeStep === s.id;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                    {isPast ? (
                      <CheckCircle size={18} style={{ color: "var(--status-success)" }} />
                    ) : isCurrent ? (
                      <Loader2 size={18} className="animate-spin" style={{ color: "var(--accent-secondary)" }} />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)] opacity-30" />
                    )}
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isPast
                        ? "var(--text-primary)"
                        : isCurrent
                        ? "var(--accent-secondary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container-nexus py-10">
        <div className="max-w-lg mx-auto text-center py-16 animate-fade-in-up">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.25)" }}
          >
            <CheckCircle size={28} style={{ color: "var(--status-success)" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>
            Adjudication Completed
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Your evidence has been verified and processed by GenLayer intelligent contracts.
            The court verdict is now officially registered on-chain.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/claims" className="btn-secondary no-underline">
              View All Claims
            </Link>
            <Link href="/court" className="btn-primary no-underline">
              Court Cases
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
        <h1>File SLA Claim</h1>
        <p>Submit real-world evidence for autonomous adjudication on GenLayer.</p>
      </div>

      <div className="max-w-2xl">
        {/* Registered domains whitelist info */}
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
                style={{ background: "rgba(56, 189, 248, 0.08)", color: "var(--text-secondary)" }}
              >
                {domain}
              </span>
            ))}
          </div>
        </div>

        {/* Role & Contract State Warnings */}
        {isProvider && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  Connected as Provider ({truncateAddress(wallet.address || "")})
                </span>
                <span>
                  Under this bilateral agreement, outage claims can <strong>ONLY</strong> be filed by the designated Client (
                  <span className="font-mono font-bold text-amber-950">{truncateAddress(contractState?.client || "")}</span>
                  ). Please switch to your Client wallet account in Rabby / MetaMask to proceed.
                </span>
              </div>
            </div>
          </div>
        )}

        {!isContractActive && (
          <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  Agreement Not Active ({contractState?.state || "UNINITIALIZED"})
                </span>
                <span>
                  The designated Provider must deposit collateral bond ({contractConfig ? formatBond(contractConfig.bond_amount) : "2.00 GEN"}) before any outage claims can be filed.
                </span>
              </div>
            </div>
            <Link href="/sla/deposit" className="btn-portal-primary text-xs py-1.5 px-3 whitespace-nowrap self-start sm:self-auto no-underline">
              Deposit Bond First
            </Link>
          </div>
        )}

        {/* Evidence sources */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Evidence Sources
          </h3>

          <div className="space-y-4">
            {urls.map((url, idx) => {
              const validation = getUrlValidation(url);
              return (
                <div key={idx}>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      className="input-field input-mono flex-1"
                      placeholder="https://www.githubstatus.com/api/v2/incidents.json"
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
            Add Evidence Source
          </button>
        </div>

        {errorMsg && (
          <div
            className="p-4 rounded-xl mb-6 flex items-center gap-3"
            style={{
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--status-danger)",
              fontSize: "13px",
            }}
          >
            <XCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Submit */}
        <button
          className="btn-primary w-full justify-center"
          style={{
            padding: "14px 24px",
            opacity: allValid && !isProvider && isContractActive ? 1 : 0.5,
            cursor: allValid && !isProvider && isContractActive ? "pointer" : "not-allowed",
          }}
          disabled={!allValid || submitting || isProvider || !isContractActive}
          onClick={handleSubmit}
        >
          {isProvider ? (
            <span>Switch to Client Wallet to File Claim</span>
          ) : !isContractActive ? (
            <span>Agreement Must Be Active to File Claim</span>
          ) : submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              <span>Adjudicating with AI Jury...</span>
            </span>
          ) : (
            <>
              <Send size={16} />
              Submit Claim for Adjudication
            </>
          )}
        </button>
      </div>
    </div>
  );
}
