export interface Emoji {
  emoji: string;
  name: string;
  jaName: string;
  category: string;
  tags: string[];
}

export type Lang = "en" | "ja";

export const ALL_EMOJIS: Emoji[] = [
  { emoji: "🍎", name: "apple", jaName: "りんご", category: "fruit", tags: ["a", "red", "sweet"] },
  { emoji: "🥑", name: "avocado", jaName: "アボカド", category: "fruit", tags: ["a", "green", "healthy"] },
  { emoji: "🍌", name: "banana", jaName: "バナナ", category: "fruit", tags: ["b", "yellow", "sweet"] },
  { emoji: "🫐", name: "blueberry", jaName: "ブルーベリー", category: "fruit", tags: ["b", "blue", "berry"] },
  { emoji: "🍇", name: "grape", jaName: "ぶどう", category: "fruit", tags: ["g", "purple", "sweet"] },
  { emoji: "🍊", name: "orange", jaName: "みかん", category: "fruit", tags: ["o", "orange", "citrus"] },
  { emoji: "🍓", name: "strawberry", jaName: "いちご", category: "fruit", tags: ["s", "red", "berry"] },
  { emoji: "🥦", name: "broccoli", jaName: "ブロッコリー", category: "vegetable", tags: ["b", "green", "healthy"] },
  { emoji: "🥕", name: "carrot", jaName: "にんじん", category: "vegetable", tags: ["c", "orange", "healthy"] },
  { emoji: "🌽", name: "corn", jaName: "とうもろこし", category: "vegetable", tags: ["c", "yellow", "grain"] },
  { emoji: "🍆", name: "eggplant", jaName: "なす", category: "vegetable", tags: ["e", "purple", "healthy"] },
  { emoji: "🍅", name: "tomato", jaName: "トマト", category: "vegetable", tags: ["t", "red", "healthy"] },
  { emoji: "🍄", name: "mushroom", jaName: "きのこ", category: "vegetable", tags: ["m", "brown", "fungi"] },
  { emoji: "🥬", name: "lettuce", jaName: "レタス", category: "vegetable", tags: ["l", "green", "healthy"] },
  { emoji: "🧅", name: "onion", jaName: "たまねぎ", category: "vegetable", tags: ["o", "white", "spicy"] },
  { emoji: "🥔", name: "potato", jaName: "じゃがいも", category: "vegetable", tags: ["p", "brown", "starch"] },
  { emoji: "🐶", name: "dog", jaName: "いぬ", category: "animal", tags: ["d", "pet", "mammal"] },
  { emoji: "🐱", name: "cat", jaName: "ねこ", category: "animal", tags: ["c", "pet", "mammal"] },
  { emoji: "🐭", name: "mouse", jaName: "ねずみ", category: "animal", tags: ["m", "small", "mammal"] },
  { emoji: "🐰", name: "rabbit", jaName: "うさぎ", category: "animal", tags: ["r", "pet", "mammal"] },
  { emoji: "🦊", name: "fox", jaName: "きつね", category: "animal", tags: ["f", "wild", "mammal"] },
  { emoji: "🐻", name: "bear", jaName: "くま", category: "animal", tags: ["b", "wild", "mammal"] },
  { emoji: "🐼", name: "panda", jaName: "パンダ", category: "animal", tags: ["p", "wild", "mammal"] },
  { emoji: "🐨", name: "koala", jaName: "コアラ", category: "animal", tags: ["k", "wild", "mammal"] },
  { emoji: "🦁", name: "lion", jaName: "らいおん", category: "animal", tags: ["l", "wild", "mammal"] },
  { emoji: "🐯", name: "tiger", jaName: "とら", category: "animal", tags: ["t", "wild", "mammal"] },
  { emoji: "🐷", name: "pig", jaName: "ぶた", category: "animal", tags: ["p", "farm", "mammal"] },
  { emoji: "🐮", name: "cow", jaName: "うし", category: "animal", tags: ["c", "farm", "mammal"] },
  { emoji: "🐔", name: "chicken", jaName: "にわとり", category: "animal", tags: ["c", "farm", "bird"] },
  { emoji: "🐧", name: "penguin", jaName: "ペンギン", category: "animal", tags: ["p", "bird", "cold"] },
  { emoji: "🐦", name: "bird", jaName: "とり", category: "animal", tags: ["b", "bird", "sky"] },
  { emoji: "🐘", name: "elephant", jaName: "ぞう", category: "animal", tags: ["e", "wild", "mammal"] },
  { emoji: "🦅", name: "eagle", jaName: "わし", category: "animal", tags: ["e", "bird", "sky"] },
  { emoji: "🐴", name: "horse", jaName: "うま", category: "animal", tags: ["h", "farm", "mammal"] },
  { emoji: "🐑", name: "sheep", jaName: "ひつじ", category: "animal", tags: ["s", "farm", "mammal"] },
  { emoji: "🐍", name: "snake", jaName: "へび", category: "animal", tags: ["s", "wild", "reptile"] },
  { emoji: "🐳", name: "whale", jaName: "くじら", category: "animal", tags: ["w", "sea", "mammal"] },
  { emoji: "🦓", name: "zebra", jaName: "しまうま", category: "animal", tags: ["z", "wild", "mammal"] },
  { emoji: "🦆", name: "duck", jaName: "あひる", category: "animal", tags: ["d", "bird", "water"] },
  { emoji: "🦒", name: "giraffe", jaName: "きりん", category: "animal", tags: ["g", "wild", "mammal"] },
  { emoji: "🐸", name: "frog", jaName: "かえる", category: "animal", tags: ["f", "water", "amphibian"] },
  { emoji: "🦋", name: "butterfly", jaName: "ちょうちょ", category: "insect", tags: ["b", "wing", "flower"] },
  { emoji: "🐝", name: "bee", jaName: "みつばち", category: "insect", tags: ["b", "honey", "flower"] },
  { emoji: "🐞", name: "ladybug", jaName: "てんとうむし", category: "insect", tags: ["l", "red", "spot"] },
  { emoji: "🐜", name: "ant", jaName: "あり", category: "insect", tags: ["a", "small", "ground"] },
  { emoji: "🌸", name: "cherry blossom", jaName: "さくら", category: "plant", tags: ["c", "pink", "flower"] },
  { emoji: "🌻", name: "sunflower", jaName: "ひまわり", category: "plant", tags: ["s", "yellow", "flower"] },
  { emoji: "🌵", name: "cactus", jaName: "サボテン", category: "plant", tags: ["c", "green", "desert"] },
  { emoji: "🌳", name: "tree", jaName: "き", category: "plant", tags: ["t", "green", "nature"] },
  { emoji: "🍁", name: "maple leaf", jaName: "もみじ", category: "plant", tags: ["m", "red", "autumn"] },
  { emoji: "🌹", name: "rose", jaName: "ばら", category: "plant", tags: ["r", "red", "flower"] },
  { emoji: "🌊", name: "wave", jaName: "なみ", category: "nature", tags: ["w", "blue", "water"] },
  { emoji: "🔥", name: "fire", jaName: "ひ", category: "nature", tags: ["f", "red", "hot"] },
  { emoji: "🌍", name: "earth", jaName: "ちきゅう", category: "nature", tags: ["e", "planet", "blue"] },
  { emoji: "🌋", name: "volcano", jaName: "かざん", category: "nature", tags: ["v", "mountain", "hot"] },
  { emoji: "🌈", name: "rainbow", jaName: "にじ", category: "nature", tags: ["r", "color", "weather"] },
  { emoji: "⭐", name: "star", jaName: "ほし", category: "sky", tags: ["s", "yellow", "night"] },
  { emoji: "🌙", name: "moon", jaName: "つき", category: "sky", tags: ["m", "yellow", "night"] },
  { emoji: "☀️", name: "sun", jaName: "たいよう", category: "sky", tags: ["s", "yellow", "day"] },
  { emoji: "☁️", name: "cloud", jaName: "くも", category: "sky", tags: ["c", "white", "weather"] },
  { emoji: "⚡", name: "lightning", jaName: "かみなり", category: "sky", tags: ["l", "yellow", "weather"] },
  { emoji: "❄️", name: "snowflake", jaName: "ゆき", category: "sky", tags: ["s", "white", "cold"] },
  { emoji: "🏠", name: "house", jaName: "いえ", category: "place", tags: ["h", "building", "home"] },
  { emoji: "🏫", name: "school", jaName: "がっこう", category: "place", tags: ["s", "building", "education"] },
  { emoji: "🏥", name: "hospital", jaName: "びょういん", category: "place", tags: ["h", "building", "health"] },
  { emoji: "🏦", name: "bank", jaName: "ぎんこう", category: "place", tags: ["b", "building", "money"] },
  { emoji: "🏪", name: "convenience store", jaName: "コンビニ", category: "place", tags: ["c", "building", "shop"] },
  { emoji: "🏰", name: "castle", jaName: "おしろ", category: "place", tags: ["c", "building", "history"] },
  { emoji: "🏝️", name: "island", jaName: "しま", category: "place", tags: ["i", "beach", "nature"] },
  { emoji: "🏯", name: "japanese castle", jaName: "おしろ", category: "place", tags: ["j", "building", "history"] },
  { emoji: "🚗", name: "car", jaName: "くるま", category: "vehicle", tags: ["c", "road", "transport"] },
  { emoji: "🚌", name: "bus", jaName: "バス", category: "vehicle", tags: ["b", "road", "transport"] },
  { emoji: "🚲", name: "bicycle", jaName: "じてんしゃ", category: "vehicle", tags: ["b", "road", "transport"] },
  { emoji: "✈️", name: "airplane", jaName: "ひこうき", category: "vehicle", tags: ["a", "sky", "transport"] },
  { emoji: "🚀", name: "rocket", jaName: "ロケット", category: "vehicle", tags: ["r", "sky", "space"] },
  { emoji: "🚢", name: "ship", jaName: "ふね", category: "vehicle", tags: ["s", "sea", "transport"] },
  { emoji: "🚂", name: "train", jaName: "でんしゃ", category: "vehicle", tags: ["t", "rail", "transport"] },
  { emoji: "🚕", name: "taxi", jaName: "タクシー", category: "vehicle", tags: ["t", "road", "transport"] },
  { emoji: "🚁", name: "helicopter", jaName: "ヘリコプター", category: "vehicle", tags: ["h", "sky", "transport"] },
  { emoji: "🛥️", name: "yacht", jaName: "ヨット", category: "vehicle", tags: ["y", "sea", "transport"] },
  { emoji: "🛵", name: "scooter", jaName: "スクーター", category: "vehicle", tags: ["s", "road", "transport"] },
  { emoji: "🎸", name: "guitar", jaName: "ギター", category: "music", tags: ["g", "sound", "instrument"] },
  { emoji: "🎹", name: "piano", jaName: "ピアノ", category: "music", tags: ["p", "sound", "instrument"] },
  { emoji: "🥁", name: "drum", jaName: "ドラム", category: "music", tags: ["d", "sound", "instrument"] },
  { emoji: "🎵", name: "musical note", jaName: "おんぷ", category: "music", tags: ["m", "sound", "song"] },
  { emoji: "🎺", name: "trumpet", jaName: "トランペット", category: "music", tags: ["t", "sound", "instrument"] },
  { emoji: "🎨", name: "palette", jaName: "パレット", category: "art", tags: ["p", "color", "paint"] },
  { emoji: "🎭", name: "performing arts", jaName: "えんげき", category: "art", tags: ["p", "theater", "mask"] },
  { emoji: "📚", name: "books", jaName: "ほん", category: "object", tags: ["b", "read", "education"] },
  { emoji: "💻", name: "laptop", jaName: "パソコン", category: "object", tags: ["l", "tech", "work"] },
  { emoji: "📱", name: "mobile phone", jaName: "スマホ", category: "object", tags: ["m", "tech", "communication"] },
  { emoji: "⌚", name: "watch", jaName: "うでどけい", category: "object", tags: ["w", "tech", "time"] },
  { emoji: "🔑", name: "key", jaName: "かぎ", category: "object", tags: ["k", "metal", "lock"] },
  { emoji: "💡", name: "light bulb", jaName: "でんきゅう", category: "object", tags: ["l", "light", "idea"] },
  { emoji: "🎁", name: "gift", jaName: "プレゼント", category: "object", tags: ["g", "box", "surprise"] },
  { emoji: "☂️", name: "umbrella", jaName: "かさ", category: "object", tags: ["u", "rain", "weather"] },
  { emoji: "✉️", name: "envelope", jaName: "てがみ", category: "object", tags: ["e", "mail", "paper"] },
  { emoji: "✂️", name: "scissors", jaName: "はさみ", category: "object", tags: ["s", "tool", "cut"] },
  { emoji: "🧲", name: "magnet", jaName: "じしゃく", category: "object", tags: ["m", "metal", "attract"] },
  { emoji: "⚽", name: "soccer", jaName: "サッカー", category: "sport", tags: ["s", "ball", "game"] },
  { emoji: "🏀", name: "basketball", jaName: "バスケ", category: "sport", tags: ["b", "ball", "game"] },
  { emoji: "🎾", name: "tennis", jaName: "テニス", category: "sport", tags: ["t", "ball", "game"] },
  { emoji: "🎮", name: "video game", jaName: "ゲーム", category: "sport", tags: ["v", "controller", "game"] },
  { emoji: "🎣", name: "fishing", jaName: "つり", category: "sport", tags: ["f", "outdoor", "hobby"] },
  { emoji: "🥊", name: "boxing", jaName: "ボクシング", category: "sport", tags: ["b", "fight", "game"] },
  { emoji: "🍣", name: "sushi", jaName: "すし", category: "food", tags: ["s", "japan", "fish"] },
  { emoji: "🍜", name: "ramen", jaName: "ラーメン", category: "food", tags: ["r", "japan", "noodle"] },
  { emoji: "🍕", name: "pizza", jaName: "ピザ", category: "food", tags: ["p", "italy", "cheese"] },
  { emoji: "🍔", name: "hamburger", jaName: "ハンバーガー", category: "food", tags: ["h", "america", "meat"] },
  { emoji: "🍰", name: "cake", jaName: "ケーキ", category: "food", tags: ["c", "sweet", "dessert"] },
  { emoji: "🍦", name: "ice cream", jaName: "アイス", category: "food", tags: ["i", "cold", "dessert"] },
  { emoji: "🍫", name: "chocolate", jaName: "チョコ", category: "food", tags: ["c", "sweet", "dessert"] },
  { emoji: "🥚", name: "egg", jaName: "たまご", category: "food", tags: ["e", "protein", "breakfast"] },
  { emoji: "🍞", name: "bread", jaName: "パン", category: "food", tags: ["b", "wheat", "breakfast"] },
  { emoji: "🥐", name: "croissant", jaName: "クロワッサン", category: "food", tags: ["c", "france", "breakfast"] },
  { emoji: "🍪", name: "cookie", jaName: "クッキー", category: "food", tags: ["c", "sweet", "snack"] },
  { emoji: "☕", name: "coffee", jaName: "コーヒー", category: "drink", tags: ["c", "hot", "brown"] },
  { emoji: "🍵", name: "tea", jaName: "おちゃ", category: "drink", tags: ["t", "hot", "green"] },
  { emoji: "🥤", name: "soft drink", jaName: "ジュース", category: "drink", tags: ["s", "cold", "sweet"] },
  { emoji: "🍺", name: "beer", jaName: "ビール", category: "drink", tags: ["b", "alcohol", "cold"] },
  { emoji: "🍷", name: "wine", jaName: "ワイン", category: "drink", tags: ["w", "alcohol", "red"] },
  { emoji: "🧃", name: "juice", jaName: "ジュース", category: "drink", tags: ["j", "cold", "fruit"] },
  { emoji: "👁️", name: "eye", jaName: "め", category: "body", tags: ["e", "face", "sight"] },
  { emoji: "👂", name: "ear", jaName: "みみ", category: "body", tags: ["e", "face", "hearing"] },
  { emoji: "👃", name: "nose", jaName: "はな", category: "body", tags: ["n", "face", "smell"] },
  { emoji: "👄", name: "mouth", jaName: "くち", category: "body", tags: ["m", "face", "speak"] },
  { emoji: "🦷", name: "tooth", jaName: "は", category: "body", tags: ["t", "face", "health"] },
  { emoji: "🫀", name: "heart", jaName: "しんぞう", category: "body", tags: ["h", "organ", "life"] },
];

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
