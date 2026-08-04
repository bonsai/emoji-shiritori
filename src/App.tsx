import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALL_EMOJIS,
  canPlace,
  displayName,
  firstChar,
  lastChar,
  shuffle,
  type Emoji,
  type Lang,
} from "./emojis";
import "./App.css";

const HAND_SIZE = 20;
const CPU_INTERVAL_MS = 1100;

type Mode = "speed" | "relax";

interface GameState {
  deck: Emoji[];
  playerHand: Emoji[];
  cpuHand: Emoji[];
  fields: Emoji[];
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode>("relax");
  const [screen, setScreen] = useState<"menu" | "game" | "result">("menu");
  const [game, setGame] = useState<GameState | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const gameRef = useRef<GameState | null>(null);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  function showFlash(text: string) {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setFlash(text);
    flashTimer.current = window.setTimeout(() => setFlash(null), 700);
  }

  const startGame = useCallback(() => {
    const deck = shuffle(ALL_EMOJIS);
    const playerHand = deck.splice(0, HAND_SIZE);
    const cpuHand = deck.splice(0, HAND_SIZE);
    const fieldCount = mode === "speed" ? 2 : 1;
    const fields: Emoji[] = [];
    for (let i = 0; i < fieldCount; i++) {
      fields.push(deck.pop()!);
    }
    const initial: GameState = { deck, playerHand, cpuHand, fields };
    setGame(initial);
    setResult(null);
    setScreen("game");
  }, [mode]);

  function endGame(newGame: GameState, reason: "empty-hand" | "stalemate") {
    let outcome: "win" | "lose" | "draw";
    if (reason === "empty-hand") {
      outcome = newGame.playerHand.length === 0 ? "win" : "lose";
    } else {
      const p = newGame.playerHand.length;
      const c = newGame.cpuHand.length;
      outcome = p < c ? "win" : c < p ? "lose" : "draw";
    }
    setGame(newGame);
    setResult(outcome);
    setScreen("result");
  }

  function anyCanPlace(hand: Emoji[], fields: Emoji[]): boolean {
    return hand.some((c) => fields.some((f) => canPlace(c, f, lang)));
  }

  function tryRefill(newGame: GameState): GameState {
    const { playerHand, cpuHand, fields, deck } = newGame;
    if (anyCanPlace(playerHand, fields) || anyCanPlace(cpuHand, fields)) {
      return newGame;
    }
    if (deck.length === 0) {
      endGame(newGame, "stalemate");
      return newGame;
    }
    const count = Math.min(fields.length, deck.length);
    const nextFields: Emoji[] = [];
    const nextDeck = [...deck];
    for (let i = 0; i < count; i++) {
      nextFields.push(nextDeck.pop()!);
    }
    return {
      ...newGame,
      fields: nextFields,
      deck: nextDeck,
    };
  }

