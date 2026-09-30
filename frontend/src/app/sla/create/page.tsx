"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Shield } from "lucide-react";

export default function CreateSLAPage() {
  const [provider, setProvider] = useState("");
  const [client, setClient] = useState("");
  const [bondAmount, setBondAmount] = useState("1.00");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quorum, setQuorum] = useState("2");
  const [domains, setDomains] = useState(["githubstatus.com", "status.cloud.google.com"]);
  const [thresholds] = useState(["99.90", "99.00", "95.00"]);
  const [penalties] = useState(["500", "1500", "4000"]);
  const [showConfirm, setShowConfirm] = useState(false);

  const addDomain = () => setDomains([...domains, ""]);
  const removeDomain = (idx: number) => setDomains(domains.filter((_, i) => i !== idx));
  const updateDomain = (idx: number, val: string) => {
    const updated = [...domains];
    updated[idx] = val;
    setDomains(updated);
  };

  return (
    <div className="container-nexus py-10">
      <Link href="/sla" className="btn-ghost no-underline text-xs mb-6 inline-flex">
        <ArrowLeft size={14} />
        Back to SLA Contracts
      </Link>

      <div className="section-header">
        <h1>Create SLA Contract</h1>
        <p>Deploy a new reliability agreement on GenLayer.</p>
      </div>

      <div className="max-w-2xl">
        <div className="glass-card p-6 mb-6 animate-fade-in-up">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Contract Parties
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Provider Address
              </label>
              <input
                type="text"
                className="input-field input-mono"
                placeholder="0x..."
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Client Address
              </label>
              <input
                type="text"
                className="input-field input-mono"
                placeholder="0x..."
                value={client}
                onChange={(e) => setClient(e.target.value)}
              />
            </div>
          </div>
        </div>

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
              Required Quorum
            </label>
            <input
              type="number"
              className="input-field w-24"
              min="1"
              value={quorum}
              onChange={(e) => setQuorum(e.target.value)}
            />
          </div>
        </div>

        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-2">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Evidence Domains
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

        <div className="glass-card p-6 mb-6 animate-fade-in-up stagger-3">
          <h3 className="text-sm font-semibold tracking-widest uppercase mb-5" style={{ color: "var(--text-muted)" }}>
            Uptime Thresholds & Penalty Tiers
          </h3>

          <div className="overflow-x-auto">
            <table className="nexus-table">
              <thead>
                <tr>
                  <th>Tier</th>
                  <th>Uptime ≤</th>
                  <th>Penalty (bps)</th>
                </tr>
              </thead>
              <tbody>
                {thresholds.map((t, idx) => (
                  <tr key={idx}>
                    <td className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Tier {idx + 1}
                    </td>
                    <td>
                      <span className="mono">{t}%</span>
                    </td>
                    <td>
                      <span className="mono" style={{ color: "var(--accent-secondary)" }}>
                        {penalties[idx]} bps
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button
          className="btn-primary w-full justify-center"
          style={{ padding: "14px 24px" }}
          onClick={() => setShowConfirm(true)}
        >
          <Shield size={16} />
          Deploy SLA
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal-content animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-5" style={{ color: "var(--text-primary)" }}>
              Review SLA
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Provider</span>
                <span className="mono text-xs" style={{ color: "var(--text-primary)" }}>
                  {provider ? `${provider.slice(0, 8)}...${provider.slice(-4)}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Client</span>
                <span className="mono text-xs" style={{ color: "var(--text-primary)" }}>
                  {client ? `${client.slice(0, 8)}...${client.slice(-4)}` : "Not set"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Bond</span>
                <span className="mono" style={{ color: "var(--text-primary)" }}>
                  {bondAmount} GEN
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Quorum</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {quorum} sources
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "var(--text-muted)" }}>Domains</span>
                <span style={{ color: "var(--text-primary)" }}>
                  {domains.filter(Boolean).length}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="btn-secondary flex-1 justify-center"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button className="btn-primary flex-1 justify-center">
                Confirm & Deploy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
