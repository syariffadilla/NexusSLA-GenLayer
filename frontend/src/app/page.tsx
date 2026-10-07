"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GenLayerLogo } from "@/components/ui/CoreComponents";
import {
  CONTRACT_ADDRESS,
  GENLAYER_EXPLORER_URL,
} from "@/lib/contract";
import {
  ArrowRight,
  Shield,
  Scale,
  Cpu,
  Globe,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Zap,
  Lock,
  Layers,
  FileCode,
  Check,
  ChevronRight,
  Server,
  AlertCircle,
  TrendingDown,
  Coins,
  Bot,
  Terminal,
  Activity,
  UserCheck,
  Radio,
  FileText,
  Clock,
  Code2,
  Copy,
  Sliders,
  Send,
  MessageSquare,
  Box,
  Database,
  ArrowUpRight,
} from "lucide-react";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"telemetry" | "consensus" | "settlement">("telemetry");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [selectedPenaltyModel, setSelectedPenaltyModel] = useState<"linear" | "tiered" | "full">("tiered");

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const copyToClipboard = (text: string, type: "contract" | "prompt") => {
    navigator.clipboard.writeText(text);
    if (type === "contract") {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    } else {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const tickerItems = [
    "DEFINITION",
    "LIVE WEB EVIDENCE",
    "VALIDATOR CONSENSUS",
    "TRANSPARENT EXPLORER",
    "WALLET-NATIVE DEPLOYMENT",
    "EQUIVALENCE PRINCIPLE",
    "DETERMINISTIC SLASHING",
    "GENLAYER STUDIONET",
  ];

  const faqs = [
    {
      q: "How does NexusSLA evaluate service outages without centralized oracles?",
      a: "NexusSLA runs directly as an Intelligent Contract on GenLayer. Through native non-deterministic web rendering (gl.nondet.web.render), decentralized validator nodes fetch raw incident logs directly from whitelisted infrastructure domains (GitHub Status, OpenAI, AWS, or custom REST APIs) without relying on any centralized oracle provider.",
    },
    {
      q: "What prevents AI validators from hallucinating verdicts?",
      a: "GenLayer enforces the Equivalence Principle consensus (gl.eq_principle.prompt_comparative). Multiple independent validator nodes run separate LLM instances. A transaction only reaches consensus and finalizes on-chain when the validators agree semantically on incident occurrence, severity impact (major/minor), and outage window.",
    },
    {
      q: "What network is NexusSLA deployed on?",
      a: "NexusSLA is deployed on GenLayer Studionet (RPC: https://studio.genlayer.com/api, Explorer: https://explorer-studio.genlayer.com). It also supports local development nodes via 'genlayer up' at http://localhost:4000/api.",
    },
    {
      q: "Can a provider dispute a false alarm or scheduled maintenance?",
      a: "Yes. When a claim is filed, the contract opens a dispute window. The bonded provider can submit counter-evidence (e.g. proof of maintenance notices or mitigation receipts) via dispute_claim(). The AI court re-evaluates both evidence feeds before any bond release can occur.",
    },
    {
      q: "Which penalty models can an SLA choose?",
      a: "Agreements configure one of three mathematical models at deployment: Linear Shortfall (penalty scales strictly proportional to downtime shortfall), Tiered Brackets (fixed percentage deductions across severity thresholds), or Full Breach Guarantee (zero-tolerance full bond forfeit).",
    },
  ];

  return (
    <div className="min-h-screen bg-[#110F24] text-slate-100 font-sans selection:bg-purple-500 selection:text-white antialiased">
      {/* 1. ULTRA-SLEEK GLASS NAVBAR (Intelligent Oracle / GenLayer Style) */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#14122C]/85 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 no-underline group">
            <GenLayerLogo size={26} fill="#C084FC" />
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-lg tracking-tight text-white group-hover:text-purple-300 transition-colors">
                NexusSLA
              </span>
              <span className="text-[11px] font-mono tracking-widest text-purple-300/70 uppercase">
                BY GENLAYER
              </span>
            </div>
          </Link>

          {/* Clean Nav Links */}
          <div className="hidden lg:flex items-center gap-8 text-[13px] font-medium text-slate-300">
            <a href="#overview" className="hover:text-white transition-colors no-underline">
              Overview
            </a>
            <a href="#resources" className="hover:text-white transition-colors no-underline">
              Builder Resources
            </a>
            <a href="#problem" className="hover:text-white transition-colors no-underline">
              The Problem
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors no-underline">
              How It Works
            </a>
            <a href="#starters" className="hover:text-white transition-colors no-underline">
              Starters
            </a>
            <Link href="/docs" className="hover:text-white transition-colors no-underline">
              Docs
            </Link>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3">
            <a
              href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono text-purple-200/80 hover:text-white border border-white/[0.12] hover:border-purple-400/40 bg-white/[0.03] transition-all no-underline"
            >
              <ExternalLink size={12} />
              <span>Studio Explorer</span>
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] no-underline"
            >
              <span>Enter Court</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION WITH PARAMETRIC SPIROGRAPH WIREFRAME (Directly Inspired by intelligentoracle.com) */}
      <section id="overview" className="relative pt-36 pb-24 md:pt-48 md:pb-32 overflow-hidden bg-gradient-to-b from-[#181538] via-[#14112E] to-[#100D24]">
        {/* Parametric SVG Spirograph Wireframe Artwork (Signature Intelligent Oracle Aesthetic) */}
        <div className="pointer-events-none absolute right-[-15%] md:right-[-5%] top-[-5%] w-[650px] sm:w-[850px] md:w-[1050px] h-[650px] sm:h-[850px] md:h-[1050px] opacity-35 select-none overflow-hidden">
          <svg viewBox="0 0 800 800" className="w-full h-full animate-[spin_160s_linear_infinite]" fill="none">
            {Array.from({ length: 48 }).map((_, i) => (
              <ellipse
                key={i}
                cx="400"
                cy="400"
                rx="340"
                ry="150"
                transform={`rotate(${i * 7.5} 400 400)`}
                stroke="url(#spiro-grad)"
                strokeWidth="0.85"
              />
            ))}
            <defs>
              <linearGradient id="spiro-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C084FC" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Ambient atmospheric glow */}
        <div className="pointer-events-none absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-purple-600/15 blur-[150px] rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-purple-200">
                Autonomous Dispute Court · Live on Studionet
              </span>
            </div>

            {/* Signature Headline */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.08]">
              The Resolution Layer <br />
              <span className="text-purple-300 font-light block mt-1">
                for Web3 &amp; Cloud SLAs
              </span>
            </h1>

            {/* Clear, Persuasive Subtitle */}
            <p className="mt-8 max-w-2xl text-base sm:text-xl text-slate-300 leading-relaxed font-light">
              Design intelligent SLAs in plain Python, lock collateral bonds, and enforce automated payouts via decentralized web evidence and LLM consensus.
            </p>

            {/* Signature Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] no-underline"
              >
                <span>Try It</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.18] transition-all no-underline"
              >
                <span>Get Started</span>
              </Link>
              <Link
                href="/explorer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-mono text-purple-200/90 hover:text-white border border-purple-500/20 hover:border-purple-400/40 bg-purple-950/30 transition-all no-underline"
              >
                <Code2 size={15} />
                <span>Explore Contracts</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE GENLAYER VIBRANT TICKER STRIP (Dual-track Continuous Infinite Marquee) */}
      <div className="py-3.5 bg-[#7C3AED] text-white overflow-hidden whitespace-nowrap shadow-lg flex select-none">
        <div className="inline-flex gap-10 animate-marquee text-xs font-mono font-bold tracking-[0.22em] uppercase shrink-0">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
              <span>{item}</span>
            </span>
          ))}
        </div>
        <div className="inline-flex gap-10 animate-marquee text-xs font-mono font-bold tracking-[0.22em] uppercase shrink-0" aria-hidden="true">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-4">
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />
              <span>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* 4. BUILDER RESOURCES & LIVE NETWORK SHOWCASE (Directly Inspired by portal.genlayer.foundation/builders/resources) */}
      <section id="resources" className="py-24 bg-gradient-to-b from-[#131128] to-[#0E0C1F] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header with Hexagon Terminal Icon & Social Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10 pb-6 border-b border-white/[0.08]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <Terminal size={20} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                  Builder Resources
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-light">
                  Primary Intelligent Contract artifacts, Studionet telemetry, and developer toolkits.
                </p>
              </div>
            </div>

            {/* Social pills (Telegram, Discord, Twitter / X, GitHub) */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <a
                href="https://t.me/genlayer"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors no-underline"
                title="Telegram"
              >
                <Send size={15} />
              </a>
              <a
                href="https://discord.gg/genlayer"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors no-underline"
                title="Discord"
              >
                <MessageSquare size={15} />
              </a>
              <a
                href="https://github.com/genlayerlabs/genlayer-project-boilerplate"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors no-underline"
                title="GitHub Repo"
              >
                <Code2 size={15} />
              </a>
            </div>
          </div>

          {/* Dual Main Cards (Image 2 Match: Left Hero Resource Card + Right Live Network Card) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
            {/* Left Big Card: Primary Builder Resource (Matrix Grid Glow) */}
            <div className="lg:col-span-7 rounded-3xl bg-[#091016] border border-emerald-500/30 p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between shadow-2xl">
              {/* Matrix wireframe background overlay */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#10B981 1px, transparent 1px), radial-gradient(#10B981 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                  backgroundPosition: "0 0, 14px 14px",
                }}
              />
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono tracking-widest uppercase text-emerald-400 mb-6">
                  PRIMARY BUILDER RESOURCE
                </div>

                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mb-3">
                  NexusSLA Intelligent Contract for GenVM
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light mb-6">
                  The primary entry point for autonomous SLA arbitration. Packages live multi-source web evidence fetching (<code className="text-emerald-300 font-mono">gl.nondet.web.render</code>), Equivalence Principle LLM comparative consensus, and deterministic bond slashing.
                </p>

                {/* Primary Buttons */}
                <div className="flex flex-wrap items-center gap-3 mb-8">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all no-underline shadow-sm"
                  >
                    <span>Open Console</span>
                    <ArrowRight size={13} />
                  </Link>

                  <button
                    onClick={() => copyToClipboard(CONTRACT_ADDRESS, "contract")}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-mono bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.15] transition-all cursor-pointer"
                  >
                    {copiedContract ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedContract ? "Copied!" : "Copy contract address"}</span>
                  </button>
                </div>
              </div>

              {/* Mini Footer Inside Card */}
              <div className="relative z-10 pt-4 border-t border-white/[0.08] grid grid-cols-2 gap-4 text-xs font-mono text-slate-400">
                <Link href="/docs" className="flex items-center justify-between text-slate-300 hover:text-white no-underline">
                  <span>Full documentation</span>
                  <ArrowUpRight size={13} className="text-slate-500" />
                </Link>
                <a
                  href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-slate-300 hover:text-white no-underline"
                >
                  <span>Contract Source (Studionet)</span>
                  <ArrowUpRight size={13} className="text-slate-500" />
                </a>
              </div>
            </div>

            {/* Right Card: Track Live Transactions & Contracts (Matching Image 2) */}
            <div className="lg:col-span-5 rounded-3xl bg-white/[0.02] border border-white/[0.08] p-6 sm:p-7 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-mono tracking-widest uppercase text-purple-400">
                    NETWORK
                  </span>
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Globe size={13} />
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-white tracking-tight mb-4">
                  Track live transactions
                </h3>

                {/* 4 Official Ecosystem Links (Styled exactly like Image 2) */}
                <div className="space-y-2.5">
                  <a
                    href="https://studio.genlayer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-amber-500/[0.06] hover:bg-amber-500/[0.12] border border-amber-500/20 flex items-center justify-between gap-3 text-left transition-all no-underline group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0">
                        <Coins size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                          Studionet Faucet
                        </div>
                        <div className="text-[11px] text-slate-400 font-light">
                          Claim Studionet GEN to start building &amp; staking.
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>

                  <a
                    href={`${GENLAYER_EXPLORER_URL}/contracts/${CONTRACT_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between gap-3 text-left transition-all no-underline group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center flex-shrink-0">
                        <Scale size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                          NexusSLA Court
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-6)}
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>

                  <a
                    href="https://docs.genlayer.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between gap-3 text-left transition-all no-underline group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center flex-shrink-0">
                        <Shield size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-blue-300 transition-colors">
                          GenLayer Docs &amp; SDK
                        </div>
                        <div className="text-[11px] text-slate-400 font-light">
                          Intelligent contracts &amp; AI equivalence principles.
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>

                  <a
                    href={GENLAYER_EXPLORER_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] flex items-center justify-between gap-3 text-left transition-all no-underline group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <Globe size={14} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                          Studio Explorer
                        </div>
                        <div className="text-[11px] text-slate-400 font-light">
                          Inspect Studio network activity &amp; blocks.
                        </div>
                      </div>
                    </div>
                    <ArrowUpRight size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* NexusSLA Protocol Modules & Architecture */}
          <div id="starters" className="pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                  NexusSLA Protocol Modules
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 font-light mt-0.5">
                  Decentralized on-chain components built specifically for autonomous SLA enforcement on GenVM.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/docs"
                  className="text-xs font-mono text-purple-300 hover:text-white no-underline flex items-center gap-1"
                >
                  <span>Protocol Docs</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* 4 NexusSLA Native Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Module 1: Core Court Engine */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-400/40 flex flex-col justify-between transition-all group">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-500/20">
                    GENVM CONTRACT
                  </span>
                  <h4 className="text-base font-semibold text-white mt-3 mb-1.5 group-hover:text-purple-300 transition-colors">
                    Core Court Engine
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    Intelligent contract written in Python (<code className="text-purple-300">nexus_sla.py</code>) managing escrow lockup, dispute windows, and deterministic slashing.
                  </p>
                </div>
                <Link
                  href="/explorer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-all no-underline"
                >
                  <Code2 size={13} />
                  <span>Inspect Bytecode</span>
                </Link>
              </div>

              {/* Module 2: Web Evidence Collector */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-400/40 flex flex-col justify-between transition-all group">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ORACLE-FREE WEB
                  </span>
                  <h4 className="text-base font-semibold text-white mt-3 mb-1.5 group-hover:text-emerald-300 transition-colors">
                    Multi-Domain Scraper
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    Fetches raw incident telemetry from whitelisted infrastructure endpoints (<code className="text-emerald-300">gl.nondet.web.render</code>) to eliminate single-point failures.
                  </p>
                </div>
                <Link
                  href="/docs#evidence"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.15] transition-all no-underline"
                >
                  <span>Quorum Specs</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Module 3: Adjudication Trial System */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-400/40 flex flex-col justify-between transition-all group">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                    AI JURY CONSENSUS
                  </span>
                  <h4 className="text-base font-semibold text-white mt-3 mb-1.5 group-hover:text-amber-300 transition-colors">
                    Equivalence Tribunal
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    Multi-validator LLM consensus engine evaluating outage window, severity impact (major/minor), and counter-disputes.
                  </p>
                </div>
                <Link
                  href="/court"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.15] transition-all no-underline"
                >
                  <span>Open Court</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Module 4: Client Integration SDK */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-400/40 flex flex-col justify-between transition-all group">
                <div>
                  <span className="text-[10px] font-mono tracking-wider uppercase text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-500/20">
                    DEVELOPER TOOLKIT
                  </span>
                  <h4 className="text-base font-semibold text-white mt-3 mb-1.5 group-hover:text-blue-300 transition-colors">
                    TypeScript &amp; Python SDK
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-light mb-6">
                    Lightweight client library to programmatically stake collateral, file downtime breaches, and query court history.
                  </p>
                </div>
                <Link
                  href="/docs#sdk"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all no-underline shadow-md shadow-purple-600/30"
                >
                  <span>SDK Quickstart</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE LIVE TELEMETRY CONSOLE CARD */}
      <section className="py-20 bg-[#0C0A1C] border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase">
              LIVE ENGINE TELEMETRY
            </span>
            <h3 className="text-2xl sm:text-4xl font-semibold text-white mt-2">
              See the Court in Action
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 font-light">
              Explore how real HTTP status feeds are evaluated across multiple LLM validator nodes to reach consensus.
            </p>
          </div>

          <div className="rounded-2xl bg-[#090717] border border-white/[0.1] shadow-2xl overflow-hidden text-left">
            {/* Header Toolbar */}
            <div className="px-5 py-3.5 border-b border-white/[0.08] bg-white/[0.02] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400 pl-2">
                  <Terminal size={13} className="text-purple-400" />
                  <span>nexus_sla_court::studionet_telemetry</span>
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-lg border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab("telemetry")}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all border-none cursor-pointer ${
                    activeTab === "telemetry"
                      ? "bg-purple-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 bg-transparent"
                  }`}
                >
                  Live Evidence
                </button>
                <button
                  onClick={() => setActiveTab("consensus")}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all border-none cursor-pointer ${
                    activeTab === "consensus"
                      ? "bg-purple-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 bg-transparent"
                  }`}
                >
                  Validator Voting
                </button>
                <button
                  onClick={() => setActiveTab("settlement")}
                  className={`px-3 py-1 rounded-md text-[11px] font-mono transition-all border-none cursor-pointer ${
                    activeTab === "settlement"
                      ? "bg-purple-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 bg-transparent"
                  }`}
                >
                  Slashing
                </button>
              </div>
            </div>

            {/* Tab 1: Live Evidence Telemetry */}
            {activeTab === "telemetry" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Service Target</div>
                    <div className="text-sm font-medium text-slate-200 mt-1 flex items-center gap-1.5">
                      <Server size={14} className="text-purple-400" />
                      <span>Asimov RPC Endpoint</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">Target: 99.90% Uptime</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Live Measured</div>
                    <div className="text-sm font-mono font-semibold text-rose-400 mt-1 flex items-center gap-1.5">
                      <TrendingDown size={14} />
                      <span>98.75% Uptime</span>
                    </div>
                    <span className="text-[11px] font-mono text-rose-400/80 mt-0.5 block">Shortfall: -1.15%</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Quorum Proofs</div>
                    <div className="text-sm font-medium text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>2 Independent Feeds</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">githubstatus + openai</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-[11px] font-mono text-slate-400 space-y-1.5">
                  <div className="text-purple-300">// gl.nondet.web.render telemetry execution:</div>
                  <div className="text-slate-300">
                    GET https://www.githubstatus.com/api/v2/incidents.json <span className="text-emerald-400">[200 OK - 42ms]</span>
                  </div>
                  <div className="text-slate-300">
                    GET https://status.openai.com/api/v2/incidents.json <span className="text-emerald-400">[200 OK - 38ms]</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Validator Consensus */}
            {activeTab === "consensus" && (
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-white/[0.06]">
                  <span>GenLayer Validator Node</span>
                  <span>Equivalence Output</span>
                  <span>Impact Verdict</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  {[
                    { node: "Validator #1 (v-studionet-01)", agreement: "99.8%", impact: "MAJOR BREACH", pass: true },
                    { node: "Validator #2 (v-studionet-02)", agreement: "99.9%", impact: "MAJOR BREACH", pass: true },
                    { node: "Validator #3 (v-studionet-03)", agreement: "99.7%", impact: "MAJOR BREACH", pass: true },
                    { node: "Validator #4 (v-studionet-04)", agreement: "99.8%", impact: "MAJOR BREACH", pass: true },
                    { node: "Validator #5 (v-studionet-05)", agreement: "99.9%", impact: "MAJOR BREACH", pass: true },
                  ].map((val, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                      <span className="text-slate-200">{val.node}</span>
                      <span className="text-purple-300">{val.agreement} semantic alignment</span>
                      <span className="text-rose-400 font-semibold">{val.impact}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center justify-between">
                  <span>Equivalence Consensus Locked</span>
                  <span className="font-bold">5 / 5 Unanimous Agreement</span>
                </div>
              </div>
            )}

            {/* Tab 3: Slashing & Settlement */}
            {activeTab === "settlement" && (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Collateral Bond Escrow</div>
                    <div className="text-2xl font-mono font-semibold text-white mt-1">1.00 GEN</div>
                    <div className="text-xs text-slate-400 mt-1 font-mono truncate">
                      Locked in {CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-6)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Penalty Slashed &amp; Payout</div>
                    <div className="text-2xl font-mono font-semibold text-purple-300 mt-1">0.05 - 0.40 GEN</div>
                    <div className="text-xs text-emerald-400 mt-1">Dynamic on-chain transfer to Client wallet</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>Smart Contract Method:</span>
                  <code className="text-purple-300">nexus_sla.finalize_claim()</code>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. THE PROBLEM (Editorial Split Layout) */}
      <section id="problem" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="text-[11px] font-mono text-purple-400 tracking-[0.25em] uppercase mb-4">
            The Industry Problem
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
            SLA enforcement is broken in every infrastructure deal.
          </h2>
        </div>

        <div className="mt-14 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
            <span className="md:col-span-3 text-xs font-mono text-purple-300 uppercase tracking-widest">
              01 · Endless Disputes
            </span>
            <p className="md:col-span-9 text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              Reviews take <span className="text-white font-medium">weeks of back-and-forth email arguments</span> because every party reads isolated logs and timezones from scratch.
            </p>
          </div>

          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
            <span className="md:col-span-3 text-xs font-mono text-purple-300 uppercase tracking-widest">
              02 · Asymmetric Evidence
            </span>
            <p className="md:col-span-9 text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              Decisions are <span className="text-white font-medium">inconsistent</span> because providers obscure degraded states while clients cherry-pick isolated error spikes.
            </p>
          </div>

          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
            <span className="md:col-span-3 text-xs font-mono text-purple-300 uppercase tracking-widest">
              03 · Centralized Escrow
            </span>
            <p className="md:col-span-9 text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              Traditional custodians <span className="text-white font-medium">arbitrarily freeze or withhold payouts</span>, adding counterparty friction and legal overhead.
            </p>
          </div>

          <div className="py-7 sm:py-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
            <span className="md:col-span-3 text-xs font-mono text-purple-300 uppercase tracking-widest">
              04 · No Immutable Memory
            </span>
            <p className="md:col-span-9 text-lg sm:text-xl text-slate-300 font-light leading-relaxed">
              There is <span className="text-white font-medium">no immutable on-chain record</span> between incidents. Every dispute starts blank with zero accountability.
            </p>
          </div>
        </div>

        <p className="mt-12 text-2xl sm:text-3xl text-purple-300 font-normal tracking-tight">
          NexusSLA fixes all four on GenLayer Studionet.
        </p>
      </section>

      {/* 7. HOW IT WORKS - 4 ARCHITECTURAL PHASES */}
      <section id="how-it-works" className="py-24 bg-[#0F0D21] border-t border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <div className="text-[11px] font-mono text-purple-400 tracking-[0.25em] uppercase mb-4">
              Step-by-step Protocol
            </div>
            <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
              Four steps. Public reasoning at every step.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between group hover:border-purple-400/40 transition-all">
              <div>
                <div className="font-mono text-5xl font-light text-slate-600 group-hover:text-purple-400 transition-colors mb-6 tracking-tight">
                  01
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Stake Collateral Bond</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Provider locks collateral bond in the smart contract, binding registered status domains and penalty thresholds.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] text-purple-300/80">
                deposit_bond()
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between group hover:border-purple-400/40 transition-all">
              <div>
                <div className="font-mono text-5xl font-light text-slate-600 group-hover:text-purple-400 transition-colors mb-6 tracking-tight">
                  02
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Multi-Domain Claim</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Client submits incident evidence pointing to independent registered status URLs that satisfy the quorum rule.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] text-purple-300/80">
                file_claim(urls)
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between group hover:border-purple-400/40 transition-all">
              <div>
                <div className="font-mono text-5xl font-light text-slate-600 group-hover:text-purple-400 transition-colors mb-6 tracking-tight">
                  03
                </div>
                <h3 className="text-lg font-medium text-white mb-2">AI Jury Consensus</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  Decentralized validator nodes scrape web pages and evaluate downtime under GenLayer&apos;s Equivalence Principle.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] text-purple-300/80">
                eq_principle.prompt()
              </div>
            </div>

            {/* Step 4 */}
            <div className="p-7 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col justify-between group hover:border-purple-400/40 transition-all">
              <div>
                <div className="font-mono text-5xl font-light text-slate-600 group-hover:text-purple-400 transition-colors mb-6 tracking-tight">
                  04
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Deterministic Payout</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                  The smart contract deterministically slashes the penalty amount and routes native GEN compensation to the Client.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-white/[0.06] font-mono text-[11px] text-purple-300/80">
                finalize_claim()
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CONFIGURABLE PENALTY MODELS */}
      <section id="models" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="text-[11px] font-mono text-purple-400 tracking-[0.25em] uppercase mb-4">
            Deterministic Math
          </div>
          <h2 className="text-3xl sm:text-5xl font-medium text-white tracking-tight leading-tight">
            Configurable Penalty Models
          </h2>
          <p className="mt-4 text-base text-slate-300 font-light">
            Every SLA agreement locks a transparent, deterministic mathematical slashing model into bytecode.
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] max-w-md mb-8">
          {(["tiered", "linear", "full"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setSelectedPenaltyModel(m)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono capitalize transition-all border-none cursor-pointer ${
                selectedPenaltyModel === m
                  ? "bg-purple-600 text-white font-semibold shadow-md"
                  : "bg-transparent text-slate-400 hover:text-white"
              }`}
            >
              {m} Model
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedPenaltyModel === "tiered" && (
            <>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                <div className="text-xs font-mono text-purple-300 uppercase mb-2">Bracket 1</div>
                <div className="text-2xl font-semibold text-white mb-1">99.0% - 99.8%</div>
                <div className="text-sm text-slate-400 mb-4">Minor Degradation</div>
                <div className="text-xl font-mono text-purple-400 font-bold">10% Bond Slashed</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-purple-500/30 shadow-lg">
                <div className="text-xs font-mono text-amber-400 uppercase mb-2">Bracket 2</div>
                <div className="text-2xl font-semibold text-white mb-1">95.0% - 98.9%</div>
                <div className="text-sm text-slate-400 mb-4">Major Outage Window</div>
                <div className="text-xl font-mono text-amber-400 font-bold">25% Bond Slashed</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08]">
                <div className="text-xs font-mono text-rose-400 uppercase mb-2">Bracket 3</div>
                <div className="text-2xl font-semibold text-white mb-1">&lt; 95.0% Uptime</div>
                <div className="text-sm text-slate-400 mb-4">Catastrophic Failure</div>
                <div className="text-xl font-mono text-rose-400 font-bold">50% Bond Slashed</div>
              </div>
            </>
          )}

          {selectedPenaltyModel === "linear" && (
            <div className="col-span-3 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs font-mono text-purple-400 uppercase mb-2">Continuous Math</div>
                <h3 className="text-xl font-semibold text-white mb-2">Linear Shortfall Scaling</h3>
                <p className="text-sm text-slate-300 max-w-xl font-light">
                  Penalty percentage directly tracks downtime: <code className="text-purple-300 font-mono">penalty_bps = (target_bps - actual_bps) × multiplier</code>. Ideal for financial APIs with per-second latency guarantees.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] font-mono text-xs text-purple-300">
                penalty = shortfall_pct × 5.0
              </div>
            </div>
          )}

          {selectedPenaltyModel === "full" && (
            <div className="col-span-3 p-8 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs font-mono text-rose-400 uppercase mb-2">Binary Guarantee</div>
                <h3 className="text-xl font-semibold text-white mb-2">Full Breach Forfeiture</h3>
                <p className="text-sm text-slate-300 max-w-xl font-light">
                  Zero tolerance. If downtime breaches SLA target for more than 15 consecutive minutes, 100% of the provider&apos;s bonded collateral is immediately awarded to the client.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 font-mono text-xs text-rose-300">
                penalty = 100% of remaining bond
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. FAQ ACCORDION */}
      <section className="py-24 bg-[#0E0C20] border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="text-[11px] font-mono text-purple-400 tracking-[0.25em] uppercase mb-2">
              Questions &amp; Answers
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left border-none bg-transparent cursor-pointer"
                  >
                    <span className="text-base font-medium text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-purple-400" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed font-light border-t border-white/[0.04] pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. REFINED MINIMALIST FOOTER */}
      <footer className="py-12 bg-[#090814] border-t border-white/[0.06] text-slate-400 text-xs font-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GenLayerLogo size={20} fill="#A855F7" />
            <span className="font-semibold text-white text-sm">NexusSLA</span>
            <span className="text-slate-600">|</span>
            <span>GenLayer Studionet (Chain 42)</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/genlayerlabs/genlayer-project-boilerplate"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors no-underline"
            >
              GitHub Boilerplate
            </a>
            <a
              href={GENLAYER_EXPLORER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors no-underline"
            >
              Studionet Explorer
            </a>
            <Link href="/docs" className="hover:text-white transition-colors no-underline">
              Docs
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors no-underline">
              Court Portal
            </Link>
          </div>

          <div>
            <span>© 2026 NexusSLA · Open Source MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
