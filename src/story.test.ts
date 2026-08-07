import { describe, expect, it } from "vitest";
import { ALL_EMOJIS } from "./emojis";
import type { Emoji } from "./emojis";

type Onboarding = "lose" | "practice" | "comeback" | null;

const STORY_DECK: Record<string, string[]> = {
  __first: ["nature", "plant", "sky"],
  lose: ["food", "fruit", "vegetable", "drink"],
  practice: ["food", "fruit", "vegetable", "drink"],
  comeback: [],
};

function getStoryDeck(onboarding: Onboarding): Emoji[] {
  const cats = STORY_DECK[onboarding ?? "__first"];
  if (!cats || cats.length === 0) return ALL_EMOJIS;
  return ALL_EMOJIS.filter((e) => cats.includes(e.category));
}

describe("getStoryDeck", () => {
  it("null onboarding returns first chapter categories", () => {
    const deck = getStoryDeck(null);
    expect(deck.length).toBeGreaterThan(0);
    expect(deck.length).toBeLessThan(ALL_EMOJIS.length);
    for (const e of deck) {
      expect(["nature", "plant", "sky"]).toContain(e.category);
    }
  });

  it("lose onboarding returns food categories", () => {
    const deck = getStoryDeck("lose");
    expect(deck.length).toBeGreaterThan(0);
    for (const e of deck) {
      expect(["food", "fruit", "vegetable", "drink"]).toContain(e.category);
    }
  });

  it("practice onboarding returns food categories", () => {
    const deck = getStoryDeck("practice");
    expect(deck.length).toBeGreaterThan(0);
    for (const e of deck) {
      expect(["food", "fruit", "vegetable", "drink"]).toContain(e.category);
    }
  });

  it("comeback onboarding returns all emojis", () => {
    const deck = getStoryDeck("comeback");
    expect(deck).toEqual(ALL_EMOJIS);
  });

  it("all decks are non-empty", () => {
    for (const phase of [null, "lose", "practice", "comeback"] as Onboarding[]) {
      expect(getStoryDeck(phase).length).toBeGreaterThan(0);
    }
  });
});
