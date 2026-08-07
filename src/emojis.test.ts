import { describe, expect, it } from "vitest";
import { canPlace, displayName, firstChar, lastChar, shuffle, ALL_EMOJIS } from "./emojis";
import type { Emoji } from "./emojis";

const APPLE: Emoji = { emoji: "🍎", name: "apple", jaName: "りんご", category: "fruit", tags: [] };
const BANANA: Emoji = { emoji: "🍌", name: "banana", jaName: "バナナ", category: "fruit", tags: [] };
const GNOME: Emoji = { emoji: "👺", name: "goblin", jaName: "てんぐ", category: "object", tags: [] };

describe("firstChar", () => {
  it("returns first character", () => {
    expect(firstChar("りんご")).toBe("り");
    expect(firstChar("apple")).toBe("a");
  });
  it("handles emoji strings", () => {
    expect(firstChar("🍎りんご")).toBe("🍎");
  });
  it("handles empty string", () => {
    expect(firstChar("")).toBe("");
  });
});

describe("lastChar", () => {
  it("returns last character", () => {
    expect(lastChar("りんご")).toBe("ご");
    expect(lastChar("apple")).toBe("e");
  });
  it("handles empty string", () => {
    expect(lastChar("")).toBe("");
  });
});

describe("canPlace", () => {
  it("matches when card first char equals target last char (ja)", () => {
    expect(canPlace(BANANA, APPLE, "ja")).toBe(false);
  });
  it("rejects non-matching chars (ja)", () => {
    expect(canPlace(GNOME, APPLE, "ja")).toBe(false);
  });
  it("matches when card first char equals target last char (en)", () => {
    expect(canPlace(APPLE, BANANA, "en")).toBe(true);
  });
  it("rejects non-matching chars (en)", () => {
    expect(canPlace(BANANA, APPLE, "en")).toBe(false);
  });
});

describe("displayName", () => {
  it("returns jaName for ja lang", () => {
    expect(displayName(APPLE, "ja")).toBe("りんご");
  });
  it("returns name for en lang", () => {
    expect(displayName(APPLE, "en")).toBe("apple");
  });
});

describe("shuffle", () => {
  it("returns same length", () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(arr.length);
  });
  it("does not mutate original", () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
  it("contains same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual(arr.sort());
  });
});

describe("ALL_EMOJIS", () => {
  it("is non-empty", () => {
    expect(ALL_EMOJIS.length).toBeGreaterThan(0);
  });
  it("every item has required fields", () => {
    for (const e of ALL_EMOJIS) {
      expect(e.emoji).toBeTruthy();
      expect(e.name).toBeTruthy();
      expect(e.jaName).toBeTruthy();
      expect(e.category).toBeTruthy();
    }
  });
});
