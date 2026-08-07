import { describe, expect, it } from "vitest";
import {
  buildBalance,
  DEFAULT_BALANCE,
  fetchBalanceFromConfig,
  parseBalanceFromHash,
} from "./balance";

describe("parseBalanceFromHash", () => {
  it("returns empty hash for no params", () => {
    const result = parseBalanceFromHash("#/");
    expect(result.hash).toEqual({});
    expect(result.configUrl).toBeUndefined();
  });

  it("returns empty for plain non-slash hash", () => {
    const result = parseBalanceFromHash("#foo");
    expect(result.hash).toEqual({});
  });

  it("parses hand=12", () => {
    const { hash } = parseBalanceFromHash("#/hand=12");
    expect(hash.handSize).toBe(12);
  });

  it("parses fields=3", () => {
    const { hash } = parseBalanceFromHash("#/fields=3");
    expect(hash.fieldCount).toBe(3);
  });

  it("parses cpu=700", () => {
    const { hash } = parseBalanceFromHash("#/cpu=700");
    expect(hash.cpuIntervalMs).toBe(700);
  });

  it("parses hints=on", () => {
    const { hash } = parseBalanceFromHash("#/hints=on");
    expect(hash.hintsDefault).toBe(true);
  });

  it("parses hints=off", () => {
    const { hash } = parseBalanceFromHash("#/hints=off");
    expect(hash.hintsDefault).toBe(false);
  });

  it("parses hints=1 as on", () => {
    const { hash } = parseBalanceFromHash("#/hints=1");
    expect(hash.hintsDefault).toBe(true);
  });

  it("parses mode=speed", () => {
    const { hash } = parseBalanceFromHash("#/mode=speed");
    expect(hash.mode).toBe("speed");
  });

  it("parses mode=relax", () => {
    const { hash } = parseBalanceFromHash("#/mode=relax");
    expect(hash.mode).toBe("relax");
  });

  it("parses mode=solo", () => {
    const { hash } = parseBalanceFromHash("#/mode=solo");
    expect(hash.mode).toBe("solo");
  });

  it("ignores invalid mode", () => {
    const { hash } = parseBalanceFromHash("#/mode=invalid");
    expect(hash.mode).toBeUndefined();
  });

  it("parses config URL", () => {
    const result = parseBalanceFromHash("#/config=http://localhost:8787/api/balance");
    expect(result.configUrl).toBe("http://localhost:8787/api/balance");
  });

  it("parses multiple params", () => {
    const route = "#/hand=12/fields=3/cpu=700/hints=on/mode=speed";
    const { hash } = parseBalanceFromHash(route);
    expect(hash.handSize).toBe(12);
    expect(hash.fieldCount).toBe(3);
    expect(hash.cpuIntervalMs).toBe(700);
    expect(hash.hintsDefault).toBe(true);
    expect(hash.mode).toBe("speed");
  });

  it("parses combined hash + config", () => {
    const result = parseBalanceFromHash("#/hand=10/config=http://localhost:8787/api/balance");
    expect(result.hash.handSize).toBe(10);
    expect(result.configUrl).toBe("http://localhost:8787/api/balance");
  });

  it("ignores empty value keys", () => {
    const { hash } = parseBalanceFromHash("#/hand");
    expect(hash.handSize).toBeUndefined();
  });

  it("ignores non-numeric values for numeric keys", () => {
    const { hash } = parseBalanceFromHash("#/hand=abc");
    expect(hash.handSize).toBeUndefined();
  });

  it("ignores zero values", () => {
    const { hash } = parseBalanceFromHash("#/hand=0");
    expect(hash.handSize).toBeUndefined();
  });
});

describe("buildBalance", () => {
  it("returns defaults when no overrides", () => {
    expect(buildBalance(DEFAULT_BALANCE)).toEqual(DEFAULT_BALANCE);
  });

  it("applies single override", () => {
    const result = buildBalance(DEFAULT_BALANCE, { handSize: 5 });
    expect(result.handSize).toBe(5);
    expect(result.fieldCount).toBe(DEFAULT_BALANCE.fieldCount);
  });

  it("applies multiple overrides in order", () => {
    const result = buildBalance(DEFAULT_BALANCE, { handSize: 5 }, { handSize: 10 });
    expect(result.handSize).toBe(10);
  });

  it("applies partial remote override", () => {
    const result = buildBalance(DEFAULT_BALANCE, { handSize: 8 }, { cpuIntervalMs: 500 });
    expect(result.handSize).toBe(8);
    expect(result.cpuIntervalMs).toBe(500);
    expect(result.fieldCount).toBe(DEFAULT_BALANCE.fieldCount);
  });

  it("ignores undefined overrides", () => {
    const result = buildBalance(DEFAULT_BALANCE, undefined, { handSize: 5 });
    expect(result.handSize).toBe(5);
  });

  it("handles all fields override", () => {
    const full = { handSize: 1, fieldCount: 1, cpuIntervalMs: 1, hintsDefault: true, mode: "solo" as const };
    expect(buildBalance(DEFAULT_BALANCE, full)).toEqual(full);
  });
});

describe("fetchBalanceFromConfig", () => {
  it("fetches valid balance JSON", async () => {
    const mock = { handSize: 5 };
    globalThis.fetch = async () =>
      ({ ok: true, json: async () => mock }) as Response;
    const result = await fetchBalanceFromConfig("http://example.com/api/balance");
    expect(result).toEqual(mock);
  });

  it("throws on non-ok response", async () => {
    globalThis.fetch = async () =>
      ({ ok: false, status: 500 }) as Response;
    await expect(fetchBalanceFromConfig("http://example.com/api/balance"))
      .rejects.toThrow("config fetch failed: 500");
  });

  it("passes abort signal", async () => {
    const controller = new AbortController();
    let calledUrl = "";
    globalThis.fetch = async (url, init) => {
      calledUrl = url as string;
      if (!init || !(init as RequestInit).signal)
        throw new Error("signal not passed");
      return { ok: true, json: async () => ({}) } as Response;
    };
    await fetchBalanceFromConfig("http://test/api/balance", controller.signal);
    expect(calledUrl).toBe("http://test/api/balance");
  });
});
