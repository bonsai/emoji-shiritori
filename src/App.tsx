import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_EMOJIS, displayName, normalizeReading, readings, shuffle, type Emoji, type Lang } from "./emojis";
import "./App.css";

const HAND_SIZE = 20;
const ROUND_SECONDS = 60;
type Difficulty = "easy" | "normal" | "hard";
const PLAYABLE_TARGET: Record<Difficulty, number> = { easy: 8, normal: 7, hard: 5 };
const BEST_KEY = "emoji-shiritori.best-combo";
type Screen = "menu" | "game" | "result";
interface GameState { deck: Emoji[]; hand: Emoji[]; field: Emoji; combo: number; secondsLeft: number; moves: number; }

function playableFrom(field: Emoji, candidates: Emoji[], lang: Lang): Emoji[] {
  return candidates.filter((card) => canPlace(card, field, lang));
}

function newGame(difficulty: Difficulty, lang: Lang): GameState {
  // Start from the graph's sample-chain root: 🍌 → 🍆 is always available.
  const field = ALL_EMOJIS.find((e) => e.emoji === "🍌") ?? ALL_EMOJIS[0];
  const firstMove = ALL_EMOJIS.find((e) => e.emoji === "🍆");
  const remaining = ALL_EMOJIS.filter((e) => e.emoji !== field.emoji && e.emoji !== firstMove?.emoji);
  const playable = shuffle(playableFrom(field, remaining, lang));
  const target = Math.min(PLAYABLE_TARGET[difficulty], playable.length);
  const selected = firstMove && canPlace(firstMove, field, lang) ? [firstMove, ...playable.filter((e) => e.emoji !== firstMove.emoji).slice(0, target - 1)] : playable.slice(0, target);
  const selectedIds = new Set(selected.map((e) => e.emoji));
  const fillers = shuffle(remaining.filter((e) => !selectedIds.has(e.emoji))).slice(0, HAND_SIZE - selected.length);
  const hand = [...selected, ...fillers];
  const used = new Set(hand.map((e) => e.emoji)); used.add(field.emoji);
  return { deck: shuffle(ALL_EMOJIS.filter((e) => !used.has(e.emoji))), hand, field, combo: 0, secondsLeft: ROUND_SECONDS, moves: 0 };
}

function normalizeForShiritori(s: string): string {
  return normalizeReading(s)
    .replace(/[ぁぃぅぇぉっゃゅょゎ]/g, (c) => ({ぁ:"あ",ぃ:"い",ぅ:"う",ぇ:"え",ぉ:"お",っ:"つ",ゃ:"や",ゅ:"ゆ",ょ:"よ",ゎ:"わ"}[c] ?? c))
    .replace(/[ー]/g, "")
    .replace(/ん$/, "ん");
}

function firstSound(s: string): string { return Array.from(normalizeForShiritori(s))[0] ?? ""; }
function lastSound(s: string): string {
  const chars = Array.from(normalizeForShiritori(s));
  return chars[chars.length - 1] ?? "";
}

function canPlace(card: Emoji, target: Emoji, lang: Lang): boolean {
  return readings(card, lang).some((cardReading) =>
    readings(target, lang).some((targetReading) => firstSound(cardReading) === lastSound(targetReading))
  );
}

