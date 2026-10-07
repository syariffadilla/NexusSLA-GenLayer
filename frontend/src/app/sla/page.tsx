"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useNexus } from "@/context/NexusContext";
import { StatusBadge, AddressDisplay, EmptyState } from "@/components/ui/CoreComponents";
import { formatBond } from "@/lib/formatters";
import { CONTRACT_ADDRESS, depositBond, withdrawRemainingBond } from "@/lib/contract";
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
  const {
    contractState,
    contractConfig,
    loading,
    wallet,
    refreshState,
    activeContractAddress,
    knownContracts,
    setActiveContractAddress,
  } = useNexus();

  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1.00");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (contractConfig?.bond_amount) {
      try {
        const bondWei = BigInt(contractConfig.bond_amount);
        const gen = Number(bondWei / BigInt(1e14)) / 10000;
        setDepositAmount(gen.toFixed(2));
      } catch {
        // keep fallback
      }
    }
  }, [contractConfig?.bond_amount]);

  const handleDeposit = async () => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected. Connect provider wallet first.");
      }
      if (contractState?.provider && wallet.address.toLowerCase() !== contractState.provider.toLowerCase()) {
        throw new Error(
          `Wallet role mismatch: Only the designated Provider (${contractState.provider.slice(0, 6)}...${contractState.provider.slice(-4)}) can deposit collateral. Your active wallet is ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}.`,
        );
      }
      const num = parseFloat(depositAmount);
      if (isNaN(num) || num <= 0) throw new Error("Please enter a valid deposit amount");
      const bondWei = contractConfig?.bond_amount
        ? String(contractConfig.bond_amount)
        : (BigInt(Math.round(num * 1e9)) * BigInt(1e9)).toString();

      await depositBond(wallet.address, bondWei, activeContractAddress);
      await refreshState(activeContractAddress);
      setActionSuccess(`Successfully deposited ${depositAmount} GEN bond. Contract is now ACTIVE!`);
      setDepositOpen(false);
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
      if (!wallet.connected || !wallet.address) {
        throw new Error("Wallet not connected. Connect provider wallet first.");
      }
      await withdrawRemainingBond(wallet.address, activeContractAddress);
      await refreshState(activeContractAddress);
      setActionSuccess("Remaining bond withdrawn to provider wallet.");
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
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link href="/sla/deposit" className="btn-portal-secondary no-underline inline-flex items-center gap-1.5">
            <Coins size={13} className="text-purple-600" />
            <span>Deposit Collateral</span>
          </Link>
          <Link href="/sla/create" className="btn-portal-primary no-underline inline-flex items-center gap-1.5">
            <Plus size={13} />
            <span>Create SLA Agreement</span>
          </Link>
        </div>
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
      ) : !contractState || (!contractState.provider || contractState.provider === "0x0000000000000000000000000000000000000000") ? (
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
                    {knownContracts.find((c) => c.address.toLowerCase() === activeContractAddress.toLowerCase())?.title || "API Reliability Agreement"}
                  </h3>
                  <div className="mono text-xs text-slate-400 mt-0.5 break-all">
                    {activeContractAddress}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <StatusBadge status={contractState.state} />
              </div>
            </div>

            {contractState.state === "UNINITIALIZED" && (
              <div className="mb-4 p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Coins size={18} className="text-purple-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Provider Collateral Deposit Required:</span> Agreement is currently in <span className="font-mono font-semibold">UNINITIALIZED</span> state. Provider must deposit {contractConfig?.bond_amount ? formatBond(contractConfig.bond_amount) : "1.00 GEN"} to activate the contract.
                  </div>
                </div>
                <Link
                  href="/sla/deposit"
                  className="btn-portal-primary text-xs py-1.5 px-3 whitespace-nowrap self-start sm:self-auto no-underline flex items-center gap-1"
                >
                  <Coins size={12} />
                  <span>Deposit Bond Now</span>
                </Link>
              </div>
            )}

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
                <a
                  href={`https://explorer-studio.genlayer.com/contracts/${activeContractAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-xs font-semibold no-underline inline-flex items-center gap-1.5"
                >
                  <ExternalLink size={12} />
                  View on Explorer
                </a>
                <Link href="/claims/new" className="text-slate-600 hover:text-slate-900 text-xs font-semibold no-underline inline-flex items-center gap-1.5">
                  File Claim
                </Link>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sla/deposit"
                  className="btn-portal-secondary text-xs inline-flex items-center gap-1.5 no-underline"
                  style={{ padding: "6px 12px" }}
                >
                  <Coins size={13} className="text-purple-600" />
                  Deposit Bond
                </Link>
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

          {/* All Available Agreements Grid */}
          {knownContracts.length > 1 && (
            <div className="pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-800 mb-3">
                All Available Agreements ({knownContracts.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {knownContracts.map((c) => {
                  const isCurrent = c.address.toLowerCase() === activeContractAddress.toLowerCase();
                  return (
                    <div
                      key={c.address}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? "bg-purple-50/60 border-purple-300 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {c.title}
                        </span>
                        {isCurrent ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => setActiveContractAddress(c.address)}
                            className="text-[11px] text-purple-600 hover:text-purple-700 font-semibold border-none bg-transparent cursor-pointer"
                          >
                            Switch to this →
                          </button>
                        )}
                      </div>
                      <div className="mono text-[11px] text-slate-500 truncate">
                        {c.address}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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
