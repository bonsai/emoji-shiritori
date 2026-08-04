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

const HAND_SIZE = 8;
const CPU_INTERVAL_MS = 1100;

interface GameState {
  deck: Emoji[];
  playerHand: Emoji[];
  cpuHand: Emoji[];
  fields: [Emoji, Emoji];
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ja");
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
    const fields: [Emoji, Emoji] = [deck.pop()!, deck.pop()!];
    const initial: GameState = { deck, playerHand, cpuHand, fields };
    setGame(initial);
    setResult(null);
    setScreen("game");
  }, []);

  function endGame(
    newGame: GameState,
    reason: "empty-hand" | "stalemate"
  ) {
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

  function tryRefill(newGame: GameState): GameState {
    const { playerHand, cpuHand, fields, deck } = newGame;
    const playerCan = playerHand.some((c) => canPlace(c, fields[0], lang) || canPlace(c, fields[1], lang));
    const cpuCan = cpuHand.some((c) => canPlace(c, fields[0], lang) || canPlace(c, fields[1], lang));

    if (!playerCan && !cpuCan) {
      if (deck.length >= 2) {
        return {
          ...newGame,
          fields: [deck[deck.length - 1], deck[deck.length - 2]],
          deck: deck.slice(0, -2),
        };
      } else if (deck.length === 1) {
        return {
          ...newGame,
          fields: [deck[0], newGame.fields[1]],
          deck: [],
        };
      } else {
        endGame(newGame, "stalemate");
      }
    }
    return newGame;
  }

  function placeCard(who: "player" | "cpu", card: Emoji, fieldIndex: 0 | 1) {
    setGame((prev) => {
      if (!prev) return prev;
      const isPlayer = who === "player";
      const hand = isPlayer ? prev.playerHand : prev.cpuHand;
      const cardIndex = hand.findIndex((c) => c.emoji === card.emoji);
      if (cardIndex === -1) return prev;
      if (!canPlace(card, prev.fields[fieldIndex], lang)) return prev;

      const newHand = [...hand.slice(0, cardIndex), ...hand.slice(cardIndex + 1)];
      const newGame: GameState = {
        ...prev,
        fields: [
          fieldIndex === 0 ? card : prev.fields[0],
          fieldIndex === 1 ? card : prev.fields[1],
        ],
        playerHand: isPlayer ? newHand : prev.playerHand,
        cpuHand: isPlayer ? prev.cpuHand : newHand,
      };

      if (newHand.length === 0) {
        endGame(newGame, "empty-hand");
        return newGame;
      }

      const refilled = tryRefill(newGame);
      return refilled;
    });
    showFlash(who === "player" ? "YOU ATTACK!" : "CPU ATTACK!");
  }

  function playerPlace(card: Emoji) {
    if (!game || screen !== "game") return;
    if (canPlace(card, game.fields[0], lang)) {
      placeCard("player", card, 0);
    } else if (canPlace(card, game.fields[1], lang)) {
      placeCard("player", card, 1);
    }
  }

  useEffect(() => {
    if (screen !== "game") return;
    const id = window.setInterval(() => {
      const g = gameRef.current;
      if (!g) return;
      const options = g.cpuHand.filter(
        (c) => canPlace(c, g.fields[0], lang) || canPlace(c, g.fields[1], lang)
      );
      if (options.length === 0) return;
      const card = options[Math.floor(Math.random() * options.length)];
      const fieldIndex: 0 | 1 = canPlace(card, g.fields[0], lang) ? 0 : 1;
      placeCard("cpu", card, fieldIndex);
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
        <button type="button" className="menu-btn" onClick={() => setScreen("menu")}>
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
        <div className="fields">
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
            const playable =
              canPlace(c, game.fields[0], lang) || canPlace(c, game.fields[1], lang);
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
                <span className="first-char">{firstChar(displayName(c, lang))}</span>
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
  },
};
