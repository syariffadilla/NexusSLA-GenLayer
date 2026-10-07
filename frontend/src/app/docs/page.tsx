"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { CONTRACT_ADDRESS, GENLAYER_EXPLORER_URL } from "@/lib/contract";
import {
  BookOpen,
  Shield,
  UserCheck,
  Cpu,
  Scale,
  Code2,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap,
  Globe,
  Radio,
  FileCode,
} from "lucide-react";

export default function DocumentationPage() {
  const {
    rpcUrl,
    setRpcUrl,
    rpcStatus,
    checkRpc,
    userRole,
    wallet,
  } = useNexus();

  const [copiedContract, setCopiedContract] = useState(false);
  const [testRpcLoading, setTestRpcLoading] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState(rpcUrl);
  const [activeTab, setActiveTab] = useState<"roles" | "testing" | "architecture" | "contract">("roles");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
  };

  const handleTestRpc = async () => {
    setTestRpcLoading(true);
    await checkRpc(customUrlInput);
    setTestRpcLoading(false);
  };

  const handleApplyRpc = () => {
    setRpcUrl(customUrlInput);
    checkRpc(customUrlInput);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header Banner */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 mb-3">
          <BookOpen size={13} />
          <span>NexusSLA Protocol Documentation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Role Governance &amp; Real Data Testing Guide
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-3xl leading-relaxed">
          Learn how NexusSLA determines <strong>Client</strong> vs <strong>Provider</strong> roles on-chain using GenLayer
          Intelligent Contracts, how cryptographic access control is strictly enforced, and follow the step-by-step
          testing guide with real on-chain data and the official{" "}
          <a
            href={GENLAYER_EXPLORER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 font-bold underline"
          >
            GenLayer Studio Explorer
          </a>.
        </p>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
            activeTab === "roles"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <UserCheck size={15} />
            <span>1. Client vs Provider Determination</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("testing")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
            activeTab === "testing"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Radio size={15} />
            <span>2. Real Data Testing Guide</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
            activeTab === "architecture"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Scale size={15} />
            <span>3. AI Court &amp; Consensus Flow</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab("contract")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer border-none ${
            activeTab === "contract"
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <FileCode size={15} />
            <span>4. Smart Contract Code</span>
          </div>
        </button>
      </div>

      {/* TAB 1: ROLES DETERMINATION */}
      {activeTab === "roles" && (
        <div className="space-y-8">
          {/* Summary Box */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-purple-700 uppercase">
                  Fundamental Concept
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  How Are Client and Provider Roles Determined?
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
                  Roles are <strong>not</strong> defined by traditional username/password logins. Instead, they are
                  permanently stored in the <strong>on-chain smart contract state</strong> at deployment time. Every
                  transaction is verified cryptographically against the signer&apos;s address (<code>gl.message.sender_address</code>).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                  Auto-detected from Web3 Wallet
                </span>
              </div>
            </div>
          </div>

          {/* Three Tier Determination Architecture */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black mb-3">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Constructor Registration
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When deployed to GenLayer, the contract constructor permanently binds both addresses to on-chain state:
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <span className="text-purple-400">def</span> __init__(self, provider, client):<br />
                &nbsp;&nbsp;self.provider = Address(provider)<br />
                &nbsp;&nbsp;self.client = Address(client)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black mb-3">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Method-Level Guards
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Each contract execution validates <code>gl.message.sender_address</code> (equivalent to <code>msg.sender</code> in Solidity):
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <span className="text-rose-400">if</span> gl.message.sender_address != self.provider:<br />
                &nbsp;&nbsp;<span className="text-amber-400">raise Exception</span>(<span className="text-emerald-300">&quot;Provider only&quot;</span>)
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black mb-3">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Automatic Frontend Detection
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The dApp matches the connected wallet address against on-chain contract state in real time:
              </p>
              <div className="mt-3 p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                current === state.provider ? &quot;Provider&quot; :<br />
                current === state.client ? &quot;Client&quot; : &quot;Auditor&quot;
              </div>
            </div>
          </div>

          {/* Access Control Matrix Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Role Permission Matrix (Smart Contract Access Control)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mapping of Intelligent Contract methods to authorized caller roles and financial outcomes.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                Strict Guarded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100/70 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Contract Method</th>
                    <th className="px-5 py-3">Authorized Caller</th>
                    <th className="px-5 py-3">On-Chain Precondition</th>
                    <th className="px-5 py-3">Financial &amp; State Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      deposit_bond()
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        Provider Only
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Sender == <code>self.provider</code>, not previously deposited, value == <code>bond_amount</code>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      Locks collateral bond in escrow. Contract transitions to <strong>ACTIVE</strong>.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      file_claim(urls)
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                        Client Only
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Sender == <code>self.client</code>, state <strong>ACTIVE</strong>, URLs from registered whitelist meeting quorum
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      Triggers GenLayer AI Court validators to render web status pages and run LLM comparative consensus.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      dispute_claim(urls)
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        Provider Only
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Sender == <code>self.provider</code>, active claim (<code>CLAIM_PENDING</code>), not previously disputed
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      Submits counter-evidence. AI Court re-evaluates whether downtime was mitigated or false-positive.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      finalize_claim()
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Public (Anyone)
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Claim is in finalization window (after dispute or review expiry)
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      <strong>Payout is automatically transferred natively to Client</strong>. Slashed collateral is deducted from provider bond.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      withdraw_remaining_bond()
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                        Provider Only
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Sender == <code>self.provider</code>, SLA contract duration expired (<code>block.timestamp &gt; end</code>)
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      Remaining un-slashed collateral returned to Provider wallet. Contract transitions to <code>CLOSED</code>.
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-purple-700">
                      get_state()
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold">
                        Public (Read-Only View)
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      Free call (zero gas). Readable by any explorer, validator, auditor, or frontend.
                    </td>
                    <td className="px-5 py-3.5 text-slate-800">
                      Returns entire on-chain state snapshot (provider, client, remaining bond, quorum, pending claim, history).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REAL DATA TESTING GUIDE */}
      {activeTab === "testing" && (
        <div className="space-y-8">
          {/* RPC Diagnostic & Connection Box */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-purple-700 uppercase">
                  GenLayer RPC Connection &amp; Explorer
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  Live Node Configuration
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Live on-chain queries via GenLayer Studio RPC connected to intelligent contract storage.
                </p>
              </div>

              {/* Mode Badge */}
              <div className="flex items-center gap-2">
                <div className="px-3.5 py-2 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Active Mode: Live GenLayer RPC</span>
                </div>
              </div>
            </div>

            {/* Input RPC URL */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  GenLayer JSON-RPC Endpoint URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="http://localhost:4000/api"
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleApplyRpc}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={handleTestRpc}
                    disabled={testRpcLoading}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={testRpcLoading ? "animate-spin" : ""} />
                    <span>Ping RPC</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Default local GenLayer Studio endpoint: <code>http://localhost:4000/api</code>
                </p>
              </div>

              {/* Status Indicator */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Node Health Status
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rpcStatus?.connected
                          ? "bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-800">
                      {rpcStatus
                        ? rpcStatus.connected
                          ? "Node Online & Reachable"
                          : "Node Offline / Simulator Active"
                        : "Not Tested Yet"}
                    </span>
                  </div>
                </div>
                {rpcStatus?.latencyMs !== undefined && (
                  <span className="text-[10px] font-mono text-slate-500 mt-1">
                    Latency: {rpcStatus.latencyMs} ms
                  </span>
                )}
                {rpcStatus?.error && (
                  <span className="text-[10px] text-rose-600 mt-1 line-clamp-1" title={rpcStatus.error}>
                    {rpcStatus.error}
                  </span>
                )}
              </div>
            </div>

            {/* Official Explorer Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Globe size={14} className="text-purple-600" />
                <span>Official Explorer:</span>
                <a
                  href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-purple-600 hover:text-purple-800 font-bold underline flex items-center gap-1"
                >
                  <span>{GENLAYER_EXPLORER_URL}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div className="text-xs text-slate-400">
                Contract: <span className="font-mono">{CONTRACT_ADDRESS.slice(0, 14)}...</span>
              </div>
            </div>
          </div>

          {/* Step by Step Testing Workflow */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              End-to-End SLA Dispute Testing Walkthrough
            </h3>

            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 1: Connect as Provider &amp; Deposit Collateral Bond
                  </h4>
                  <Link href="/sla" className="text-xs font-bold text-purple-600 hover:text-purple-800 no-underline">
                    Open SLA Contracts &rarr;
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Switch account to the designated Provider (<code>0x34242f09a2646eF4383C672b8a6BFDC9634cB232</code>).
                  Open the <strong>SLA Contracts</strong> page and click <strong>Deposit Bond</strong>.
                  Deposit <code>1.00 GEN</code> to lock collateral into the escrow state.
                </p>
                <div className="mt-2.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-700">
                  On-Chain Call: <code>nexus_sla.deposit_bond() (value: 1000000000000000000 wei)</code>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 2: Switch to Client &amp; File an Outage Claim
                  </h4>
                  <Link href="/claims/new" className="text-xs font-bold text-purple-600 hover:text-purple-800 no-underline">
                    File Claim Form &rarr;
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Switch account to the Client (<code>0x90e1644d995B2488d4a2Bf24b88D67e04A3F9D5d</code>).
                  Go to <strong>File Outage Claim</strong>. Provide valid URLs from registered status domains:
                </p>
                <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-700">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    URL 1: <code>https://www.githubstatus.com/api/v2/incidents.json</code>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    URL 2: <code>https://status.openai.com/api/v2/incidents.json</code>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  GenLayer validators execute <code>gl.nondet.web.render()</code> and LLM prompts to verify the outage claim.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 3: (Optional) Provider Submits Dispute Counter-Evidence
                  </h4>
                  <Link href="/claims" className="text-xs font-bold text-purple-600 hover:text-purple-800 no-underline">
                    View Claims List &rarr;
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  If the Provider believes the outage was a false-positive or mitigated within acceptable thresholds,
                  the Provider calls <code>dispute_claim(evidence_urls)</code>.
                  GenLayer AI validators re-evaluate using comparative consensus.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black flex-shrink-0">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">
                    Step 4: Finalization &amp; Automated Payout to Client
                  </h4>
                  <Link href="/court" className="text-xs font-bold text-purple-600 hover:text-purple-800 no-underline">
                    Open AI Court &rarr;
                  </Link>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Once the review window expires or dispute concludes, <code>finalize_claim()</code> is called.
                  The smart contract deterministically slashes the penalty from the bond and transfers native GEN
                  directly to the Client wallet without intermediaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE & AI CONSENSUS */}
      {activeTab === "architecture" && (
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">
              GenLayer Non-Deterministic Architecture &amp; AI Consensus
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              Unlike traditional blockchains (e.g. Ethereum) which cannot fetch live web data or perform natural language reasoning,
              GenLayer empowers Intelligent Contracts to execute non-deterministic web and LLM consensus securely:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
                  <Globe size={16} className="text-purple-600" />
                  <span>1. Direct Web Evidence Extraction</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Validators independently fetch real-world status page contents without centralized oracles via:
                </p>
                <div className="mt-2 p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                  page = gl.nondet.web.render(url, mode=&quot;text&quot;)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
                  <Cpu size={16} className="text-purple-600" />
                  <span>2. LLM Judicial Reasoning</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  An impartial AI judge prompt analyzes evidence, severity (major/minor), and estimated downtime:
                </p>
                <div className="mt-2 p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                  res = gl.nondet.exec_prompt(prompt, response_format=&quot;json&quot;)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
                  <Scale size={16} className="text-purple-600" />
                  <span>3. Equivalence Principle Consensus</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Validators execute independent LLMs. <code>gl.eq_principle.prompt_comparative</code> aligns semantic agreement:
                </p>
                <div className="mt-2 p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                  gl.eq_principle.prompt_comparative(check_incident, criteria)
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-2">
                  <Shield size={16} className="text-purple-600" />
                  <span>4. Deterministic Native Slashing</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Once consensus is locked, the penalty transfer is executed deterministically on the GenLayer state machine:
                </p>
                <div className="mt-2 p-2 rounded bg-slate-900 text-slate-200 font-mono text-[11px]">
                  self._transfer_native(self.client, payout)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SMART CONTRACT CODE REFERENCE */}
      {activeTab === "contract" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  GenLayer Intelligent Contract (nexus_sla.py)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Python-based smart contract deployed on the GenLayer Studio node.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1.5 no-underline border border-purple-200"
                >
                  <ExternalLink size={13} />
                  <span>View in Explorer</span>
                </a>
                <button
                  onClick={() => copyToClipboard(CONTRACT_ADDRESS)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1.5"
                >
                  {copiedContract ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  <span>Copy Address</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed">
              <pre>{`# v0.3.0 - NexusSLA (Fair & Impartial AI Court)
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json

class NexusSLA(gl.Contract):
    provider: Address
    client: Address
    evidence_domains_json: str
    quorum_required: u256
    start: u256
    end: u256
    bond_amount: u256
    bond_deposited: bool
    remaining_bond: u256
    state: str
    tier_thresholds_json: str
    tier_penalties_json: str
    claims_history_json: str
    pending_claim_json: str

    def __init__(
        self,
        provider: str,
        client: str,
        evidence_domains_json: str,
        quorum_required: int,
        start: int,
        end: int,
        bond_amount: int,
        tier_uptime_thresholds_json: str,
        tier_penalty_json: str,
    ):
        provider_addr = Address(provider)
        client_addr = Address(client)
        assert provider_addr != client_addr, "Provider and client must be distinct"
        assert bond_amount > 0, "Bond amount must be positive"

        self.provider = provider_addr
        self.client = client_addr
        self.evidence_domains_json = evidence_domains_json
        self.quorum_required = u256(quorum_required)
        self.bond_amount = u256(bond_amount)
        self.bond_deposited = False
        self.remaining_bond = u256(0)
        self.state = "UNINITIALIZED"

    @gl.public.write.payable
    def deposit_bond(self) -> None:
        if gl.message.sender_address != self.provider:
            raise Exception("Only the provider may deposit bond")
        if self.bond_deposited:
            raise Exception("Bond already deposited")
        assert gl.message.value == self.bond_amount
        self.bond_deposited = True
        self.remaining_bond = gl.message.value
        self.state = "ACTIVE"

    @gl.public.write
    def file_claim(self, evidence_urls_json: str) -> None:
        if gl.message.sender_address != self.client:
            raise Exception("Only the client may file a claim")
        if self.state != "ACTIVE":
            raise Exception("Contract is not in ACTIVE state")
        # Non-deterministic web rendering and AI consensus...`}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="mt-10 p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold">Ready to Test the Contract?</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Use the NexusSLA web app to create agreements, file claims, or inspect AI consensus rulings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors no-underline flex items-center gap-1.5"
          >
            <ExternalLink size={13} />
            <span>Studio Explorer</span>
          </a>
          <Link href="/sla" className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-slate-100 transition-colors no-underline">
            SLA Agreements
          </Link>
          <Link href="/claims/new" className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors no-underline">
            File New Claim
          </Link>
        </div>
      </div>
    </div>
  );
}
