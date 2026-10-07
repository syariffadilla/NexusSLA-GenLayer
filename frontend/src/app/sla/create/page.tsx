"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNexus } from "@/context/NexusContext";
import { deploySlaContract, GENLAYER_EXPLORER_URL } from "@/lib/contract";
import { CopyButton } from "@/components/ui/CoreComponents";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Users,
} from "lucide-react";

export default function CreateSLAPage() {
  const router = useRouter();
  const { wallet, addKnownContract } = useNexus();

  const [title, setTitle] = useState("Production API Reliability SLA");
  const [provider, setProvider] = useState("");
  const [client, setClient] = useState("");
  const [bondAmount, setBondAmount] = useState("1.00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quorum, setQuorum] = useState("2");
  const [domains, setDomains] = useState([
    "githubstatus.com",
    "status.cloud.google.com",
  ]);

  const [thresholds] = useState(["99.90", "99.00", "95.00"]);
  const [penalties] = useState(["500", "1500", "4000"]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState<string | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [deployedResult, setDeployedResult] = useState<{
    contractAddress: string;
    hash: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-fill defaults on mount
  useEffect(() => {
    if (wallet.connected && wallet.address && !provider) {
      setProvider(wallet.address);
    }
  }, [wallet.connected, wallet.address, provider]);

  useEffect(() => {
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const formatLocal = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    if (!startDate) setStartDate(formatLocal(now));
    if (!endDate) setEndDate(formatLocal(thirtyDaysLater));
  }, [startDate, endDate]);

  const addDomain = () => setDomains([...domains, ""]);
  const removeDomain = (idx: number) => setDomains(domains.filter((_, i) => i !== idx));
  const updateDomain = (idx: number, val: string) => {
    const updated = [...domains];
    updated[idx] = val;
    setDomains(updated);
  };

  const handleDeploy = async () => {
    setDeployError(null);
    setDeploying(true);
    setDeployStep("1/3: Validating parameters and contract source...");

    try {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Please connect your wallet first before deploying.");
      }

      const pAddr = provider.trim();
      const cAddr = client.trim();
      const addressRe = /^0x[0-9a-fA-F]{40}$/;

      if (!addressRe.test(pAddr)) {
        throw new Error("Provider address must be a valid 40-character 0x address.");
      }
      if (!addressRe.test(cAddr)) {
        throw new Error("Client address must be a valid 40-character 0x address.");
      }
      if (pAddr.toLowerCase() === cAddr.toLowerCase()) {
        throw new Error("Provider and Client must be different addresses (bilateral agreement).");
      }

      const bondNum = parseFloat(bondAmount);
      if (isNaN(bondNum) || bondNum <= 0) {
        throw new Error("Bond amount must be greater than 0 GEN.");
      }
      const bondWei = (BigInt(Math.round(bondNum * 1e9)) * BigInt(1e9)).toString();

      const startTs = Math.floor(new Date(startDate).getTime() / 1000);
      const endTs = Math.floor(new Date(endDate).getTime() / 1000);
      if (isNaN(startTs) || isNaN(endTs) || endTs <= startTs) {
        throw new Error("End date must be strictly after start date.");
      }

      const filteredDomains = domains.map((d) => d.trim()).filter(Boolean);
      if (filteredDomains.length === 0) {
        throw new Error("At least 1 valid evidence domain is required.");
      }

      const quorumNum = parseInt(quorum, 10);
      if (isNaN(quorumNum) || quorumNum < 1 || quorumNum > filteredDomains.length) {
        throw new Error(
          `Quorum must be between 1 and total registered domains (${filteredDomains.length}).`
        );
      }

      // Convert percentages into basis points (e.g. 99.90% -> 9990 bps)
      const tierUptimeThresholdsBps: Record<string, number> = {
        P1: Math.round(parseFloat(thresholds[0] || "99.90") * 100),
        P2: Math.round(parseFloat(thresholds[1] || "99.00") * 100),
        P3: Math.round(parseFloat(thresholds[2] || "95.00") * 100),
      };

      const tierPenaltyBps: Record<string, number> = {
        P1: parseInt(penalties[0] || "500", 10),
        P2: parseInt(penalties[1] || "1500", 10),
        P3: parseInt(penalties[2] || "4000", 10),
      };

      setDeployStep("2/3: Broadcasting deployment transaction to GenLayer Studionet...");

      const result = await deploySlaContract({
        fromAddress: wallet.address,
        provider: pAddr,
        client: cAddr,
        evidenceDomains: filteredDomains,
        quorumRequired: quorumNum,
        start: startTs,
        end: endTs,
        bondAmountWei: bondWei,
        tierUptimeThresholdsBps,
        tierPenaltyBps,
      });

      setDeployStep("3/3: Finalizing contract deployment and recording state...");

      // Register new agreement into multi-contract storage
      addKnownContract({
        address: result.contractAddress,
        title: title.trim() || "Custom SLA Agreement",
        provider: pAddr,
        client: cAddr,
        createdAt: Date.now(),
      });

      setDeployedResult({
        contractAddress: result.contractAddress,
        hash: result.hash,
      });
      setShowConfirm(false);
    } catch (err) {
      setDeployError(err instanceof Error ? err.message : "Deployment failed.");
    } finally {
      setDeploying(false);
      setDeployStep(null);
    }
  };

  const shareableClientUrl =
    typeof window !== "undefined" && deployedResult
      ? `${window.location.origin}/dashboard?contract=${deployedResult.contractAddress}`
      : "";

  const copyShareableLink = () => {
    if (!shareableClientUrl) return;
    navigator.clipboard.writeText(shareableClientUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // If deployment succeeded, show the complete success panel
  if (deployedResult) {
    return (
      <div className="container-nexus py-10 max-w-2xl">
        <div className="glass-card p-8 animate-fade-in-up border-2 border-emerald-500/30">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle size={28} />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-2">
            SLA Contract Successfully Deployed!
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            Your bilateral SLA contract is live on GenLayer Studionet. Both parties can now view and interact with this agreement.
          </p>

          <div className="space-y-4 mb-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Deployed Contract Address
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="mono text-xs font-bold text-purple-700 break-all select-all">
                  {deployedResult.contractAddress}
                </span>
                <CopyButton text={deployedResult.contractAddress} />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
              <div className="flex items-center gap-2 mb-1.5">
                <Users size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-purple-900">
                  Ready for Two-Wallet Testing (Chrome 1 & Chrome 2)
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                Copy this link and open it in your other Chrome browser window (where the Client wallet is installed). The dashboard will automatically recognize that window as the <strong>Client</strong>!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareableClientUrl}
                  className="input-field input-mono text-xs flex-1 bg-white select-all"
                />
                <button
                  onClick={copyShareableLink}
                  className="btn-primary text-xs flex items-center gap-1.5 whitespace-nowrap"
                  style={{ padding: "8px 14px" }}
                >
                  {copiedLink ? <CheckCircle size={14} /> : <Copy size={14} />}
                  <span>{copiedLink ? "Copied!" : "Copy URL"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/dashboard?contract=${deployedResult.contractAddress}`)}
              className="btn-primary flex-1 justify-center"
            >
              Go to Dashboard
            </button>
            <a
              href={`${GENLAYER_EXPLORER_URL}/contracts/${deployedResult.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex-1 justify-center no-underline inline-flex items-center gap-1.5"
            >
              <span>View on Explorer</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-nexus py-10">
      <Link href="/sla" className="btn-ghost no-underline text-xs mb-6 inline-flex">
        <ArrowLeft size={14} />
        Back to SLA Contracts
      </Link>

      <div className="section-header">
        <h1>Deploy SLA Contract</h1>
        <p>Deploy a new bilateral reliability agreement directly to GenLayer Studionet.</p>
      </div>

      <div className="max-w-2xl">
        {/* Title */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-4" style={{ color: "var(--text-muted)" }}>
            Agreement Title
          </h3>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Production API Reliability SLA"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Contract Parties */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              Contract Parties
            </h3>
            {wallet.connected && wallet.address && (
              <button
                type="button"
                onClick={() => setProvider(wallet.address || "")}
                className="text-xs text-purple-600 hover:text-purple-700 font-semibold border-none bg-transparent cursor-pointer"
              >
                Use My Wallet as Provider
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Provider Address (Service Provider / Collateral Depositor)
              </label>
              <input
                type="text"
                className="input-field input-mono"
                placeholder="0x..."
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
              {wallet.connected && wallet.address && provider.toLowerCase() === wallet.address.toLowerCase() && (
                <span className="text-[11px] text-emerald-600 font-medium mt-1 inline-block">
                  ✓ Matches your connected wallet (Chrome 1)
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Client Address (Enterprise Consumer / Outage Claimant)
              </label>
              <input
                type="text"
                className="input-field input-mono"
                placeholder="0x..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
              <span className="text-[11px] text-slate-400 mt-1 inline-block">
                Enter your second test wallet address (e.g. MetaMask Account 2 or Rabby Wallet on Chrome 2).
              </span>
            </div>
          </div>
        </div>

        {/* Bond & Period */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-1">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Bond & Period
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Bond Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  className="input-field input-mono"
                  placeholder="1.00"
                  value={bondAmount}
                  onChange={(e) => setBondAmount(e.target.value)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  GEN
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                SLA Start
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                SLA End
              </label>
              <input
                type="datetime-local"
                className="input-field"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Required AI Oracle Quorum
            </label>
            <input
              type="number"
              className="input-field w-24"
              min="1"
              max={domains.length}
              value={quorum}
              onChange={(e) => setQuorum(e.target.value)}
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Minimum independent status pages that must agree for consensus.
            </span>
          </div>
        </div>

        {/* Evidence Domains */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-2">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Evidence Domains Whitelist
          </h3>

          <div className="space-y-3">
            {domains.map((domain, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input-field input-mono flex-1"
                  placeholder="status.example.com"
                  value={domain}
                  onChange={(e) => updateDomain(idx, e.target.value)}
                />
                {domains.length > 1 && (
                  <button
                    onClick={() => removeDomain(idx)}
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
            ))}
          </div>

          <button
            onClick={addDomain}
            className="btn-ghost mt-3 text-xs"
            style={{ color: "var(--accent-secondary)" }}
          >
            <Plus size={14} />
            Add Domain
          </button>
        </div>

        {/* Uptime Thresholds */}
        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Uptime Thresholds & Penalty Tiers
          </h3>

          <div className="overflow-x-auto">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Uptime Threshold</th>
                  <th>Penalty (Basis Points)</th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((t, idx) => (
                  <tr key={idx}>
                    <td className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Tier {idx + 1}
                    </td>
                    <td>
                      <span className="mono">≤ {t}%</span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: "var(--accent-secondary)" }}>
                        {penalties[idx]} bps ({(parseInt(penalties[idx], 10) / 100).toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {deployError && (
          <div className="p-4 rounded-xl mb-6 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{deployError}</span>
          </div>
        )}

        <button
          className="btn-primary w-full justify-center"
          style={{ padding: "14px 24px" }}
          onClick={() => {
            setDeployError(null);
            setShowConfirm(true);
          }}
        >
          <Shield size={16} />
          Deploy SLA Agreement
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => !deploying && setShowConfirm(false)}>
          <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Deploy Intelligent Contract
            </h3>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              This action compiles and deploys the full Python Intelligent Contract to GenLayer Studionet using your connected wallet.
            </p>

            <div className="space-y-3 mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Agreement Title:</span>
                <span className="font-semibold text-slate-800">{title}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Provider:</span>
                <span className="mono font-semibold text-slate-800">
                  {provider ? `${provider.slice(0, 8)}...${provider.slice(-4)}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Client:</span>
                <span className="mono font-semibold text-slate-800">
                  {client ? `${client.slice(0, 8)}...${client.slice(-4)}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Bond Amount:</span>
                <span className="mono font-bold text-slate-800">{bondAmount} GEN</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Oracle Quorum:</span>
                <span className="font-semibold text-slate-800">{quorum} of {domains.filter(Boolean).length} sources</span>
              </div>
            </div>

            {deployStep && (
              <div className="p-3 rounded-xl mb-4 bg-purple-50 border border-purple-200 flex items-center gap-2.5 text-xs text-purple-800 font-medium">
                <Loader2 size={16} className="text-purple-600 animate-spin flex-shrink-0" />
                <span>{deployStep}</span>
              </div>
            )}

            {deployError && (
              <div className="p-3 rounded-xl mb-4 bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <span>{deployError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1 justify-center"
                disabled={deploying}
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary flex-1 justify-center"
                disabled={deploying}
                onClick={handleDeploy}
              >
                {deploying ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deploying...</span>
                  </>
                ) : (
                  <span>Confirm & Deploy</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
