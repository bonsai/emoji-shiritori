export type Mode = "speed" | "relax" | "solo";

export interface GameBalance {
  handSize: number;
  fieldCount: number;
  cpuIntervalMs: number;
  hintsDefault: boolean;
  mode: Mode;
}

export const DEFAULT_BALANCE: GameBalance = {
  handSize: 20,
  fieldCount: 1,
  cpuIntervalMs: 1100,
  hintsDefault: false,
  mode: "relax",
};

export interface BalanceSource {
  hash: Partial<GameBalance>;
  configUrl?: string;
}

function toNum(v: string): number | undefined {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function toMode(v: string): Mode | undefined {
  return v === "speed" || v === "relax" || v === "solo" ? v : undefined;
}

export function parseBalanceFromHash(hash: string): BalanceSource {
  const source: BalanceSource = { hash: {} };
  if (!hash.startsWith("#/")) return source;
  const segments = hash.slice(2).split("/").filter(Boolean);
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const eq = seg.indexOf("=");
    const key = eq === -1 ? seg : seg.slice(0, eq);
    const val = eq === -1 ? "" : seg.slice(eq + 1);
    switch (key) {
      case "hand": {
        const n = toNum(val);
        if (n !== undefined) source.hash.handSize = n;
        break;
      }
      case "fields": {
        const n = toNum(val);
        if (n !== undefined) source.hash.fieldCount = n;
        break;
      }
      case "cpu": {
        const n = toNum(val);
        if (n !== undefined) source.hash.cpuIntervalMs = n;
        break;
      }
      case "hints":
        source.hash.hintsDefault = val === "on" || val === "1";
        break;
      case "mode": {
        const m = toMode(val);
        if (m !== undefined) source.hash.mode = m;
        break;
      }
      case "config": {
        const rest = segments.slice(i + 1).join("/");
        source.configUrl = val.endsWith(":")
          ? `${val}//${rest}`
          : val + (rest ? "/" + rest : "");
        break;
      }
    }
  }
  return source;
}

export async function fetchBalanceFromConfig(
  url: string,
  signal?: AbortSignal
): Promise<Partial<GameBalance>> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`config fetch failed: ${res.status}`);
  const data = await res.json();
  return data as Partial<GameBalance>;
}

export function buildBalance(
  defaults: GameBalance,
  ...overrides: Array<Partial<GameBalance> | undefined>
): GameBalance {
  return Object.assign({}, defaults, ...overrides);
}
