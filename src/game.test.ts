import { describe, expect, it } from "vitest";
import {
  createGame,
  DEFAULT_GAME_CONFIG,
  nextChoices,
  reduce,
  type GameState,
} from "./game";
import type { Emoji } from "./emojis";

function mk(emoji: string, jaName: string): Emoji {
  return { emoji, name: jaName, jaName, category: "test", tags: [] };
}

const field = mk("🅰️", "ねこ");
const b = mk("🅱️", "こま");
const c = mk("🌊", "また");
const d = mk("🌙", "ぬの");
const dummy = mk("⭐", "ほし");

function makeState(over: Partial<GameState> = {}): GameState {
  return {
    phase: "playing",
    field,
    hand: [b, c, d],
    deck: [dummy, dummy],
    combo: 0,
    moves: 0,
    secondsLeft: 60,
    reason: null,
    ...over,
  };
}

const rng = () => 0;

describe("createGame", () => {
  it("deals a full hand and starts playing", () => {
    const game = createGame(DEFAULT_GAME_CONFIG, rng);
    expect(game.phase).toBe("playing");
    expect(game.hand).toHaveLength(DEFAULT_GAME_CONFIG.handSize);
    expect(game.secondsLeft).toBe(DEFAULT_GAME_CONFIG.roundSeconds);
    expect(game.combo).toBe(0);
    expect(game.moves).toBe(0);
  });

  it("keeps the field card out of the hand", () => {
    const game = createGame(DEFAULT_GAME_CONFIG, rng);
    expect(game.hand.some((e) => e.emoji === game.field.emoji)).toBe(false);
  });
});

describe("nextChoices", () => {
  it("returns only cards that chain from the field", () => {
    expect(nextChoices(makeState(), "ja").map((e) => e.emoji)).toEqual([b.emoji]);
  });
});

describe("reduce CHOOSE", () => {
  it("moves the field, raises combo/moves, refills the hand", () => {
    const before = makeState();
    const after = reduce(before, { type: "CHOOSE", emoji: b.emoji }, "ja", rng);
    expect(after.phase).toBe("playing");
    expect(after.field.emoji).toBe(b.emoji);
    expect(after.combo).toBe(1);
    expect(after.moves).toBe(1);
    expect(after.hand).toHaveLength(before.hand.length);
    expect(after.hand.some((e) => e.emoji === b.emoji)).toBe(false);
  });

  it("changes the next choices after the move", () => {
    const before = makeState();
    const after = reduce(before, { type: "CHOOSE", emoji: b.emoji }, "ja", rng);
    expect(nextChoices(before, "ja").map((e) => e.emoji)).toEqual([b.emoji]);
    expect(nextChoices(after, "ja").map((e) => e.emoji)).toEqual([c.emoji]);
  });

  it("ignores a card that cannot chain", () => {
    const state = makeState();
    expect(reduce(state, { type: "CHOOSE", emoji: d.emoji }, "ja", rng)).toBe(state);
  });

  it("ignores an unknown card", () => {
    const state = makeState();
    expect(reduce(state, { type: "CHOOSE", emoji: "❓" }, "ja", rng)).toBe(state);
  });

  it("ignores input after the game is finished", () => {
    const state = makeState({ phase: "finished", reason: "timeout" });
    expect(reduce(state, { type: "CHOOSE", emoji: b.emoji }, "ja", rng)).toBe(state);
  });

  it("finishes with stalemate when no next choice remains", () => {
    const state = makeState({ hand: [b, d], deck: [dummy] });
    const after = reduce(state, { type: "CHOOSE", emoji: b.emoji }, "ja", rng);
    expect(after.phase).toBe("finished");
    expect(after.reason).toBe("stalemate");
  });
});

describe("reduce TICK", () => {
  it("counts down while playing", () => {
    const after = reduce(makeState(), { type: "TICK" }, "ja", rng);
    expect(after.secondsLeft).toBe(59);
    expect(after.phase).toBe("playing");
  });

  it("finishes with timeout at zero", () => {
    const after = reduce(makeState({ secondsLeft: 1 }), { type: "TICK" }, "ja", rng);
    expect(after.phase).toBe("finished");
    expect(after.reason).toBe("timeout");
    expect(after.secondsLeft).toBe(0);
  });

  it("ignores ticks after the game is finished", () => {
    const state = makeState({ phase: "finished", reason: "timeout", secondsLeft: 0 });
    expect(reduce(state, { type: "TICK" }, "ja", rng)).toBe(state);
  });
});

describe("reduce START", () => {
  it("restarts a fresh game", () => {
    const finished = makeState({ phase: "finished", reason: "timeout" });
    const after = reduce(finished, { type: "START" }, "ja", rng);
    expect(after.phase).toBe("playing");
    expect(after.moves).toBe(0);
    expect(after.reason).toBeNull();
  });
});
