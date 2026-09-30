"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

/**
 * GenLayer Delta Logo — The official triangular prism mark from GenLayer Portal
 */
export function GenLayerLogo({
  size = 28,
  className = "",
  fill = "#0F172A",
}: {
  size?: number;
  className?: string;
  fill?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M 99,95 L 92,109 L 92,111 L 86,122 L 86,124 L 98,130 L 101,130 L 113,124 L 113,122 Z" />
      <path d="M 107,28 L 107,77 L 132,128 L 130,132 L 109,142 L 174,167 Z" />
      <path d="M 92,28 L 25,167 L 90,142 L 69,132 L 67,128 L 92,77 Z" />
    </svg>
  );
}

/**
 * Legacy compatibility alias for NexusLogo
 */
export const NexusLogo = GenLayerLogo;

/**
 * Animated GenLayer Spinner component (used in splash & loaders)
 */
export function GenLayerSpinner({ size = "large" }: { size?: "small" | "large" }) {
  const dim = size === "large" ? 72 : 36;
  return (
    <div className={`genlayer-spinner ${size}`}>
      <svg
        width={dim}
        height={dim}
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="gl-path gl-center"
          d="M 99,95 L 92,109 L 92,111 L 86,122 L 86,124 L 98,130 L 101,130 L 113,124 L 113,122 Z"
        />
        <path
          className="gl-path gl-right"
          d="M 107,28 L 107,77 L 132,128 L 130,132 L 109,142 L 174,167 Z"
        />
        <path
          className="gl-path gl-left"
          d="M 92,28 L 25,167 L 90,142 L 69,132 L 67,128 L 92,77 Z"
        />
      </svg>
    </div>
  );
}

/**
 * GenLayer Chain Network status badge
 */
export function NetworkBadge({ connected = true }: { connected?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white"
      style={{
        borderColor: connected ? "#E2E8F0" : "#FCA5A5",
        fontSize: "12px",
        fontWeight: 500,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      }}
    >
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{
          background: connected ? "#10B981" : "#EF4444",
          boxShadow: connected
            ? "0 0 0 3px rgba(16, 185, 129, 0.15)"
            : "0 0 0 3px rgba(239, 68, 68, 0.15)",
        }}
      />
      <span style={{ color: "#334155" }}>
        {connected ? "GenLayer Chain" : "Disconnected"}
      </span>
    </div>
  );
}

/**
 * Status badge component matching GenLayer Portal tags
 */
export function StatusBadge({ status }: { status: string }) {
  const s = status?.toUpperCase() || "";

  if (s === "PENDING" || s === "CLAIM_PENDING") {
    return (
      <span className="portal-badge portal-badge-amber">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
        Pending review
      </span>
    );
  }

  if (s === "SETTLED" || s === "ACTIVE") {
    return (
      <span className="portal-badge portal-badge-green">
        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
        {s === "ACTIVE" ? "Active" : "Settled"}
      </span>
    );
  }

  if (s === "DISPUTED" || s === "DISPUTE_WINDOW") {
    return (
      <span className="portal-badge portal-badge-purple">
        <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />
        Disputed
      </span>
    );
  }

  return (
    <span className="portal-badge portal-badge-gray">
      <span className="w-1.5 h-1.5 rounded-full bg-[#64748B]" />
      {s || "Dismissed"}
    </span>
  );
}

/**
 * Address display with monospace styling
 */
export function AddressDisplay({
  address,
  length = 6,
}: {
  address: string | null | undefined;
  length?: number;
}) {
  if (!address) return <span className="mono text-muted">—</span>;
  const start = address.slice(0, length + 2);
  const end = address.slice(-length);
  return (
    <span className="mono text-xs font-medium" style={{ color: "var(--text-primary)" }}>
      {start}...{end}
    </span>
  );
}

/**
 * Copy to clipboard button
 */
export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-slate-100 transition-colors"
      style={{
        background: "transparent",
        border: "none",
        color: copied ? "var(--status-success)" : "var(--text-muted)",
        cursor: "pointer",
      }}
      title="Copy to clipboard"
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12 px-4">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <GenLayerLogo size={24} fill="#64748B" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {action && onAction && (
        <button onClick={onAction} className="btn-portal-primary">
          {action}
        </button>
      )}
    </div>
  );
}

/**
 * Banner indicating demo mode
 */
export function DemoBanner({
  onExit,
}: {
  onExit?: () => void;
}) {
  return (
    <div
      className="px-4 py-2 text-xs flex items-center justify-between border-b"
      style={{
        background: "#FEF3C7",
        borderColor: "#FDE68A",
        color: "#92400E",
      }}
    >
      <div className="flex items-center gap-2 mx-auto">
        <span className="font-bold tracking-wider uppercase text-[10px] px-1.5 py-0.5 rounded bg-amber-200">
          DEMO MODE
        </span>
        <span>
          Showing simulated GenLayer Chain state. Connect a local studio RPC to read live on-chain state.
        </span>
      </div>
      {onExit && (
        <button
          onClick={onExit}
          className="text-xs font-semibold underline hover:no-underline text-amber-900"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          Exit Demo
        </button>
      )}
    </div>
  );
}
