import { ALL_EMOJIS, canPlace, shuffle, type Emoji, type Lang } from "./emojis";

export type Phase = "playing" | "finished";
export type FinishReason = "timeout" | "stalemate" | "cleared" | null;

export interface GameConfig {
  handSize: number;
  roundSeconds: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  handSize: 7,
  roundSeconds: 60,
};

export interface GameState {
  phase: Phase;
  field: Emoji;
  hand: Emoji[];
  deck: Emoji[];
  combo: number;
  moves: number;
  secondsLeft: number;
  reason: FinishReason;
}

export type GameEvent =
  | { type: "START"; config?: GameConfig }
  | { type: "CHOOSE"; emoji: string }
  | { type: "TICK" };

export type Rng = () => number;

function drawCards(
  deck: Emoji[],
  count: number,
  used: Set<string>,
  rng: Rng
): { deck: Emoji[]; drawn: Emoji[] } {
  let source = [...deck];
  const drawn: Emoji[] = [];
  while (drawn.length < count) {
    if (source.length === 0) {
      const remaining = ALL_EMOJIS.filter((e) => !used.has(e.emoji));
      source = shuffle(remaining.length > 0 ? remaining : ALL_EMOJIS, rng);
    }
    const card = source.pop();
    if (!card) break;
    drawn.push(card);
    used.add(card.emoji);
  }
  return { deck: source, drawn };
}

export function createGame(
  config: GameConfig = DEFAULT_GAME_CONFIG,
  rng: Rng = Math.random
): GameState {
  const pool = shuffle(ALL_EMOJIS, rng);
  const field = pool.pop() as Emoji;
  const hand = pool.splice(0, config.handSize);
  return {
    phase: "playing",
    field,
    hand,
    deck: pool,
    combo: 0,
    moves: 0,
    secondsLeft: config.roundSeconds,
    reason: null,
  };
}

/** 現在の場に置ける手札 = 次の選択肢。 */
export function nextChoices(state: GameState, lang: Lang): Emoji[] {
  return state.hand.filter((card) => canPlace(card, state.field, lang));
}

function isPlayable(state: GameState, emoji: string, lang: Lang): boolean {
  const card = state.hand.find((c) => c.emoji === emoji);
  return card !== undefined && canPlace(card, state.field, lang);
}

function finish(state: GameState, reason: FinishReason): GameState {
  return { ...state, phase: "finished", reason };
}

function applyMove(
  state: GameState,
  card: Emoji,
  lang: Lang,
  rng: Rng
): GameState {
  const hand = state.hand.filter((c) => c.emoji !== card.emoji);
  const used = new Set([state.field.emoji, ...hand.map((c) => c.emoji), card.emoji]);
  const refill = drawCards(state.deck, 1, used, rng);
  const next: GameState = {
    ...state,
    deck: refill.deck,
    hand: [...hand, ...refill.drawn],
    field: card,
    combo: state.combo + 1,
    moves: state.moves + 1,
  };
  if (next.hand.length === 0) return finish(next, "cleared");
  if (nextChoices(next, lang).length === 0) return finish(next, "stalemate");
  return next;
}

export function reduce(
  state: GameState,
  event: GameEvent,
  lang: Lang,
  rng: Rng = Math.random
): GameState {
  switch (event.type) {
    case "START":
      return createGame(event.config ?? DEFAULT_GAME_CONFIG, rng);
    case "TICK": {
      if (state.phase !== "playing") return state;
      if (state.secondsLeft <= 1) {
        return finish({ ...state, secondsLeft: 0 }, "timeout");
      }
      return { ...state, secondsLeft: state.secondsLeft - 1 };
    }
    case "CHOOSE": {
      if (state.phase !== "playing") return state;
      if (!isPlayable(state, event.emoji, lang)) return state;
      const card = state.hand.find((c) => c.emoji === event.emoji) as Emoji;
      return applyMove(state, card, lang, rng);
    }
    default:
      return state;
  }
}
