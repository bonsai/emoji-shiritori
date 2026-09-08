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
  moves: number;
}

type Screen = "menu" | "game" | "result";
type Result = "win" | "lose" | "draw";

type Onboarding = "lose" | "practice" | "comeback" | null;

const ONBOARDING_KEY = "emoji-shiritori.onboarding";
const ONBOARDING_DONE = "done";

const STORY_DECK: Record<string, string[]> = {
  __first: ["nature", "plant", "sky"],
  lose: ["food", "fruit", "vegetable", "drink"],
  practice: ["food", "fruit", "vegetable", "drink"],
  comeback: [],
};

function isOnboardingDone(): boolean {
  return window.localStorage.getItem(ONBOARDING_KEY) === ONBOARDING_DONE;
}

function getStoryDeck(stage: Onboarding): Emoji[] {
  const cats = STORY_DECK[stage ?? "__first"];
  if (!cats || cats.length === 0) return ALL_EMOJIS;
  const filtered = ALL_EMOJIS.filter((e) => cats.includes(e.category));
  return filtered.length >= 4 ? filtered : ALL_EMOJIS;
}

function anyCanPlace(hand: Emoji[], fields: Emoji[], lang: Lang): boolean {
  return hand.some((card) => fields.some((field) => canPlace(card, field, lang)));
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [mode, setMode] = useState<Mode>("relax");
  const [screen, setScreen] = useState<Screen>("menu");
  const [showHints, setShowHints] = useState(false);
  const [balance, setBalance] = useState<GameBalance>(DEFAULT_BALANCE);
  const [balanceNote, setBalanceNote] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [revive, setRevive] = useState(false);
  const [onboarding, setOnboarding] = useState<Onboarding>(null);
  const [comebackMode, setComebackMode] = useState<Mode>("relax");
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<number | null>(null);
  const gameRef = useRef<GameState | null>(null);

  // Keep the ref in lock-step with React state. The CPU loop reads the ref,
  // so without this effect it would only ever see the initial game state.
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const beginGame = useCallback((bal: GameBalance, selectedMode: Mode, pool?: Emoji[]) => {
    const deck = shuffle(pool ?? ALL_EMOJIS);
    const handSize = Math.min(bal.handSize, deck.length);
    const playerHand = deck.splice(0, handSize);
    const cpuHand = selectedMode === "solo" ? [] : deck.splice(0, handSize);
    const fieldCount = Math.max(1, Math.min(bal.fieldCount, deck.length));
    const fields: Emoji[] = [];
    for (let i = 0; i < fieldCount; i++) fields.push(deck.pop()!);
    const initial: GameState = { deck, playerHand, cpuHand, fields, moves: 0 };
    gameRef.current = initial;
    setGame(initial);
    setResult(null);
    setRevive(false);
    setScreen("game");
  }, []);

  useEffect(() => {
    const source = parseBalanceFromHash(window.location.hash);
    const hasParams = Object.keys(source.hash).length > 0;
    if (!source.configUrl) {
      const next = buildBalance(DEFAULT_BALANCE, source.hash);
      setBalance(next);
      setMode(next.mode);
      setShowHints(next.hintsDefault);
      if (hasParams) {
        setBalanceNote("URL balance");
        beginGame(next, next.mode, !isOnboardingDone() ? getStoryDeck(null) : undefined);
      }
      return;
    }

    const controller = new AbortController();
    fetchBalanceFromConfig(source.configUrl, controller.signal)
      .then((remote) => {
        const next = buildBalance(DEFAULT_BALANCE, source.hash, remote);
        setBalance(next);
        setMode(next.mode);
        setShowHints(next.hintsDefault);
        setBalanceNote(`config: ${source.configUrl}`);
        beginGame(next, next.mode, !isOnboardingDone() ? getStoryDeck(null) : undefined);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("config fetch failed:", err);
        const next = buildBalance(DEFAULT_BALANCE, source.hash);
        setBalance(next);
        setMode(next.mode);
        setShowHints(next.hintsDefault);
        setBalanceNote("config error; defaults used");
        beginGame(next, next.mode, !isOnboardingDone() ? getStoryDeck(null) : undefined);
      });
    return () => controller.abort();
  }, [beginGame]);

  function showFlash(text: string) {
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    setFlash(text);
    flashTimer.current = window.setTimeout(() => setFlash(null), 650);
  }

  const startGame = useCallback(() => {
    setOnboarding(null);
    beginGame(balance, mode, !isOnboardingDone() ? getStoryDeck(null) : undefined);
  }, [balance, beginGame, mode]);

  function finishGame(next: GameState, why: "empty-hand" | "stalemate") {
    const outcome: Result =
      why === "empty-hand"
        ? next.playerHand.length === 0
          ? "win"
          : "lose"
        : next.playerHand.length < next.cpuHand.length
          ? "win"
          : next.playerHand.length > next.cpuHand.length
            ? "lose"
            : "draw";

    if (outcome === "win" && onboarding === "comeback") {
      window.localStorage.setItem(ONBOARDING_KEY, ONBOARDING_DONE);
      setRevive(true);
      setOnboarding(null);
    } else if (outcome === "win" && !isOnboardingDone()) {
      window.localStorage.setItem(ONBOARDING_KEY, ONBOARDING_DONE);
    } else if (outcome === "lose" && !isOnboardingDone()) {
      setOnboarding("lose");
    }
    gameRef.current = next;
    setGame(next);
    setResult(outcome);
    setScreen("result");
  }

  function refillFields(next: GameState): GameState {
    if (anyCanPlace(next.playerHand, next.fields, lang) || anyCanPlace(next.cpuHand, next.fields, lang)) {
      return next;
    }
    if (next.deck.length === 0) {
      finishGame(next, "stalemate");
      return next;
    }
    const deck = [...next.deck];
    const fields = next.fields.map(() => deck.pop()!).filter(Boolean);
    return { ...next, deck, fields };
  }

  function refillSolo(next: GameState): GameState {
    const need = balance.handSize - next.playerHand.length;
    if (need <= 0) return next;
    let deck = [...next.deck];
    const used = new Set([...next.playerHand, ...next.fields].map((e) => e.emoji));
    const drawn: Emoji[] = [];
    for (let i = 0; i < need; i++) {
      if (deck.length === 0) {
        deck = shuffle(ALL_EMOJIS.filter((e) => !used.has(e.emoji)));
        if (deck.length === 0) deck = shuffle(ALL_EMOJIS);
      }
      const card = deck.pop();
      if (!card) break;
      drawn.push(card);
      used.add(card.emoji);
    }
    return { ...next, deck, playerHand: [...next.playerHand, ...drawn] };
  }

  function placeCard(who: "player" | "cpu", card: Emoji, fieldIndex: number) {
    setGame((prev) => {
      if (!prev || screen !== "game") return prev;
      const hand = who === "player" ? prev.playerHand : prev.cpuHand;
      const index = hand.findIndex((c) => c.emoji === card.emoji);
      if (index < 0 || !prev.fields[fieldIndex]) return prev;

      // Solo is deliberately a sandbox: it lets players explore the deck.
      if (mode !== "solo" && !canPlace(card, prev.fields[fieldIndex], lang)) return prev;

      const nextHand = [...hand.slice(0, index), ...hand.slice(index + 1)];
      const next: GameState = {
        ...prev,
        moves: prev.moves + 1,
        fields: prev.fields.map((field, i) => (i === fieldIndex ? card : field)),
        playerHand: who === "player" ? nextHand : prev.playerHand,
        cpuHand: who === "cpu" ? nextHand : prev.cpuHand,
      };

      if (mode === "solo") return refillSolo(next);
      if (nextHand.length === 0) {
        finishGame(next, "empty-hand");
        return next;
      }
      return refillFields(next);
    });
    showFlash(who === "player" ? "YOU ATTACK!" : "CPU ATTACK!");
  }

  function playerPlace(card: Emoji) {
    const current = gameRef.current;
    if (!current || screen !== "game") return;
    if (mode === "solo") {
      placeCard("player", card, 0);
      return;
    }
    const index = current.fields.findIndex((field) => canPlace(card, field, lang));
    if (index >= 0) placeCard("player", card, index);
  }

  useEffect(() => {
    if (screen !== "game" || mode === "solo") return;
    const id = window.setInterval(() => {
      const current = gameRef.current;
      if (!current) return;
      const options: Array<{ card: Emoji; fieldIndex: number }> = [];
      for (const card of current.cpuHand) {
        for (let i = 0; i < current.fields.length; i++) {
          if (canPlace(card, current.fields[i], lang)) options.push({ card, fieldIndex: i });
        }
      }
      if (options.length === 0) return;
      const choice = options[Math.floor(Math.random() * options.length)];
      placeCard("cpu", choice.card, choice.fieldIndex);
    }, Math.max(250, balance.cpuIntervalMs));
    return () => window.clearInterval(id);
  }, [balance.cpuIntervalMs, lang, mode, screen]);

  const t = TEXT[lang];

  if (screen === "menu") {
    const prologue = !isOnboardingDone();
    return (
      <div className="menu">
        <h1>Emoji Shiritori</h1>
        {prologue ? (
          <div className="prologue">
            <h2 className="chapter-title">{t.prologueTitle}</h2>
            <p className="prologue-text">{t.prologue}</p>
          </div>
        ) : (
          <p className="subtitle">{t.subtitle}</p>
        )}
        <div className="lang-select">
          <button type="button" className={lang === "ja" ? "active" : ""} onClick={() => setLang("ja")}>日本語</button>
          <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button>
        </div>
        <div className="mode-select">
          <button type="button" className={mode === "speed" ? "active" : ""} onClick={() => { setMode("speed"); setShowHints(false); }}>{t.speed}</button>
          <button type="button" className={mode === "relax" ? "active" : ""} onClick={() => { setMode("relax"); setShowHints(false); }}>{t.relax}</button>
          <button type="button" className={mode === "solo" ? "active" : ""} onClick={() => { setMode("solo"); setShowHints(true); }}>{t.solo}</button>
        </div>
        <button type="button" className="start-btn" onClick={startGame}>{prologue ? t.prologueStart : t.start}</button>
        <p className="rule">{t.rule}</p>
        <p className="balance-note">{t.hand} {balance.handSize} / {t.fields} {balance.fieldCount} / CPU {balance.cpuIntervalMs}ms{balanceNote ? ` — ${balanceNote}` : ""}</p>
      </div>
    );
  }

  if (screen === "result" && result) {
    const training = result === "lose" && onboarding === "lose";
    return (
      <div className={`result ${result} ${revive ? "revive" : ""}`}>
        {training && <h2 className="chapter-title">{t.storyDefeat}</h2>}
        {revive ? <><h2 className="chapter-title">{t.revive}</h2><p className="revive-note">{t.reviveNote}</p></> : <h1>{t[result]}</h1>}
        {training && <button type="button" className="practice-btn" onClick={() => { setComebackMode(mode); setMode("solo"); setShowHints(true); setOnboarding("practice"); beginGame(balance, "solo", getStoryDeck("practice")); }}>{t.storyDefeatBtn}</button>}
        <button type="button" className="start-btn" onClick={startGame}>{t.again}</button>
        <button type="button" className="menu-btn" onClick={() => { setOnboarding(null); setRevive(false); setScreen("menu"); }}>{t.menu}</button>
      </div>
    );
  }

  if (!game) return null;
  const isSolo = mode === "solo";
  const showCardName = mode !== "relax";
  const deckLabel = isSolo && game.deck.length === 0 ? t.infinite : game.deck.length;

  return (
    <div className="battle">
      {!isSolo && <div className="cpu-area"><div className="label">CPU</div><div className="deck-count">{t.hand}: {game.cpuHand.length}</div></div>}
      <div className="arena">
        <div className="flash">{flash}</div>
        {!isSolo && <div className="vs">VS</div>}
        <div className={`fields ${mode}`}>
          {game.fields.map((field, index) => {
            const target = lastChar(displayName(field, lang));
            return (
              <div key={`${field.emoji}-${index}`} className={`field-card ${showHints ? "hinted" : ""}`}>
                <div className="emoji-big">{field.emoji}</div>
                {showCardName && <div className="reading">{displayName(field, lang)}</div>}
                <div className="target-char">{t.target}: {target || "—"}</div>
              </div>
            );
          })}
        </div>
        <div className="deck-remain">{t.deck}: {deckLabel} · {t.moves}: {game.moves}</div>
        {isSolo && onboarding === "practice" && <><p className="training-banner">{t.storyTrainingBanner}</p><button type="button" className="practice-bar" onClick={() => { setMode(comebackMode); setShowHints(false); setOnboarding("comeback"); beginGame(balance, comebackMode, getStoryDeck("comeback")); }}>{t.backToBattle}</button></>}
        {!isSolo && onboarding === "comeback" && <p className="final-banner">{t.storyFinalTitle}</p>}
        <button type="button" className={`hint-toggle ${showHints ? "on" : ""}`} onClick={() => setShowHints((v) => !v)}>{showHints ? t.hintOn : t.hintOff}</button>
      </div>
      <div className="player-area">
        <div className="label">{t.you}</div>
        <div className="hand">
          {game.playerHand.map((card) => {
            const playable = isSolo || game.fields.some((field) => canPlace(card, field, lang));
            return (
              <button key={card.emoji} type="button" className={`hand-card ${playable ? "playable" : "disabled"} ${playable && showHints ? "hinted" : ""}`} onClick={() => playerPlace(card)} title={`${displayName(card, lang)} (${firstChar(displayName(card, lang))})`}>
                <span className="emoji">{card.emoji}</span>
                {showCardName && <span className="reading">{displayName(card, lang)}</span>}
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
    subtitle: "絵文字で遊ぶスピードしりとりバトル",
    start: "はじめる",
    rule: "場の絵文字の最後の文字から始まる名前の絵文字を出そう。先に手札をなくしたら勝ち！",
    hand: "手札",
    fields: "場",
    deck: "山札",
    moves: "手数",
    target: "次の文字",
    you: "あなた",
    hintOn: "✨ ヒントをOFF",
    hintOff: "✨ ヒントをON",
    win: "勝利！",
    lose: "敗北…",
    draw: "引き分け",
    prologueTitle: "第1章「自然」",
    prologue: "謎のCPUが自然エリアに現れた！ 絵文字をつないで立ち向かえ！",
    prologueStart: "出撃！",
    storyDefeat: "自然エリアで敗れた… 「食べ物エリア」で修行しよう！",
    storyDefeatBtn: "修行に出る",
    storyTrainingBanner: "修行中… 食べ物の絵文字で練習！",
    storyFinalTitle: "最終章「決戦」",
    revive: "復活！",
    reviveNote: "修行の成果でCPUを打ち倒した！ 絵文字世界に平和が戻った！",
    backToBattle: "決戦に挑む",
    again: "もう一度",
    menu: "メニュー",
    speed: "スピード（場2枚・名前表示）",
    relax: "ゆっくり（場1枚）",
    solo: "ひとり練習（自由配置）",
    infinite: "∞",
  },
  en: {
    subtitle: "Fast emoji shiritori battle",
    start: "Start",
    rule: "Play an emoji whose name starts with the field's last character. Empty your hand first to win!",
    hand: "Hand",
    fields: "Fields",
    deck: "Deck",
    moves: "Moves",
    target: "Next",
    you: "You",
    hintOn: "✨ Turn hints OFF",
    hintOff: "✨ Turn hints ON",
    win: "You Win!",
    lose: "You Lose…",
    draw: "Draw",
    prologueTitle: "Ch.1 \"Nature\"",
    prologue: "A mysterious CPU appears in the Nature zone. Connect the emojis and fight back!",
    prologueStart: "Sortie!",
    storyDefeat: "Defeated in Nature… train in the Food zone!",
    storyDefeatBtn: "Go Train",
    storyTrainingBanner: "Training… practice with Food emojis!",
    storyFinalTitle: "Ch.3 \"Final\"",
    revive: "Revived!",
    reviveNote: "Training paid off — the CPU is defeated! Peace returns!",
    backToBattle: "Final Battle",
    again: "Play Again",
    menu: "Menu",
    speed: "Speed (2 fields, names shown)",
    relax: "Relax (1 field)",
    solo: "Solo Practice (free place)",
    infinite: "∞",
  },
};
