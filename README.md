# NexusSLA: Autonomous SLA Dispute Court & Reliability Oracle

> **The Autonomous SLA Court for the Agentic Internet**  
> *Evidence in. Consensus out.*

NexusSLA is an Intelligent Contract protocol and decentralized court built natively on **GenLayer**. It connects real-world service uptime data with on-chain financial collateral without relying on centralized oracles.

---

## 🏛️ System Architecture

```text
       ┌────────────────────────┐
       │  REAL-WORLD EVIDENCE   │
       │ (Status APIs, Outages) │
       └───────────┬────────────┘
                   │
                   ▼  gl.nondet.web.render
       ┌────────────────────────┐
       │   MULTI-SOURCE PROOF   │
       │  (Whitelisted Domains) │
       └───────────┬────────────┘
                   │
                   ▼  prompt_comparative
       ┌────────────────────────┐
       │  AI CONSENSUS QUORUM   │
       │(LLM Validator Decision)│
       └───────────┬────────────┘
                   │
                   ▼  Deterministic Math
       ┌────────────────────────┐
       │   COURT ADJUDICATION   │
       │(Downtime & BPS Slashing)
       └───────────┬────────────┘
                   │
                   ▼  native transfer
       ┌────────────────────────┐
       │  ON-CHAIN SETTLEMENT   │
       │ (Collateral Dispatched)│
       └────────────────────────┘
```

---

## ⚡ Core Features

- **Multi-Source Web Ingestion (`gl.nondet.web.render`)**: Validators fetch public status pages and health endpoints non-deterministically directly from within the contract execution layer.
- **Semantic LLM Quorum Consensus (`prompt_comparative`)**: Evaluates outage reports semantically across heterogeneous AI models (GPT, Gemini, Sonnet, Mistral). Consensus focuses on whether an incident occurred and its severity, avoiding failures from minor JSON formatting differences.
- **Strict Domain Whitelisting**: Restricts evidence sources to pre-registered domains configured during contract deployment to prevent fabricated reports.
- **Tiered Penalty Slashing**: Deterministically deducts locked collateral (bond) based on downtime duration and pre-agreed basis point (bps) thresholds.
- **On-Chain Adjudication (No Reverts)**: Unsubstantiated claims are recorded as `DISMISSED` on-chain without reverting the transaction. This protects honest provider deposits while maintaining an immutable audit log.
- **Dispute Window & Counter-Evidence**: Allows providers to submit counter-evidence before penalties are finalized, triggering an impartial court re-evaluation.

---

## 📜 Deployed Contract (GenLayer Studio)

| Parameter | Value |
| :--- | :--- |
| **Contract Address** | `0x006a4d15EC51F5cb1F7721A291429181db8D3519` |
| **Network** | GenLayer Studio / Testnet |
| **Execution Mode** | Normal (Full Consensus) |
| **Sample Claim Tx** | `0x69da8b82fbed59b0c2623e2c619db17cde6e1eb415665c3c9564e4428f085f17` |
| **Consensus Verdict** | `MAJORITY_AGREE` |

---

## 🖥️ Phase 2: Web Dashboard

The frontend is a Web3 infrastructure dashboard built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS**.

### Available Routes

- `/` — **Protocol Dashboard**: Global statistics, active SLA agreement summary, uptime visualization, recent court decisions, and architectural overview.
- `/sla` — **SLA Agreements**: Active reliability contracts, locked collateral monitor, and interactive Deposit Bond / Withdraw actions.
- `/sla/create` — **Deploy SLA**: Interactive contract deployment form with domain whitelisting, uptime thresholds, penalty tiers, and modal review.
- `/claims` — **Claims Center**: Live monitoring of pending claims, dispute status, and complete adjudication history.
- `/claims/new` — **File Claim**: Multi-source evidence submission with real-time domain verification and an animated **AI Adjudication Experience** pipeline.
- `/claims/[incidentId]/dispute` — **Dispute Claim**: Provider counter-evidence submission console with domain whitelist checks.
- `/court` — **SLA Court**: Adjudication register with impact level, consensus breakdown, and financial consequences.
- `/court/[incidentId]` — **Court Case Detail**: In-depth dispute view with case summary, evidence panel, AI consensus node diagram, deterministic penalty engine stack, and lifecycle timeline.
- `/explorer` — **Transparency Explorer**: Direct contract state inspection, on-chain parameters, and links to GenLayer Explorer.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (tested on Node.js 22 LTS)
- npm or pnpm

### Installation & Run

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional):
   ```bash
   cp .env.example .env.local
   ```
   *By default, the dashboard runs in Demo Mode with instant previews, or can connect to a local GenLayer Studio node via `NEXT_PUBLIC_GENLAYER_RPC_URL`.*

4. Start the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. Build for production:
   ```bash
   npm run build
   ```

---

## 📄 License

MIT License. Built for the GenLayer Ecosystem.
