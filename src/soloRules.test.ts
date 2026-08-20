import { describe, expect, it } from "vitest";
import type { Emoji } from "./emojis";
import { playableCards, refillSoloHand } from "./soloRules";

const APPLE: Emoji = {
  emoji: "🍎",
  name: "apple",
  jaName: "りんご",
  category: "fruit",
  tags: [],
};
const GO: Emoji = {
  emoji: "🦍",
  name: "gorilla",
  jaName: "ごりら",
  category: "animal",
  tags: [],
};
const BANANA: Emoji = {
  emoji: "🍌",
  name: "banana",
  jaName: "バナナ",
  category: "fruit",
  tags: [],
};

const ALL = [APPLE, GO, BANANA];

describe("playableCards", () => {
  it("keeps only cards that follow the field in Japanese", () => {
    expect(playableCards([APPLE, GO, BANANA], APPLE, "ja")).toEqual([GO]);
  });

  it("uses the same rule for English", () => {
    expect(playableCards([APPLE, GO, BANANA], BANANA, "en")).toEqual([APPLE]);
  });
});

describe("refillSoloHand", () => {
  it("refills to the configured hand size", () => {
    const result = refillSoloHand([GO], [APPLE], [BANANA], 2, ALL);
    expect(result.hand).toHaveLength(2);
    expect(result.hand.map((e) => e.emoji)).toEqual(["🦍", "🍌"]);
  });

  it("does not duplicate cards currently in hand or fields when drawing", () => {
    const result = refillSoloHand([GO], [APPLE], [], 2, ALL);
    expect(new Set(result.hand.map((e) => e.emoji)).size).toBe(2);
    expect(result.hand.some((e) => e.emoji === APPLE.emoji)).toBe(false);
  });
});
