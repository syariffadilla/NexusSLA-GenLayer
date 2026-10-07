"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNexus } from "@/context/NexusContext";
import { StatusBadge, AddressDisplay } from "@/components/ui/CoreComponents";
import { formatBond, truncateAddress } from "@/lib/formatters";
import { depositBond } from "@/lib/contract";
import {
  Coins,
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Lock,
  Wallet,
  ArrowRight,
} from "lucide-react";

export default function DepositBondPage() {
  const router = useRouter();
  const {
    contractState,
    contractConfig,
    loading,
    wallet,
    refreshState,
    activeContractAddress,
    knownContracts,
  } = useNexus();

  const [depositAmount, setDepositAmount] = useState("1.00");
  const [submitting, setSubmitting] = useState(false);
  const [stepText, setStepText] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);

  // Sync deposit amount with contract config
  useEffect(() => {
    if (contractConfig?.bond_amount) {
      try {
        const bondWei = BigInt(contractConfig.bond_amount);
        const gen = Number(bondWei / BigInt(1e14)) / 10000;
        setDepositAmount(gen.toFixed(2));
      } catch {
        // fallback
      }
    }
  }, [contractConfig?.bond_amount]);

  const activeContractInfo = knownContracts.find(
    (c) => c.address.toLowerCase() === activeContractAddress.toLowerCase()
  );

  const isProvider =
    wallet.connected &&
    wallet.address &&
    contractState?.provider &&
    wallet.address.toLowerCase() === contractState.provider.toLowerCase();

  const isAlreadyActive =
    contractState?.state === "ACTIVE" &&
    contractState?.remaining_bond &&
    BigInt(contractState.remaining_bond) > 0n;

  const handleDeposit = async () => {
    setErrorMsg(null);
    setSuccessTxHash(null);

    if (!wallet.connected || !wallet.address) {
      setErrorMsg("Please connect your Web3 wallet first.");
      return;
    }

    if (contractState?.provider && wallet.address.toLowerCase() !== contractState.provider.toLowerCase()) {
      setErrorMsg(
        `Wallet role mismatch: Only the contract Provider (${truncateAddress(contractState.provider)}) can deposit the collateral bond. Your connected wallet is ${truncateAddress(wallet.address)}. Please switch accounts in Rabby / MetaMask.`
      );
      return;
    }

    setSubmitting(true);
    setStepText("1/3: Confirming GenLayer Studionet (Chain 61999) & awaiting signature in wallet...");

    try {
      const num = parseFloat(depositAmount);
      if (isNaN(num) || num <= 0) throw new Error("Invalid deposit amount.");

      const bondWei = contractConfig?.bond_amount
        ? String(contractConfig.bond_amount)
        : (BigInt(Math.round(num * 1e9)) * BigInt(1e9)).toString();

      setStepText("2/3: Broadcasting deposit transaction to GenLayer validators...");
      const result = await depositBond(wallet.address, bondWei, activeContractAddress);

      setStepText("3/3: Finalizing deposit and refreshing state...");
      await refreshState(activeContractAddress);

      setSuccessTxHash(result.hash);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deposit transaction failed.";
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
      setStepText(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back button */}
      <Link
        href="/sla"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors no-underline"
      >
        <ArrowLeft size={14} />
        <span>Back to SLA Contracts</span>
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200/60">
            <Coins size={12} className="text-purple-600" />
            Collateral Management
          </span>
          <span className="text-xs text-slate-400 font-mono">deposit_bond</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Deposit Collateral Bond
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Lock provider GEN collateral into the GenLayer Intelligent Contract. Once deposited,
          the agreement transitions from <span className="font-semibold text-slate-700">UNINITIALIZED</span> to{" "}
          <span className="font-semibold text-emerald-700">ACTIVE</span>, activating autonomous AI court protection.
        </p>
      </div>

      {/* Success Notification */}
      {successTxHash && (
        <div className="mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm animate-fade-in-up">
          <div className="flex items-start gap-3.5">
            <CheckCircle size={22} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-base text-emerald-950">
                Collateral Bond Deposited Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-800 mt-1">
                Your collateral of {depositAmount} GEN has been accepted by GenLayer Studionet validators.
                The agreement status is now <span className="font-bold">ACTIVE</span>.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  href={`https://explorer-studio.genlayer.com/transactions/${successTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors no-underline"
                >
                  <ExternalLink size={12} />
                  <span>View Transaction on Explorer</span>
                </a>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-colors no-underline"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold block mb-0.5">Deposit Error</span>
            <span>{errorMsg}</span>
          </div>
        </div>
      )}

      {/* Already Active Warning */}
      {isAlreadyActive && !successTxHash && (
        <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3">
          <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold block mb-0.5">Agreement Already Active</span>
            <span>
              This agreement already has {formatBond(contractState?.remaining_bond || "0")} locked collateral.
              Additional deposits are only required if collateral is depleted by resolved claims.
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Contract Target & Role Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                >
                  <Shield size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeContractInfo?.title || "Bilateral SLA Agreement"}
                  </h2>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {activeContractAddress}
                  </div>
                </div>
              </div>
              <StatusBadge status={contractState?.state || "LOADING"} />
            </div>

            {/* Contract Parameter Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Designated Provider (Must Deposit)
                </div>
                {contractState?.provider ? (
                  <AddressDisplay address={contractState.provider} />
                ) : (
                  <span className="text-slate-400">Loading...</span>
                )}
                {isProvider ? (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                    <CheckCircle size={10} />
                    <span>Your active wallet matches Provider</span>
                  </div>
                ) : wallet.connected ? (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-semibold">
                    <AlertCircle size={10} />
                    <span>Active wallet is not Provider</span>
                  </div>
                ) : null}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Designated Client
                </div>
                {contractState?.client ? (
                  <AddressDisplay address={contractState.client} />
                ) : (
                  <span className="text-slate-400">Loading...</span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Required Bond Amount
                </div>
                <div className="text-sm font-bold text-purple-700 font-mono">
                  {contractConfig?.bond_amount
                    ? formatBond(contractConfig.bond_amount)
                    : `${depositAmount} GEN`}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Currently Locked Collateral
                </div>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {contractState?.remaining_bond
                    ? formatBond(contractState.remaining_bond)
                    : "0.00 GEN"}
                </div>
              </div>
            </div>

            {/* Contract Rules Note */}
            <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-[11px] text-purple-900 leading-relaxed">
              <span className="font-semibold block mb-0.5">GenLayer Intelligent Contract Enforcement:</span>
              The Python contract verifies: (1) Caller must be exactly <code className="text-purple-800 font-mono">self.provider</code>,
              and (2) Transaction value must strictly match <code className="text-purple-800 font-mono">self.bond_amount</code>.
              Funds are held on-chain by the contract and cannot be withdrawn until SLA expiry.
            </div>
          </div>
        </div>

        {/* Right Col: Deposit Submission Form (1 col) */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs sticky top-20">
            <h3 className="text-base font-bold text-slate-900 mb-1.5 flex items-center gap-2">
              <Coins size={16} className="text-purple-600" />
              <span>Deposit Action</span>
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-normal">
              Execute on-chain <code className="text-slate-700 font-mono">deposit_bond()</code> payable call.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Deposit Amount (GEN)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono font-bold text-sm cursor-not-allowed"
                    value={`${depositAmount} GEN`}
                  />
                  <Lock size={14} className="absolute right-3.5 top-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Exact bond required by contract specification.
                </p>
              </div>

              {/* Connected Wallet Status */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Sending From
                </div>
                {wallet.connected && wallet.address ? (
                  <div className="font-mono text-slate-800 font-semibold truncate">
                    {wallet.address}
                  </div>
                ) : (
                  <div className="text-amber-600 font-medium">
                    Wallet disconnected
                  </div>
                )}
              </div>
            </div>

            {/* Live Step Tracker */}
            {stepText && (
              <div className="mb-4 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-purple-600 flex-shrink-0" />
                <span>{stepText}</span>
              </div>
            )}

            {/* Action Button */}
            {!wallet.connected ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <Wallet size={14} />
                <span>Connect Wallet in Header</span>
              </button>
            ) : !isProvider ? (
              <button
                type="button"
                disabled
                className="w-full py-3 rounded-xl bg-amber-100 text-amber-800 text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                <AlertCircle size={14} />
                <span>Switch to Provider Wallet</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeposit}
                disabled={submitting}
                className="btn-portal-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Processing Deposit...</span>
                  </>
                ) : (
                  <>
                    <Coins size={14} />
                    <span>Confirm &amp; Deposit {depositAmount} GEN</span>
                  </>
                )}
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
              Network: GenLayer Studionet (Chain 61999)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
