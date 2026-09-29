cat << 'EOF' > README.md
# NexusSLA: Multi-Source Truth Oracle & SLA Dispute Court

NexusSLA is an Intelligent Contract on GenLayer that serves as an autonomous SLA arbiter and reliability oracle for APIs, decentralized infrastructure, and AI agents. It connects real-world service uptime data with on-chain financial collateral without relying on centralized oracles.

---

## Key Features

- **Multi-Source Web Ingestion (`gl.nondet.web.render`)**: Validators fetch status pages and public API endpoints non-deterministically directly from within the contract execution layer.
- **Semantic LLM Quorum Consensus (`prompt_comparative`)**: Evaluates outage reports semantically across heterogeneous AI models (GPT, Gemini, Sonnet, Mistral). Consensus focuses on whether an incident occurred and its severity, avoiding failures from minor JSON formatting or whitespace differences.
- **Domain Whitelisting**: Restricts evidence sources to pre-registered domains set during contract deployment to prevent fabricated reports.
- **Tiered Penalty Slashing**: Automatically deducts collateral (bond) based on downtime duration and pre-agreed basis point thresholds.
- **On-Chain Adjudication (No Reverts)**: Unsubstantiated claims are recorded as `DISMISSED` on-chain without reverting the transaction. This protects honest provider deposits while maintaining an immutable audit log.
- **Dispute Window**: Allows the provider to submit counter-evidence before penalties are finalized.

---

## Contract State Flow

               [ UNINITIALIZED ]
                       │
                       ▼  deposit_bond() (Provider deposits GEN)
                  [ ACTIVE ] ◄─────────────────────────────────┐
                       │                                       │
                       ▼  file_claim() (Client submits URLs)   │
               [ CLAIM_PENDING ] ──────────────────────────────┤
                       │                                       │ (Claim Dismissed)
            ┌──────────┴──────────┐                            │
            ▼ dispute_claim()     ▼ finalize_claim()           │
    [ DISPUTE_WINDOW ]      [ ACTIVE (Bond Deducted) ] ────────┘
            │
            ▼ finalize_claim()
   [ ACTIVE / SETTLED ]

---

## Constructor Parameters

| Parameter | Type | Description | Testnet Example |
| :--- | :--- | :--- | :--- |
| `provider` | `str` | Provider wallet address | `0x34242f09a2646eF4383C672b8a6BFDC9634cB232` |
| `client` | `str` | Client wallet address | `0x90e1644d995B2488d4a2Bf24b88D67e04A3F9D5d` |
| `evidence_domains_json`| `str` | JSON array of whitelisted domains | `["githubstatus.com","status.cloud.google.com"]` |
| `quorum_required` | `int` | Minimum independent sources required | `1` |
| `start` | `int` | Start timestamp (Unix epoch) | `1700000000` |
| `end` | `int` | End timestamp (Unix epoch) | `1900000000` |
| `bond_amount` | `int` | Collateral amount in wei (1 GEN) | `1000000000000000000` |
| `tier_uptime_thresholds_json` | `str` | Uptime percentage thresholds (bps) | `[9990, 9900, 9500]` |
| `tier_penalty_json` | `str` | Slashing rate per tier (bps) | `[500, 1500, 4000]` |

---

## Testnet Details (GenLayer Studio)

- **Contract Address:** `0x006a4d15EC51F5cb1F7721A291429181db8D3519`
- **Execution Mode:** `Normal (Full Consensus)`
- **Sample Claim Execution Tx:** `0x69da8b82fbed59b0c2623e2c619db17cde6e1eb415665c3c9564e4428f085f17`
- **Consensus Verdict:** `MAJORITY_AGREE` (Accepted in a single round across multi-model validator set).

---

## Roadmap

### Phase 1: Core Intelligent Contract (Completed)
- Standalone contract logic in `nexus_sla.py` with non-deterministic web rendering.
- Semantic consensus using `prompt_comparative`.
- Bond deposits, multi-source quorums, tiered penalties, and no-revert claim handling.

### Phase 2: Web Dashboard (Projects Category)
Interactive web interface (Next.js + Tailwind CSS) communicating directly with GenLayer:
- **Provider View**: Deposit portal, live bond balance monitor, and dispute submission console.
- **Client View**: Incident claim interface with client-side domain validation and real-time AI adjudication status.
- **Court Explorer**: Visualizer for evidence text, consensus breakdown, and provider reliability metrics.

### Phase 3: Automated Oracle Watchdogs (Milestones Category)
- **Monitoring Agents**: Autonomous background workers pinging service endpoints and initiating claims automatically upon downtime.
- **Multi-Asset Support**: Collateral handling via ERC-20 and stablecoin assets.
- **Dynamic Penalty Curves**: Configurable non-linear penalty curves for enterprise-grade SLAs.

---

## Running in GenLayer Studio

1. Open [GenLayer Studio](https://studio.genlayer.com).
2. Create `nexus_sla.py` and paste the contract code.
3. Deploy an instance using the constructor parameters listed above.
4. Call `deposit_bond` using the provider wallet with `Value (GEN) = 1`.
5. Switch to the client wallet and call `file_claim` with the evidence URL:
   `["https://www.githubstatus.com/api/v2/incidents.json"]`
6. Open **Read Methods** and call `get_state()` to verify the contract state and recorded history.

---

## License
MIT License
EOF
