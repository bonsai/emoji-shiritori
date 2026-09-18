export interface Emoji {
  emoji: string;
  name: string;
  jaName: string;
  /** Alternative Japanese readings accepted for shiritori. */
  readings?: string[];
  category: string;
  tags: string[];
}

export type Lang = "en" | "ja";

import emojiData from "../data/emojis.json";
import wordData from "../data/words.json";
import emojiMap from "../data/emoji-map.json";

export const ALL_EMOJIS: Emoji[] = emojiData as Emoji[];
const WORDS = (wordData as { nodes: Array<{ id: string; readings: string[] }> }).nodes;
const EMOJI_WORDS = emojiMap as Array<{ emoji: string; wordIds: string[] }>;

export function readings(e: Emoji, lang: Lang): string[] {
  if (lang !== "ja") return [e.name];
  const ids = EMOJI_WORDS.find((x) => x.emoji === e.emoji)?.wordIds ?? [];
  const fromGraph = ids.flatMap((id) => WORDS.find((w) => w.id === id)?.readings ?? []);
  return [...new Set([e.jaName, ...(e.readings ?? []), ...fromGraph])];
}

export function displayName(e: Emoji, lang: Lang): string {
  return lang === "ja" ? e.jaName : e.name;
}

/** Normalize readings before comparing shiritori characters. */
export function normalizeReading(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0x60)
    )
    .replace(/[\s・、。]/g, "");
}

export function lastChar(s: string): string {
  const arr = Array.from(normalizeReading(s));
  return arr[arr.length - 1] ?? "";
}

export function firstChar(s: string): string {
  return Array.from(normalizeReading(s))[0] ?? "";
}

export function canPlace(card: Emoji, target: Emoji, lang: Lang): boolean {
  const cardReading = displayName(card, lang);
  const targetReading = displayName(target, lang);
  return firstChar(cardReading) === lastChar(targetReading);
}

export function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function validateEmojiData(data: Emoji[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const [index, item] of data.entries()) {
    if (!item.emoji || !item.name || !item.jaName || !item.category) {
      errors.push(`item ${index}: missing required field`);
    }
    if (seen.has(item.emoji)) {
      errors.push(`item ${index}: duplicate emoji ${item.emoji}`);
    }
    seen.add(item.emoji);
    if (!Array.isArray(item.tags)) {
      errors.push(`item ${index}: tags must be an array`);
    }
  }
  return errors;
}
