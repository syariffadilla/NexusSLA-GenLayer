"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { StatusBadge, AddressDisplay, EmptyState } from "@/components/ui/CoreComponents";
import { formatBond } from "@/lib/formatters";
import { depositBond, withdrawRemainingBond } from "@/lib/contract";
import {
  Plus,
  Shield,
  ExternalLink,
  Coins,
  ArrowDownToLine,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function SLAPage() {
  const { contractState, loading, demoMode, wallet, refreshState } = useNexus();

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1.00");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDeposit = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 1200));
        setActionSuccess(`Deposited ${depositAmount} GEN collateral into SLA contract.`);
        setDepositOpen(false);
      } else {
        if (!wallet.connected || !wallet.address) {
          throw new Error("Wallet not connected. Connect provider wallet first.");
        }
        const wei = Math.floor(parseFloat(depositAmount) * 1e18);
        await depositBond(wallet.address, wei);
        await refreshState();
        setActionSuccess(`Successfully deposited ${depositAmount} GEN bond.`);
        setDepositOpen(false);
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw remaining collateral bond?")) return;
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (demoMode) {
        await new Promise((r) => setTimeout(r, 1200));
        setActionSuccess("Withdrawal simulated successfully.");
      } else {
        if (!wallet.connected || !wallet.address) {
          throw new Error("Wallet not connected. Connect provider wallet first.");
        }
        await withdrawRemainingBond(wallet.address);
        await refreshState();
        setActionSuccess("Remaining bond withdrawn to provider wallet.");
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Collateral Management
            </span>
            <span className="text-xs text-slate-400 font-mono">Agreements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 leading-tight">
            SLA Contracts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage active reliability agreements, bonded provider collateral, and court arbitration parameters.
          </p>
        </div>
        <Link href="/sla/create" className="btn-portal-primary no-underline self-start sm:self-auto">
          <Plus size={13} />
          <span>Create SLA Agreement</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-3 sm:p-4 rounded-xl mb-6 flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium">
          <CheckCircle size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3 sm:p-4 rounded-xl mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-medium">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
              <div className="skeleton w-48 h-5 mb-3" />
              <div className="skeleton w-96 h-4 mb-2" />
              <div className="skeleton w-64 h-4" />
            </div>
          ))}
        </div>
      ) : !contractState || (contractState.state === "UNINITIALIZED" && contractState.history.length === 0) ? (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
          <EmptyState
            title="No Active SLAs"
            description="Create your first SLA agreement and lock provider collateral."
            action="Create SLA"
            onAction={() => (window.location.href = "/sla/create")}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active SLA contract card */}
          <div className="bg-white border border-[#E2E8F0] border-l-4 border-l-purple-600 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    API Reliability Agreement
                  </h3>
                  <div className="mono text-xs text-slate-400 mt-0.5">
                    0x006a4d15EC51F5cb1F7721A291429181db8D3519
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {demoMode && (
                  <span className="badge-demo text-[10px] px-2 py-0.5 rounded-full">DEMO</span>
                )}
                <StatusBadge status={contractState.state} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-4 mb-4 text-sm">
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Provider</div>
                <AddressDisplay address={contractState.provider} />
              </div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Client</div>
                <AddressDisplay address={contractState.client} />
              </div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Locked Bond</div>
                <span className="mono font-bold text-slate-900 text-xs sm:text-sm">
                  {formatBond(contractState.remaining_bond)}
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Quorum</div>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {contractState.quorum_required} Sources
                </span>
              </div>
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-2.5 sm:p-3 col-span-2 sm:col-span-1">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Claims Settled</div>
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {contractState.history.length}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <Link href="/explorer" className="text-purple-600 hover:text-purple-800 text-xs font-semibold no-underline inline-flex items-center gap-1.5">
                  <ExternalLink size={12} />
                  View on Explorer
                </Link>
                <Link href="/claims/new" className="text-slate-600 hover:text-slate-900 text-xs font-semibold no-underline inline-flex items-center gap-1.5">
                  File Claim
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDepositOpen(true)}
                  className="btn-portal-secondary text-xs inline-flex items-center gap-1.5"
                  style={{ padding: "6px 12px" }}
                >
                  <Coins size={13} />
                  Deposit Bond
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={actionLoading}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowDownToLine size={13} />
                  Withdraw Bond
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Bond Modal */}
      {depositOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Deposit Collateral Bond</h3>
            <p className="text-xs text-slate-500 mb-6">
              Deposit GEN collateral to activate or replenish the reliability bond for this SLA contract.
            </p>

            <div className="mb-6">
              <label className="text-xs text-slate-600 block mb-1.5 font-semibold">
                Deposit Amount (GEN)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="input-field input-mono w-full"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                onClick={() => setDepositOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className="btn-portal-primary text-xs"
                onClick={handleDeposit}
                disabled={actionLoading || !depositAmount || parseFloat(depositAmount) <= 0}
              >
                {actionLoading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Depositing...
                  </>
                ) : (
                  <>
                    <Coins size={13} />
                    Confirm Deposit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
