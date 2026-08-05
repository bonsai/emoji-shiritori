export interface Emoji {
  emoji: string;
  name: string;
  jaName: string;
  category: string;
  tags: string[];
}

export type Lang = "en" | "ja";

import emojiData from "../data/emojis.json";

export const ALL_EMOJIS: Emoji[] = emojiData as Emoji[];

export function displayName(e: Emoji, lang: Lang): string {
  return lang === "ja" ? e.jaName : e.name;
}

export function lastChar(s: string): string {
  const arr = Array.from(s);
  return arr[arr.length - 1] ?? "";
}

export function firstChar(s: string): string {
  return Array.from(s)[0] ?? "";
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