function targetSounds(card: Emoji, lang: Lang): string[] {
  return [...new Set(readings(card, lang).map(lastSound).filter(Boolean))];
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<GameState | null>(null);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const gameRef = useRef<GameState | null>(null);

  useEffect(() => { const stored = Number(window.localStorage.getItem(BEST_KEY) ?? 0); if (Number.isFinite(stored)) setBest(stored); }, []);
  useEffect(() => { gameRef.current = game; }, [game]);

  const start = useCallback(() => { const next = newGame(difficulty, lang); gameRef.current = next; setGame(next); setFlash(null); setScreen("game"); }, []);
  const finish = useCallback((finalGame: GameState) => {
    gameRef.current = finalGame; setGame(finalGame); setScreen("result");
    if (finalGame.combo > best) { setBest(finalGame.combo); window.localStorage.setItem(BEST_KEY, String(finalGame.combo)); }
  }, [best]);

  useEffect(() => {
    if (screen !== "game") return;
    const timer = window.setInterval(() => {
      const current = gameRef.current; if (!current) return;
      if (current.secondsLeft <= 1) { finish({ ...current, secondsLeft: 0 }); return; }
      const next = { ...current, secondsLeft: current.secondsLeft - 1 }; gameRef.current = next; setGame(next);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finish, screen]);

  const playableCards = useMemo(() => game ? game.hand.filter((card) => canPlace(card, game.field, lang)) : [], [game, lang]);
  const playable = useMemo(() => new Set(playableCards.map((card) => card.emoji)), [playableCards]);

  const play = useCallback((card: Emoji) => {
    const current = gameRef.current;
    if (!current || screen !== "game" || !canPlace(card, current.field, lang)) return;
    const index = current.hand.findIndex((item) => item.emoji === card.emoji); if (index < 0) return;
    const hand = [...current.hand.slice(0, index), ...current.hand.slice(index + 1)];
    const used = new Set([current.field.emoji, ...hand.map((item) => item.emoji)]);
    const candidates = ALL_EMOJIS.filter((item) => !used.has(item.emoji));
    const nextPlayable = shuffle(playableFrom(card, candidates, lang));
    const targetChoices = PLAYABLE_TARGET[difficulty];
    const currentPlayable = hand.filter((item) => canPlace(item, card, lang));
    const needed = Math.max(0, targetChoices - currentPlayable.length);
    const refillCount = Math.max(0, HAND_SIZE - hand.length);
    // The deck refills one card at a time; when below the difficulty target,
    // prefer a graph edge so the next move remains possible.
    const preferred = needed > 0 ? nextPlayable : [];
    const refill = [...preferred, ...shuffle(candidates.filter((item) => !preferred.some((x) => x.emoji === item.emoji)))].slice(0, refillCount);
    const refillIds = new Set(refill.map((item) => item.emoji));
    const next: GameState = { ...current, deck: candidates.filter((item) => !refillIds.has(item.emoji)), hand: [...hand, ...refill], field: card, combo: current.combo + 1, moves: current.moves + 1 };
    gameRef.current = next; setGame(next); setFlash(`+1  COMBO ${next.combo}`); window.setTimeout(() => setFlash(null), 420);
    if (!next.hand.some((item) => canPlace(item, next.field, lang))) finish(next);
  }, [finish, lang, screen]);

  const t = TEXT[lang];
  if (screen === "menu") return <main className="menu infinite-menu"><div className="eyebrow">EMOJI SHIRITORI</div><h1>∞ SINGLE</h1><p className="subtitle">{t.subtitle}</p><div className="best-card"><span>{t.best}</span><strong>{best}</strong><small>COMBO</small></div><div className="lang-select"><button type="button" className={lang === "ja" ? "active" : ""} onClick={() => setLang("ja")}>日本語</button><button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button></div><div className="lang-select difficulty-select"><button type="button" className={difficulty === "easy" ? "active" : ""} onClick={() => setDifficulty("easy")}>{t.easy}</button><button type="button" className={difficulty === "normal" ? "active" : ""} onClick={() => setDifficulty("normal")}>{t.normal}</button><button type="button" className={difficulty === "hard" ? "active" : ""} onClick={() => setDifficulty("hard")}>{t.hard}</button></div><button type="button" className="start-btn infinite-start" onClick={start}>{t.start}</button><p className="rule">{t.rule}</p></main>;

  if (screen === "result" && game) return <main className="result infinite-result"><div className="eyebrow">TIME UP / GAME OVER</div><h1>{t.gameOver}</h1><div className="result-combo"><span>COMBO</span><strong>{game.combo}</strong></div>{game.combo === best && game.combo > 0 && <div className="new-best">🏆 {t.newBest}</div>}<p className="result-detail">{t.moves}: {game.moves}</p><button type="button" className="start-btn" onClick={start}>{t.restart}</button><button type="button" className="menu-btn" onClick={() => setScreen("menu")}>{t.menu}</button></main>;

  if (!game) return null;
  const target = targetSounds(game.field, lang).join(" / ");
  return <main className="battle infinite-battle"><header className="game-header"><div className="timer-wrap"><span>{t.time}</span><strong className={game.secondsLeft <= 10 ? "urgent" : ""}>{game.secondsLeft}</strong></div><div className="combo-wrap"><span>COMBO</span><strong key={game.combo}>{game.combo}</strong></div><button type="button" className="restart-small" onClick={start}>{t.restart}</button></header><section className="arena infinite-arena"><div className="flash">{flash}</div><div className="field-card infinite-field"><div className="field-label">{t.current}</div><div className="emoji-big">{game.field.emoji}</div><div className="reading">{displayName(game.field, lang)}</div></div><div className="target-box"><span>{t.next}</span><strong>「{target || "—"}」</strong></div></section><section className="player-area infinite-player"><div className="choice-title"><span>{t.choice}</span><strong>{playableCards.length}</strong></div><div className="choices">{playableCards.length ? playableCards.map((card) => <button key={card.emoji} type="button" className="choice-card" onClick={() => play(card)}><span className="emoji">{card.emoji}</span><span className="reading">{displayName(card, lang)}</span></button>) : <div className="no-choice">{t.noChoice}</div>}</div><details className="hand-drawer"><summary>{t.hand} <span>{game.hand.length}</span></summary><div className="hand">{game.hand.map((card) => { const canPlay = playable.has(card.emoji); return <button key={card.emoji} type="button" className={`hand-card ${canPlay ? "playable" : "disabled"}`} disabled={!canPlay} onClick={() => play(card)}><span className="emoji">{card.emoji}</span><span className="reading">{displayName(card, lang)}</span></button>; })}</div></details></section></main>;
}

const TEXT = {
  ja: { subtitle: "60秒で、コンボをどこまで伸ばせる？", start: "スタート", restart: "しきりなおす", menu: "メニュー", rule: "場の最後の音につながる絵文字をタップ。成功するたび +1 COMBO。時間切れか、出せなくなったら終了。", best: "自己ベスト", easy: "EASY", normal: "NORMAL", hard: "HARD", gameOver: "終了！", newBest: "自己ベスト更新！", moves: "手数", time: "TIME", current: "いまの絵文字", next: "次は", hand: "HAND", choice: "次の一手", noChoice: "もう出せる絵文字がない" },
  en: { subtitle: "How high can you push your combo in 60 seconds?", start: "START", restart: "RESTART", menu: "MENU", rule: "Tap an emoji that starts with the field's last sound. +1 COMBO for every success. Time out or get stuck to finish.", best: "BEST", easy: "EASY", normal: "NORMAL", hard: "HARD", gameOver: "GAME OVER", newBest: "NEW BEST!", moves: "Moves", time: "TIME", current: "CURRENT", next: "NEXT", hand: "HAND", choice: "NEXT MOVE", noChoice: "No playable emoji" },
};