  function placeCard(who: "player" | "cpu", card: Emoji, fieldIndex: number) {
    setGame((prev) => {
      if (!prev) return prev;
      const isPlayer = who === "player";
      const hand = isPlayer ? prev.playerHand : prev.cpuHand;
      const cardIndex = hand.findIndex((c) => c.emoji === card.emoji);
      if (cardIndex === -1) return prev;
      if (!canPlace(card, prev.fields[fieldIndex], lang)) return prev;

      const newHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)];
      const newFields = prev.fields.map((f, i) =>
        i === fieldIndex ? card : f
      );
      const newGame: GameState = {
        ...prev,
        fields: newFields,
        playerHand: isPlayer ? newHand : prev.playerHand,
        cpuHand: isPlayer ? prev.cpuHand : newHand,
      };

      if (newHand.length === 0) {
        endGame(newGame, "empty-hand");
        return newGame;
      }

      return tryRefill(newGame);
    });
    showFlash(who === "player" ? "YOU ATTACK!" : "CPU ATTACK!");
  }

  function playerPlace(card: Emoji) {
    if (!game || screen !== "game") return;
    for (let i = 0; i < game.fields.length; i++) {
      if (canPlace(card, game.fields[i], lang)) {
        placeCard("player", card, i);
        return;
      }
    }
  }

  useEffect(() => {
    if (screen !== "game") return;
    const id = window.setInterval(() => {
      const g = gameRef.current;
      if (!g) return;
      const options: { card: Emoji; index: number }[] = [];
      for (const card of g.cpuHand) {
        for (let i = 0; i < g.fields.length; i++) {
          if (canPlace(card, g.fields[i], lang)) {
            options.push({ card, index: i });
          }
        }
      }
      if (options.length === 0) return;
      const choice = options[Math.floor(Math.random() * options.length)];
      placeCard("cpu", choice.card, choice.index);
    }, CPU_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [screen, lang]);

  const t = TEXT[lang];

  if (screen === "menu") {
    return (
      <div className="menu">
        <h1>Emoji Shiritori</h1>
        <p className="subtitle">{t.subtitle}</p>
        <div className="lang-select">
          <button
            type="button"
            className={lang === "ja" ? "active" : ""}
            onClick={() => setLang("ja")}
          >
            日本語
          </button>
          <button
            type="button"
            className={lang === "en" ? "active" : ""}
            onClick={() => setLang("en")}
          >
            English
          </button>
        </div>
        <div className="mode-select">
          <button
            type="button"
            className={mode === "speed" ? "active" : ""}
            onClick={() => setMode("speed")}
          >
            {t.speed}
          </button>
          <button
            type="button"
            className={mode === "relax" ? "active" : ""}
            onClick={() => setMode("relax")}
          >
            {t.relax}
          </button>
        </div>
        <button type="button" className="start-btn" onClick={startGame}>
          {t.start}
        </button>
        <p className="rule">{t.rule}</p>
      </div>
    );
  }

  if (screen === "result" && result) {
    return (
      <div className={`result ${result}`}>
        <h1>{t[result]}</h1>
        <button type="button" className="start-btn" onClick={startGame}>
          {t.again}
        </button>
        <button
          type="button"
          className="menu-btn"
          onClick={() => setScreen("menu")}
        >
          {t.menu}
        </button>
      </div>
    );
  }

  if (!game) return null;

  return (
    <div className="battle">
      <div className="cpu-area">
        <div className="label">CPU</div>
        <div className="deck-count">
          {t.hand}: {game.cpuHand.length}
        </div>
      </div>

      <div className="arena">
        <div className="flash">{flash}</div>
        <div className="vs">VS</div>
        <div className={`fields ${mode}`}>
          {game.fields.map((f, i) => (
            <div key={i} className="field-card">
              <div className="emoji-big">{f.emoji}</div>
              <div className="reading">{displayName(f, lang)}</div>
              <div className="target-char">
                {t.next}: {lastChar(displayName(f, lang))}
              </div>
            </div>
          ))}
        </div>
        <div className="deck-remain">
          {t.deck}: {game.deck.length}
        </div>
      </div>

      <div className="player-area">
        <div className="label">{t.you}</div>
        <div className="hand">
          {game.playerHand.map((c) => {
            const playable = game.fields.some((f) => canPlace(c, f, lang));
            return (
              <button
                key={c.emoji}
                type="button"
                className={`hand-card ${playable ? "playable" : "disabled"}`}
                onClick={() => playerPlace(c)}
                title={`${displayName(c, lang)} (${c.category})`}
              >
                <span className="emoji">{c.emoji}</span>
                <span className="reading">{displayName(c, lang)}</span>
                <span className="first-char">
                  {firstChar(displayName(c, lang))}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const TEXT = {
  ja: {
    subtitle: "スピードしりとりバトル",
    start: "はじめる",
    rule: "場の絵文字の最後の文字から始まる名前の絵文字を、素早く出そう！",
    hand: "手札",
    deck: "山札",
    next: "つなぐ",
    you: "あなた",
    win: "勝利！",
    lose: "敗北…",
    draw: "引き分け",
    again: "もう一度",
    menu: "メニュー",
    speed: "スピード（場2枚）",
    relax: "ゆっくり（場1枚）",
  },
  en: {
    subtitle: "Speed Shiritori Battle",
    start: "Start",
    rule: "Quickly play an emoji whose name starts with the last letter on the field!",
    hand: "Hand",
    deck: "Deck",
    next: "Next",
    you: "You",
    win: "You Win!",
    lose: "You Lose…",
    draw: "Draw",
    again: "Play Again",
    menu: "Menu",
    speed: "Speed (2 fields)",
    relax: "Relax (1 field)",
  },
};
