// Independent ground-truth check: reads get_state() and get_config() directly
// from the deployed NexusSLA contract via genlayer-js, bypassing the Next.js app.
// Usage:  node scripts/verify-contract.mjs [contractAddress]
// Compare the printed values against what the dashboard renders.

import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const address =
  process.argv[2] ||
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x96E70825E4F4b3dB44E018Dd7e99433dBF458FFb";

const client = createClient({ chain: studionet });

function toPlain(v) {
  if (typeof v === "bigint") return v.toString();
  if (v instanceof Map) return Object.fromEntries([...v].map(([k, x]) => [k, toPlain(x)]));
  if (Array.isArray(v)) return v.map(toPlain);
  return v;
}

async function read(fn) {
  try {
    const raw = await client.readContract({ address, functionName: fn, args: [] });
    return { ok: true, raw: toPlain(raw), parsed: typeof raw === "string" ? JSON.parse(raw) : toPlain(raw) };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

console.log("Contract:", address);
console.log("RPC     :", studionet.rpcUrls.default.http[0]);

const state = await read("get_state");
const config = await read("get_config");

console.log("\n--- get_state() raw ---");
console.log(state.ok ? state.raw : `ERROR: ${state.error}`);
console.log("\n--- get_config() raw ---");
console.log(config.ok ? config.raw : `ERROR: ${config.error}`);

if (state.ok) {
  const s = state.parsed;
  const history = Array.isArray(s.history) ? s.history : [];
  const dismissed = history.filter((h) => h.status === "DISMISSED").length;
  console.log("\n--- Derived (what the dashboard should show) ---");
  console.log("state             :", s.state);
  console.log("provider          :", s.provider);
  console.log("client            :", s.client);
  console.log("remaining_bond wei:", String(s.remaining_bond));
  console.log("remaining_bond GEN:", Number(s.remaining_bond) / 1e18);
  console.log("quorum_required   :", s.quorum_required);
  console.log("pending_claim keys:", Object.keys(s.pending_claim || {}).length);
  console.log("history.length    :", history.length);
  console.log("  dismissed       :", dismissed);
  console.log("  settled         :", history.length - dismissed);
}
if (config.ok) {
  const c = config.parsed;
  console.log("bond_amount GEN   :", Number(c.bond_amount) / 1e18);
  console.log("evidence_domains  :", c.evidence_domains);
  console.log("tier thresholds   :", c.tier_uptime_thresholds_bps);
  console.log("tier penalties    :", c.tier_penalty_bps);
}
