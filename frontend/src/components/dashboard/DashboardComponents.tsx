"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { CopyButton } from "@/components/ui/CoreComponents";
import { formatBond, formatBps } from "@/lib/formatters";
import { CONTRACT_ADDRESS, finalizeClaim } from "@/lib/contract";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Plus,
  Shield,
  Scale,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
} from "lucide-react";

export function DashboardPortal() {
  const { contractState, wallet, userRole, demoMode, refreshState } = useNexus();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("INC-003");
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);

  const pending = contractState?.pending_claim as Record<string, unknown> | undefined;
  const hasPending = pending && Object.keys(pending).length > 0;
  const history = contractState?.history || [];

  const isProvider = userRole === "Provider";
  const isClient = userRole === "Client";
  const pendingDisputed = hasPending && Boolean(pending.disputed);

  const needActionCount = hasPending
    ? isProvider && !pendingDisputed
      ? 1
      : isClient
      ? 1
      : 0
    : 0;

  const actionText = hasPending
    ? isProvider && !pendingDisputed
      ? "Provider can counter-dispute"
      : isClient
      ? "Client can finalize payout"
      : "Observer monitoring"
    : "All clear";

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 1000));
        setFinalizeSuccess(true);
      } else {
        if (!wallet.address) throw new Error("Wallet not connected");
        await finalizeClaim(wallet.address);
        await refreshState();
        setFinalizeSuccess(true);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Finalize failed");
    } finally {
      setFinalizing(false);
    }
  };

  // Compile real contract items
  const items = [
    // 1. Active SLA Agreement
    {
      id: "sla-contract-main",
      type: "Reliability Agreement",
      title: "API Reliability Agreement (GenLayer Studio)",
      subtitle: `Provider ${contractState?.provider?.slice(0, 6)}... locked ${formatBond(
        contractState?.remaining_bond || 1000000000000000000
      )} collateral. 2 sources required.`,
      status: "active",
      statusLabel: "Active SLA",
      statusColor: "purple",
      category: "sla",
      date: "Sep 2026",
      metric1Label: "Locked Collateral",
      metric1Val: formatBond(contractState?.remaining_bond || 1000000000000000000),
      metric2Label: "SLA Target",
      metric2Val: "99.90% Uptime",
      metric3Label: "Quorum",
      metric3Val: `${contractState?.quorum_required || 2} Sources`,
      contractAddress: CONTRACT_ADDRESS,
      href: "/sla",
    },
    // 2. Pending Claim if any
    ...(hasPending
      ? [
          {
            id: String(pending.incident_id || "INC-003"),
            type: "Dispute Window Active",
            title: `${String(pending.incident_id || "INC-003")}: US-East Gateway Timeout`,
            subtitle: pendingDisputed
              ? "Provider submitted counter-evidence. GenLayer AI validators evaluating consensus."
              : "AI consensus confirmed MAJOR outage. Dispute window currently open.",
            status: pendingDisputed ? "disputed" : "pending",
            statusLabel: finalizeSuccess
              ? "Settled"
              : pendingDisputed
              ? "Dispute in review"
              : "Pending finalization",
            statusColor: finalizeSuccess ? "green" : pendingDisputed ? "blue" : "amber",
            category: "claim-pending",
            date: "Sep 29, 2026",
            metric1Label: "Calculated Penalty",
            metric1Val: formatBps(Number(pending.penalty_bps || 1500)),
            metric2Label: "Payout at Risk",
            metric2Val: formatBond(Number(pending.payout_amount || 150000000000000000)),
            metric3Label: "Agreeing Sources",
            metric3Val: `${pending.sources_agreeing || 2} / 2 Sources`,
            contractAddress: CONTRACT_ADDRESS,
            href: `/court/${String(pending.incident_id || "INC-003")}`,
            isPendingClaim: true,
          },
        ]
      : []),
    // 3. Claims history
    ...history.map((h, idx) => ({
      id: h.incident_id || `case-${idx}`,
      type: h.status === "DISMISSED" ? "False Alarm Filtered" : "On-Chain Settled",
      title: `${h.incident_id || `INC-00${idx + 1}`}: ${
        h.status === "DISMISSED"
          ? "Scheduled Maintenance Outage Claim"
          : "Cloud API Global Latency Degradation"
      }`,
      subtitle:
        h.status === "DISMISSED"
          ? "AI Oracle examined evidence: planned maintenance excluded from SLA downtime."
          : `Multi-model quorum agreed. Penalty of ${formatBps(
              h.penalty_bps || 0
            )} settled on-chain.`,
      status: h.status === "DISMISSED" ? "dismissed" : "settled",
      statusLabel: h.status === "DISMISSED" ? "Dismissed" : "Settled",
      statusColor: h.status === "DISMISSED" ? "gray" : "green",
      category: h.status === "DISMISSED" ? "dismissed" : "settled",
      date: "Sep 28, 2026",
      metric1Label: "Penalty Rate",
      metric1Val: formatBps(h.penalty_bps || 0),
      metric2Label: "Financial Payout",
      metric2Val: h.payout_amount ? formatBond(h.payout_amount) : "0 GEN",
      metric3Label: "Oracle Verdict",
      metric3Val: h.status === "DISMISSED" ? "Dismissed (0 bps)" : "Majority Agree",
      contractAddress: CONTRACT_ADDRESS,
      href: `/court/${h.incident_id || `case-${idx}`}`,
    })),
  ];

  // Filtering
  const filteredItems = items.filter((item) => {
    if (filter === "sla" && item.category !== "sla") return false;
    if (filter === "pending" && item.category !== "claim-pending") return false;
    if (filter === "settled" && item.category !== "settled") return false;
    if (filter === "dismissed" && item.category !== "dismissed") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header section with refined typography and status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              GenLayer Studionet
            </span>
            <span className="text-xs text-slate-400 font-mono">Chain 42</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            SLA Court &amp; Submissions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Autonomous service level agreement court powered by multi-source web evidence and GenLayer AI consensus.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-shrink-0">
          <Link href="/sla/create" className="btn-portal-secondary no-underline">
            <Shield size={13} className="text-slate-500" />
            <span>Create SLA</span>
          </Link>
          <Link href="/claims/new" className="btn-portal-primary no-underline">
            <Plus size={13} />
            <span>File Outage Claim</span>
          </Link>
        </div>
      </div>

      {/* 4 Stats Cards — Unified, High-End Minimalist Aesthetics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Card 1: Total Collateral */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Locked Collateral
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-50 text-purple-700 border border-purple-100">
              GEN
            </span>
          </div>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {formatBond(contractState?.remaining_bond || 1000000000000000000)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>1 Active Provider Stake</span>
          </div>
        </div>

        {/* Card 2: Court Review */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Active Disputes
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 border border-amber-100">
              Live
            </span>
          </div>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {hasPending ? 1 : 0}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                hasPending ? "bg-amber-500 animate-pulse" : "bg-slate-300"
              }`}
            />
            <span className="truncate">{hasPending ? "Dispute window open" : "No pending disputes"}</span>
          </div>
        </div>

        {/* Card 3: Adjudications Settled */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Settled Cases
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              Court
            </span>
          </div>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {history.length}
            </span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1.5">
            <CheckCircle size={12} className="text-emerald-500" />
            <span>100% On-Chain Verified</span>
          </div>
        </div>

        {/* Card 4: Action Needed / Role */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between gap-1 mb-2">
            <span className="text-[11px] font-medium tracking-wide uppercase text-slate-400">
              Role Status
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {userRole}
            </span>
          </div>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 font-mono">
              {needActionCount}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate" title={actionText}>
            {actionText}
          </div>
        </div>
      </div>

      {/* Sleek Segmented Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        {/* Segmented Control Tabs */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100/80 border border-slate-200/60 overflow-x-auto scrollbar-none self-start">
          {[
            { id: "all", label: "All Items", count: items.length },
            { id: "sla", label: "Active SLA", count: 1 },
            { id: "pending", label: "Pending Review", count: hasPending ? 1 : 0 },
            {
              id: "settled",
              label: "Settled",
              count: history.filter((h) => h.status !== "DISMISSED").length,
            },
            {
              id: "dismissed",
              label: "Dismissed",
              count: history.filter((h) => h.status === "DISMISSED").length,
            },
          ].map((item) => {
            const active = filter === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border-none cursor-pointer ${
                  active
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "bg-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? "bg-slate-100 text-slate-800" : "bg-slate-200/60 text-slate-500"
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar with clean border */}
        <div className="flex items-center gap-2 max-w-sm w-full">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 shadow-2xs transition-all">
            <Search size={13} className="flex-shrink-0" />
            <input
              type="text"
              placeholder="Search agreements, claims, or IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder-slate-400 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* List Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
          Court &amp; SLA Records ({filteredItems.length})
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3.5">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-xl shadow-xs hover:border-slate-300 transition-all overflow-hidden"
            >
              <div className="p-4 sm:p-5">
                {/* Top Row: Category + Title + Status Pill */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Category Square Icon */}
                    <div
                      className={`w-9 h-9 rounded-lg text-white flex items-center justify-center flex-shrink-0 shadow-2xs ${
                        item.category === "sla"
                          ? "bg-slate-900"
                          : item.statusColor === "amber"
                          ? "bg-amber-600"
                          : item.statusColor === "green"
                          ? "bg-emerald-600"
                          : "bg-slate-600"
                      }`}
                    >
                      {item.category === "sla" ? <Shield size={16} /> : <Scale size={16} />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-[11px] font-mono text-slate-400 mb-0.5">
                        {item.type}
                      </div>
                      <Link
                        href={item.href}
                        className="text-sm sm:text-base font-semibold text-slate-900 hover:text-purple-600 transition-colors no-underline block leading-snug break-words"
                      >
                        {item.title}
                      </Link>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        item.statusColor === "amber"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : item.statusColor === "green"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : item.statusColor === "purple"
                          ? "bg-purple-50 text-purple-800 border-purple-200"
                          : item.statusColor === "blue"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.statusColor === "amber"
                            ? "bg-amber-600"
                            : item.statusColor === "green"
                            ? "bg-emerald-600"
                            : item.statusColor === "purple"
                            ? "bg-purple-600"
                            : item.statusColor === "blue"
                            ? "bg-blue-600"
                            : "bg-slate-500"
                        }`}
                      />
                      {item.statusLabel}
                    </span>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
                  {item.subtitle}
                </p>

                {/* Metadata Boxes Row (Responsive Grid with clean hairline borders) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3.5">
                  <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {item.metric1Label}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 font-mono truncate">
                      {item.metric1Val}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {item.metric2Label}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 font-mono truncate">
                      {item.metric2Val}
                    </div>
                  </div>

                  <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-medium mb-0.5">
                      {item.metric3Label}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                      {item.metric3Val}
                    </div>
                  </div>
                </div>

                {/* Action Row for Pending Claim */}
                {item.isPendingClaim && (
                  <div className="p-2.5 sm:p-3 bg-amber-50/80 border border-amber-200 rounded-xl mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-900 font-medium text-[11px] sm:text-xs">
                      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
                      <span>Dispute window active. Provider can counter-dispute or client can finalize.</span>
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto flex-wrap">
                      <Link
                        href={`/claims/${item.id}/dispute`}
                        className="btn-portal-secondary text-xs no-underline font-medium"
                      >
                        <Scale size={12} />
                        <span>Dispute</span>
                      </Link>
                      <button
                        onClick={handleFinalize}
                        disabled={finalizing || finalizeSuccess}
                        className="btn-portal-primary text-xs"
                      >
                        {finalizing ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Finalizing...</span>
                          </>
                        ) : finalizeSuccess ? (
                          <>
                            <CheckCircle size={12} />
                            <span>Settled</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            <span>Finalize</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Footer with Contract ID + Expandable View */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                    <span className="text-slate-400">Contract</span>
                    <span className="font-semibold text-slate-700">{CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
                    <CopyButton text={CONTRACT_ADDRESS} />
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={item.href}
                      className="text-slate-900 hover:text-purple-600 font-medium no-underline flex items-center gap-1 text-xs transition-colors"
                    >
                      <span>Case Details</span> <ArrowRight size={11} />
                    </Link>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-medium border-none bg-transparent cursor-pointer text-xs transition-colors"
                    >
                      <span>{isExpanded ? "Less" : "Metadata"}</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-xs bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl space-y-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Provider
                        </span>
                        <span className="mono font-semibold text-slate-800 text-[10px] sm:text-[11px] truncate block">
                          {contractState?.provider?.slice(0, 10)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Client
                        </span>
                        <span className="mono font-semibold text-slate-800 text-[10px] sm:text-[11px] truncate block">
                          {contractState?.client?.slice(0, 10)}...
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Consensus
                        </span>
                        <span className="font-semibold text-purple-700 text-[10px] sm:text-[11px] truncate block">
                          prompt_comparative
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">
                          Settlement
                        </span>
                        <span className="font-semibold text-emerald-600 text-[10px] sm:text-[11px] truncate block">
                          Deterministic Slash
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
