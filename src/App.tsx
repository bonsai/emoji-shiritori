import { useCallback, useEffect, useRef, useState } from "react";
import {
  ALL_EMOJIS,
  canPlace,
  displayName,
  shuffle,
  type Emoji,
  type Lang,
} from "./emojis";
import {
  DEFAULT_BALANCE,
  buildBalance,
  fetchBalanceFromConfig,
  parseBalanceFromHash,
  type GameBalance,
  type Mode,
} from "./balance";
import "./App.css";

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
  const [showHints, setShowHints] = useState(false);
  const [balance, setBalance] = useState<GameBalance>(DEFAULT_BALANCE);
  const [balanceNote, setBalanceNote] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [result, setResult] = useState<"win" | "lose" | "draw" | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const gameRef = useRef<GameState | null>(null);

  const beginGame = useCallback((bal: GameBalance, m: Mode) => {
    const deck = shuffle(ALL_EMOJIS);
    const handSize = Math.min(bal.handSize, deck.length);
    const playerHand = deck.splice(0, handSize);
    const cpuHand = m === "solo" ? [] : deck.splice(0, handSize);
    const fieldCount = Math.max(1, Math.min(bal.fieldCount, deck.length));
    const fields: Emoji[] = [];
    for (let i = 0; i < fieldCount; i++) {
      fields.push(deck.pop()!);
    }
    const initial: GameState = { deck, playerHand, cpuHand, fields };
    setGame(initial);
    setResult(null);
    setScreen("game");
  }, []);

  useEffect(() => {
    const source = parseBalanceFromHash(window.location.hash);
    const hasParams = Object.keys(source.hash).length > 0;
    if (source.configUrl) {
      let cancelled = false;
      fetchBalanceFromConfig(source.configUrl)
        .then((remote) => {
          if (cancelled) return;
          const next = buildBalance(DEFAULT_BALANCE, source.hash, remote);
          setBalance(next);
          setMode(next.mode);
          setShowHints(next.hintsDefault);
          setBalanceNote(`config: ${source.configUrl}`);
          beginGame(next, next.mode);
        })
        .catch((err) => {
          if (cancelled) return;
          console.warn("config fetch failed:", err);
          const next = buildBalance(DEFAULT_BALANCE, source.hash);
          setBalance(next);
          setMode(next.mode);
          setShowHints(next.hintsDefault);
          setBalanceNote("config error");
          beginGame(next, next.mode);
        });
      return () => {
        cancelled = true;
      };
    }
    const next = buildBalance(DEFAULT_BALANCE, source.hash);
    setBalance(next);
    setMode(next.mode);
    setShowHints(next.hintsDefault);
    if (hasParams) {
      setBalanceNote("url balance");
      beginGame(next, next.mode);
    }
  }, [beginGame]);

  function showFlash(text: string) {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setFlash(text);
    flashTimer.current = window.setTimeout(() => setFlash(null), 700);
  }

  const startGame = useCallback(() => {
    beginGame(balance, mode);
  }, [beginGame, balance, mode]);

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

  function refillSolo(newGame: GameState): GameState {
    const need = balance.handSize - newGame.playerHand.length;
    if (need <= 0) return newGame;
    const used = new Set(
      [...newGame.playerHand, ...newGame.fields].map((e) => e.emoji)
    );
    let deck = [...newGame.deck];
    const drawn: Emoji[] = [];
    for (let i = 0; i < need; i++) {
      if (deck.length === 0) {
        const fresh = shuffle(ALL_EMOJIS.filter((e) => !used.has(e.emoji)));
        deck = fresh.length > 0 ? fresh : shuffle(ALL_EMOJIS);
      }
      const card = deck.pop()!;
      used.add(card.emoji);
      drawn.push(card);
    }
    return {
      ...newGame,
      playerHand: [...newGame.playerHand, ...drawn],
      deck,
    };
  }

  function placeCard(who: "player" | "cpu", card: Emoji, fieldIndex: number) {
    setGame((prev) => {
      if (!prev) return prev;
      const isPlayer = who === "player";
      const hand = isPlayer ? prev.playerHand : prev.cpuHand;
      const cardIndex = hand.findIndex((c) => c.emoji === card.emoji);
      if (cardIndex === -1) return prev;
      if (mode !== "solo" && !canPlace(card, prev.fields[fieldIndex], lang)) return prev;

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

      if (mode === "solo") {
        return refillSolo(newGame);
      }

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
    if (mode === "solo") {
      placeCard("player", card, 0);
      return;
    }
    for (let i = 0; i < game.fields.length; i++) {
      if (canPlace(card, game.fields[i], lang)) {
        placeCard("player", card, i);
        return;
      }
    }
  }

  useEffect(() => {
    if (screen !== "game" || mode === "solo") return;
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
    }, balance.cpuIntervalMs);
    return () => window.clearInterval(id);
  }, [screen, lang, mode, balance.cpuIntervalMs]);

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
            onClick={() => {
              setMode("speed");
              setShowHints(false);
            }}
          >
            {t.speed}
          </button>
          <button
            type="button"
            className={mode === "relax" ? "active" : ""}
            onClick={() => {
              setMode("relax");
              setShowHints(false);
            }}
          >
            {t.relax}
          </button>
          <button
            type="button"
            className={mode === "solo" ? "active" : ""}
            onClick={() => {
              setMode("solo");
              setShowHints(true);
            }}
          >
            {t.solo}
          </button>
        </div>
        <button type="button" className="start-btn" onClick={startGame}>
          {t.start}
        </button>
        <p className="rule">{t.rule}</p>
        <p className="balance-note">
          hand {balance.handSize} / fields {balance.fieldCount} / cpu{" "}
          {balance.cpuIntervalMs}ms / hints {showHints ? "on" : "off"}
          {balanceNote ? ` — ${balanceNote}` : ""}
        </p>
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

  const isSolo = mode === "solo";
  const showCardName = mode !== "relax";
  const showUiText = true;
  const deckLabel =
    isSolo && game.deck.length === 0 ? t.infinite : game.deck.length;

  return (
    <div className="battle">
      {showUiText && !isSolo && (
        <div className="cpu-area">
          <div className="label">CPU</div>
          <div className="deck-count">
            {t.hand}: {game.cpuHand.length}
          </div>
        </div>
      )}

      <div className="arena">
        {showUiText && <div className="flash">{flash}</div>}
        {!isSolo && <div className="vs">VS</div>}
        <div className={`fields ${mode}`}>
          {game.fields.map((f, i) => (
            <div
              key={i}
              className={`field-card ${showHints ? "hinted" : ""}`}
            >
              <div className="emoji-big">{f.emoji}</div>
              {showCardName && (
                <div className="reading">{displayName(f, lang)}</div>
              )}
            </div>
          ))}
        </div>
        {showUiText && (
          <div className="deck-remain">
            {t.deck}: {deckLabel}
          </div>
        )}
        <button
          type="button"
          className={`hint-toggle ${showHints ? "on" : ""}`}
          onClick={() => setShowHints((v) => !v)}
        >
          {showHints ? "✨ " + t.hintOn : t.hintOff}
        </button>
      </div>

      <div className="player-area">
        {showUiText && <div className="label">{t.you}</div>}
        <div className="hand">
          {game.playerHand.map((c) => {
            const playable =
              isSolo || game.fields.some((f) => canPlace(c, f, lang));
            return (
              <button
                key={c.emoji}
                type="button"
                className={`hand-card ${playable ? "playable" : "disabled"} ${
                  playable && showHints ? "hinted" : ""
                }`}
                onClick={() => playerPlace(c)}
                title={showCardName ? `${displayName(c, lang)} (${c.category})` : undefined}
              >
                <span className="emoji">{c.emoji}</span>
                {showCardName && (
                  <span className="reading">{displayName(c, lang)}</span>
                )}
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
    you: "あなた",
    hintOn: "ヒントOFF",
    hintOff: "ヒントON",
    win: "勝利！",
    lose: "敗北…",
    draw: "引き分け",
    again: "もう一度",
    menu: "メニュー",
    speed: "スピード（場2枚・ヒント文字なし）",
    relax: "ゆっくり（場1枚・ヒントなし）",
    solo: "ひとり無限（自由配置・全表示）",
    infinite: "∞",
  },
  en: {
    subtitle: "Speed Shiritori Battle",
    start: "Start",
    rule: "Quickly play an emoji whose name starts with the last letter on the field!",
    hand: "Hand",
    deck: "Deck",
    you: "You",
    hintOn: "Hints OFF",
    hintOff: "Hints ON",
    win: "You Win!",
    lose: "You Lose…",
    draw: "Draw",
    again: "Play Again",
    menu: "Menu",
    speed: "Speed (2 fields, no hint chars)",
    relax: "Relax (1 field, no hints)",
    solo: "Solo Infinite (free place, all shown)",
    infinite: "∞",
  },
};
