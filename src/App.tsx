import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ALL_EMOJIS, canPlace, displayName, firstChar, lastChar, shuffle, type Emoji, type Lang } from "./emojis";
import "./App.css";

const HAND_SIZE = 7;
const ROUND_SECONDS = 60;
const BEST_KEY = "emoji-shiritori.best-combo";
type Screen = "menu" | "game" | "result";
interface GameState { deck: Emoji[]; hand: Emoji[]; field: Emoji; combo: number; secondsLeft: number; moves: number; }

function drawCards(deck: Emoji[], count: number, used: Set<string>) {
  let source = [...deck]; const drawn: Emoji[] = [];
  while (drawn.length < count) {
    if (source.length === 0) { source = shuffle(ALL_EMOJIS.filter((e) => !used.has(e.emoji))); if (source.length === 0) source = shuffle(ALL_EMOJIS); }
    const card = source.pop(); if (!card) break; drawn.push(card); used.add(card.emoji);
  }
  return { deck: source, drawn };
}
function newGame(): GameState {
  const pool = shuffle(ALL_EMOJIS); const field = pool.pop()!; const hand = pool.splice(0, HAND_SIZE);
  return { deck: pool, hand, field, combo: 0, secondsLeft: ROUND_SECONDS, moves: 0 };
}

export default function App() {
  const [lang, setLang] = useState<Lang>("ja");
  const [screen, setScreen] = useState<Screen>("menu");
  const [game, setGame] = useState<GameState | null>(null);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const gameRef = useRef<GameState | null>(null);

  useEffect(() => { const stored = Number(window.localStorage.getItem(BEST_KEY) ?? 0); if (Number.isFinite(stored)) setBest(stored); }, []);
  useEffect(() => { gameRef.current = game; }, [game]);

  const start = useCallback(() => { const next = newGame(); gameRef.current = next; setGame(next); setFlash(null); setScreen("game"); }, []);
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

  const playable = useMemo(() => game ? new Set(game.hand.filter((card) => canPlace(card, game.field, lang)).map((card) => card.emoji)) : new Set<string>(), [game, lang]);

  const play = useCallback((card: Emoji) => {
    const current = gameRef.current;
    if (!current || screen !== "game" || !canPlace(card, current.field, lang)) return;
    const index = current.hand.findIndex((item) => item.emoji === card.emoji); if (index < 0) return;
    const hand = [...current.hand.slice(0, index), ...current.hand.slice(index + 1)];
    const used = new Set([current.field.emoji, ...hand.map((item) => item.emoji)]);
    const refill = drawCards(current.deck, 1, used);
    const next: GameState = { ...current, deck: refill.deck, hand: [...hand, ...refill.drawn], field: card, combo: current.combo + 1, moves: current.moves + 1 };
    gameRef.current = next; setGame(next); setFlash(`+1  COMBO ${next.combo}`); window.setTimeout(() => setFlash(null), 420);
    if (!next.hand.some((item) => canPlace(item, next.field, lang))) finish(next);
  }, [finish, lang, screen]);

  const t = TEXT[lang];
  if (screen === "menu") return <main className="menu infinite-menu"><div className="eyebrow">EMOJI SHIRITORI</div><h1>∞ SINGLE</h1><p className="subtitle">{t.subtitle}</p><div className="best-card"><span>{t.best}</span><strong>{best}</strong><small>COMBO</small></div><div className="lang-select"><button type="button" className={lang === "ja" ? "active" : ""} onClick={() => setLang("ja")}>日本語</button><button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>English</button></div><button type="button" className="start-btn infinite-start" onClick={start}>{t.start}</button><p className="rule">{t.rule}</p></main>;

  if (screen === "result" && game) return <main className="result infinite-result"><div className="eyebrow">TIME UP / GAME OVER</div><h1>{t.gameOver}</h1><div className="result-combo"><span>COMBO</span><strong>{game.combo}</strong></div>{game.combo === best && game.combo > 0 && <div className="new-best">🏆 {t.newBest}</div>}<p className="result-detail">{t.moves}: {game.moves}</p><button type="button" className="start-btn" onClick={start}>{t.restart}</button><button type="button" className="menu-btn" onClick={() => setScreen("menu")}>{t.menu}</button></main>;

  if (!game) return null;
  const target = lastChar(displayName(game.field, lang));
  return <main className="battle infinite-battle"><header className="game-header"><div className="timer-wrap"><span>{t.time}</span><strong className={game.secondsLeft <= 10 ? "urgent" : ""}>{game.secondsLeft}</strong></div><div className="combo-wrap"><span>COMBO</span><strong key={game.combo}>{game.combo}</strong></div><button type="button" className="restart-small" onClick={start}>{t.restart}</button></header><section className="arena infinite-arena"><div className="flash">{flash}</div><div className="field-card infinite-field"><div className="field-label">{t.current}</div><div className="emoji-big">{game.field.emoji}</div><div className="reading">{displayName(game.field, lang)}</div></div><div className="target-box"><span>{t.next}</span><strong>「{target || "—"}」</strong></div></section><section className="player-area infinite-player"><div className="hand-title"><span>{t.hand}</span><span>{game.hand.length}</span></div><div className="hand">{game.hand.map((card) => { const canPlay = playable.has(card.emoji); return <button key={card.emoji} type="button" className={`hand-card ${canPlay ? "playable" : "disabled"}`} disabled={!canPlay} onClick={() => play(card)}><span className="emoji">{card.emoji}</span><span className="reading">{displayName(card, lang)}</span>{canPlay && <span className="first-char">{firstChar(displayName(card, lang))}</span>}</button>; })}</div></section></main>;
}

const TEXT = {
  ja: { subtitle: "60秒で、コンボをどこまで伸ばせる？", start: "スタート", restart: "しきりなおす", menu: "メニュー", rule: "場の最後の音につながる絵文字をタップ。成功するたび +1 COMBO。時間切れか、出せなくなったら終了。", best: "自己ベスト", gameOver: "終了！", newBest: "自己ベスト更新！", moves: "手数", time: "TIME", current: "いまの絵文字", next: "次は", hand: "HAND" },
  en: { subtitle: "How high can you push your combo in 60 seconds?", start: "START", restart: "RESTART", menu: "MENU", rule: "Tap an emoji that starts with the field's last sound. +1 COMBO for every success. Time out or get stuck to finish.", best: "BEST", gameOver: "GAME OVER", newBest: "NEW BEST!", moves: "Moves", time: "TIME", current: "CURRENT", next: "NEXT", hand: "HAND" },
};
