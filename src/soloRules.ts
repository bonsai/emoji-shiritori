import { canPlace, shuffle, type Emoji, type Lang } from "./emojis";

/** Return cards that can legally follow the current field. */
export function playableCards(
  hand: Emoji[],
  field: Emoji,
  lang: Lang,
): Emoji[] {
  return hand.filter((card) => canPlace(card, field, lang));
}

/**
 * Refill a solo hand without duplicating cards that are currently in play.
 * When the finite deck is exhausted, a fresh shuffled pool is created.
 */
export function refillSoloHand(
  hand: Emoji[],
  fields: Emoji[],
  deck: Emoji[],
  handSize: number,
  allEmojis: Emoji[],
): { hand: Emoji[]; deck: Emoji[] } {
  const need = Math.max(0, handSize - hand.length);
  if (need === 0) return { hand, deck };

  const used = new Set(
    [...hand, ...fields].map((emoji) => emoji.emoji),
  );
  let nextDeck = [...deck];
  const drawn: Emoji[] = [];

  for (let i = 0; i < need; i++) {
    if (nextDeck.length === 0) {
      const fresh = shuffle(allEmojis.filter((e) => !used.has(e.emoji)));
      nextDeck = fresh.length > 0 ? fresh : shuffle(allEmojis);
    }

    const card = nextDeck.pop();
    if (!card) break;
    used.add(card.emoji);
    drawn.push(card);
  }

  return {
    hand: [...hand, ...drawn],
    deck: nextDeck,
  };
}
