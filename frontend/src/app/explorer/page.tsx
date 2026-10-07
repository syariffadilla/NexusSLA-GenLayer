"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { AddressDisplay, CopyButton, StatusBadge } from "@/components/ui/CoreComponents";
import { formatBond, formatBps, getClaimStatus } from "@/lib/formatters";
import {
  CONTRACT_ADDRESS,
  GENLAYER_EXPLORER_URL,
} from "@/lib/contract";
import {
  ExternalLink,
  FileText,
  Globe,
  Box,
  Server,
  Zap,
  RefreshCw,
  BookOpen,
  CheckCircle,
  Copy,
  Check,
  Shield,
  Layers,
  Code2,
  ArrowUpRight,
  Database,
  Radio,
} from "lucide-react";
import type { ClaimHistoryEntry } from "@/types/nexus-sla";

export default function ExplorerPage() {
  const {
    contractState,
    loading,
    rpcUrl,
    setRpcUrl,
    rpcStatus,
    checkRpc,
    refreshState,
  } = useNexus();

  const [inputUrl, setInputUrl] = useState(rpcUrl);
  const [testing, setTesting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopiedAddress(addr);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const ecosystemContracts = [
    {
      name: "NexusSLA Autonomous Court",
      address: CONTRACT_ADDRESS,
      role: "Core Intelligent Contract & Escrow Engine",
      status: contractState?.state ?? "Active",
      verified: true,
    },
    ...(contractState?.provider
      ? [
          {
            name: "SLA Provider Escrow Account",
            address: contractState.provider,
            role: "Designated Service Operator & Bond Depositor",
            status: "Active",
            verified: true,
          },
        ]
      : []),
    ...(contractState?.client
      ? [
          {
            name: "SLA Client Enterprise Account",
            address: contractState.client,
            role: "Protected Enterprise Beneficiary",
            status: "Active",
            verified: true,
          },
        ]
      : []),
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              On-Chain Audit
            </span>
            <span className="text-xs text-slate-400 font-mono">Studionet Explorer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            Contract Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Full transparency into deployed intelligent contracts, Studionet validators, RPC nodes, and bytecode storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <a
            href="https://github.com/genlayerlabs/genlayer-project-boilerplate"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-portal-secondary text-xs no-underline"
          >
            <Code2 size={13} />
            <span>GitHub Boilerplate</span>
            <ArrowUpRight size={12} className="text-slate-400" />
          </a>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GenLayer Studionet (Live)</span>
          </div>
        </div>
      </div>

      {/* Main Intelligent Contract Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Box size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Primary Intelligent Contract
                </span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle size={10} />
                  Deployed
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-mono font-semibold text-slate-900 break-all">
                  {CONTRACT_ADDRESS}
                </span>
                <CopyButton text={CONTRACT_ADDRESS} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-portal-secondary text-xs no-underline"
            >
              <ExternalLink size={12} />
              <span>View on Studio Explorer</span>
            </a>
          </div>
        </div>

        {/* Contract Key Metrics */}
        {!loading && contractState && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">Network</div>
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Globe size={11} className="text-purple-600" />
                <span>GenLayer Studionet</span>
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">State</div>
              <div className="text-xs font-semibold text-slate-900">
                <StatusBadge status={contractState.state} />
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">Provider Address</div>
              <div className="text-xs font-mono text-slate-900 truncate">
                {contractState.provider ? `${contractState.provider.slice(0, 8)}...` : "—"}
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">Client Address</div>
              <div className="text-xs font-mono text-slate-900 truncate">
                {contractState.client ? `${contractState.client.slice(0, 8)}...` : "—"}
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">Locked Collateral</div>
              <div className="text-xs font-mono font-semibold text-purple-700">
                {formatBond(contractState.remaining_bond)}
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100 rounded-lg p-2.5">
              <div className="text-[10px] text-slate-400 font-medium mb-0.5">Quorum Rule</div>
              <div className="text-xs font-semibold text-slate-900">
                {contractState.quorum_required} Sources
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Studionet Ecosystem Contracts Table (Matching Image 2 Reference) */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="px-5 py-4 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Registered Studionet Contracts
            </h3>
          </div>
          <span className="text-[10px] font-mono uppercase text-slate-400">
            {ecosystemContracts.length} On-Chain Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-mono text-[10px] uppercase">
                <th className="py-2.5 px-4 font-semibold">Contract Name</th>
                <th className="py-2.5 px-4 font-semibold">Role / Description</th>
                <th className="py-2.5 px-4 font-semibold">Address</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ecosystemContracts.map((c, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{c.role}</td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span>{c.address.slice(0, 10)}...{c.address.slice(-6)}</span>
                      <button
                        onClick={() => copyAddress(c.address)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
                        title="Copy Address"
                      >
                        {copiedAddress === c.address ? (
                          <Check size={11} className="text-emerald-600" />
                        ) : (
                          <Copy size={11} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle size={10} />
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <a
                      href={`${GENLAYER_EXPLORER_URL}/contracts/${c.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-500 hover:text-purple-600 no-underline font-medium"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live GenLayer Node Configuration Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
          <div>
            <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-purple-700">
              Live Connection Manager
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
              GenLayer JSON-RPC Node Endpoint
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                rpcStatus?.connected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            <span className="text-xs font-mono font-medium text-slate-700">
              {rpcStatus?.connected
                ? `Online (${rpcStatus.latencyMs ?? 0}ms)`
                : "Offline / Simulator Fallback"}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="http://localhost:4000/api"
            className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50"
          />
          <button
            onClick={() => {
              setRpcUrl(inputUrl);
              refreshState();
            }}
            className="btn-portal-primary"
          >
            Apply
          </button>
          <button
            onClick={async () => {
              setTesting(true);
              await checkRpc(inputUrl);
              setTesting(false);
            }}
            disabled={testing}
            className="btn-portal-secondary flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={12} className={testing ? "animate-spin" : ""} />
            <span>Ping RPC</span>
          </button>
        </div>
        {rpcStatus?.error && (
          <p className="text-[11px] text-rose-600 mt-2 font-medium">
            Error: {rpcStatus.error}. Make sure your GenLayer Studio node is running (e.g. <code>genlayer up</code>).
          </p>
        )}
      </div>

      {/* Claims History */}
      <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-xs mb-6">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Incident Claims &amp; Settlement Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {contractState?.history?.length || 0} Records
          </span>
        </div>

        {loading ? (
          <div className="p-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton w-full h-4 mb-3" />
            ))}
          </div>
        ) : !contractState || contractState.history.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-xs text-slate-400">
              No claims have been processed yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-mono text-[10px] uppercase">
                  <th className="py-2.5 px-4 font-semibold">Incident ID</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Severity</th>
                  <th className="py-2.5 px-4 font-semibold">Penalty Slashed</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Compensation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contractState.history.map((claim: ClaimHistoryEntry, idx: number) => {
                  const status = getClaimStatus(claim);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {claim.incident_id || `Case #${idx + 1}`}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded ${
                            claim.impact === "major"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : claim.impact === "minor"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {claim.impact?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {claim.penalty_bps != null ? formatBps(claim.penalty_bps) : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-right">
                        {claim.payout_amount != null ? formatBond(claim.payout_amount) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raw State (debug) */}
      {contractState && (
        <details className="mt-6 bg-slate-50 rounded-xl border border-slate-200 p-3.5">
          <summary className="text-xs font-mono text-slate-600 cursor-pointer select-none">
            Show raw Intelligent Contract bytecode storage (JSON)
          </summary>
          <div className="mt-3 p-3.5 rounded-lg bg-slate-900 text-slate-100 overflow-x-auto">
            <pre className="font-mono text-xs">
              {JSON.stringify(contractState, null, 2)}
            </pre>
          </div>
        </details>
      )}
    </div>
  );
}
