// --- Formatting Utilities for NexusSLA ---------------------------------------

/**
 * Truncate wallet/contract address for display.
 * e.g. 0xABCDEF0123456789ABCDEF0123456789ABCDEF01 → 0xABCD...EF01
 */
export function truncateAddress(address: string, start = 6, end = 4): string {
  if (!address || address.length < start + end + 3) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export const NOT_AVAILABLE = "Not available";

/**
 * Format a wei amount (exact decimal string / bigint) as GEN.
 * Divides by 10^18 using BigInt so no precision is lost. Shows at least
 * `minDecimals` and at most `maxDecimals` fractional digits (truncated, never
 * rounded up). Returns "Not available" for missing/invalid input — never a guess.
 */
export function formatBond(
  wei: string | bigint | number | null | undefined,
  minDecimals = 2,
  maxDecimals = 6,
): string {
  if (wei === null || wei === undefined || wei === "") return NOT_AVAILABLE;
  let w: bigint;
  try {
    w = typeof wei === "bigint" ? wei : BigInt(typeof wei === "number" ? Math.trunc(wei) : wei);
  } catch {
    return NOT_AVAILABLE;
  }
  const negative = w < BigInt(0);
  if (negative) w = -w;
  const base = BigInt("1000000000000000000");
  const whole = w / base;
  let frac = (w % base).toString().padStart(18, "0").slice(0, maxDecimals);
  frac = frac.replace(/0+$/, "");
  if (frac.length < minDecimals) frac = frac.padEnd(minDecimals, "0");
  return `${negative ? "-" : ""}${whole.toString()}${frac ? "." + frac : ""} GEN`;
}

/**
 * Format basis points to a readable percentage string.
 * 1500 bps → "15.00%"
 */
export function bpsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * Format basis points as a comma-formatted bps string.
 * 1500 → "1,500 bps"
 */
export function formatBps(bps: number): string {
  return `${bps.toLocaleString()} bps`;
}

/**
 * Format uptime from basis points.
 * 9942 → "99.42%"
 */
export function formatUptimeBps(uptimeBps: number): string {
  return `${(uptimeBps / 100).toFixed(2)}%`;
}

/**
 * Format a UNIX timestamp to a human-readable date/time.
 */
export function formatTimestamp(unix: number): string {
  if (!unix || unix === 0) return "—";
  const date = new Date(unix * 1000);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Format duration minutes to a readable string.
 * 47 → "47 min", 125 → "2h 5min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

/**
 * Map contract claim to a display status.
 */
export function getClaimStatus(
  claim: {
    status?: string;
    disputed?: boolean;
    finalized?: boolean;
    penalty_bps?: number;
  },
): string {
  if (claim.status === "DISMISSED") return "DISMISSED";
  if (claim.finalized && claim.disputed) return "SETTLED";
  if (claim.finalized) return "SETTLED";
  if (claim.disputed) return "DISPUTED";
  if (!claim.finalized) return "PENDING";
  return "ACTIVE";
}

/**
 * Determine impact label styling.
 */
export function getImpactColor(impact: string): string {
  switch (impact?.toLowerCase()) {
    case "major":
      return "text-red-400";
    case "minor":
      return "text-amber-400";
    case "none":
      return "text-slate-400";
    default:
      return "text-slate-400";
  }
}
