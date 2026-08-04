import gleam/list
import gleam/string

pub type Emoji {
  Emoji(emoji: String, name: String, category: String, tags: List(String))
}

pub const all: List(Emoji) = [
  Emoji("🍎", "apple", "fruit", ["a", "red", "sweet"]),
  Emoji("🥑", "avocado", "fruit", ["a", "green", "healthy"]),
  Emoji("🍌", "banana", "fruit", ["b", "yellow", "sweet"]),
  Emoji("🍇", "grape", "fruit", ["g", "purple", "sweet"]),
  Emoji("🍊", "orange", "fruit", ["o", "orange", "citrus"]),
  Emoji("🍓", "strawberry", "fruit", ["s", "red", "berry"]),
  Emoji("🥦", "broccoli", "vegetable", ["b", "green", "healthy"]),
  Emoji("🥕", "carrot", "vegetable", ["c", "orange", "healthy"]),
  Emoji("🌽", "corn", "vegetable", ["c", "yellow", "grain"]),
  Emoji("🍆", "eggplant", "vegetable", ["e", "purple", "healthy"]),
  Emoji("🍅", "tomato", "vegetable", ["t", "red", "healthy"]),
  Emoji("🍄", "mushroom", "vegetable", ["m", "brown", "fungi"]),
  Emoji("🥬", "lettuce", "vegetable", ["l", "green", "healthy"]),
  Emoji("🧅", "onion", "vegetable", ["o", "white", "spicy"]),
  Emoji("🐶", "dog", "animal", ["d", "pet", "mammal"]),
  Emoji("🐱", "cat", "animal", ["c", "pet", "mammal"]),
  Emoji("🐭", "mouse", "animal", ["m", "small", "mammal"]),
  Emoji("🐰", "rabbit", "animal", ["r", "pet", "mammal"]),
  Emoji("🦊", "fox", "animal", ["f", "wild", "mammal"]),
  Emoji("🐻", "bear", "animal", ["b", "wild", "mammal"]),
  Emoji("🐼", "panda", "animal", ["p", "wild", "mammal"]),
  Emoji("🐨", "koala", "animal", ["k", "wild", "mammal"]),
  Emoji("🦁", "lion", "animal", ["l", "wild", "mammal"]),
  Emoji("🐯", "tiger", "animal", ["t", "wild", "mammal"]),
  Emoji("🐷", "pig", "animal", ["p", "farm", "mammal"]),
  Emoji("🐮", "cow", "animal", ["c", "farm", "mammal"]),
  Emoji("🐔", "chicken", "animal", ["c", "farm", "bird"]),
  Emoji("🐧", "penguin", "animal", ["p", "bird", "cold"]),
  Emoji("🐦", "bird", "animal", ["b", "bird", "sky"]),
  Emoji("🐘", "elephant", "animal", ["e", "wild", "mammal"]),
  Emoji("🦅", "eagle", "animal", ["e", "bird", "sky"]),
  Emoji("🐴", "horse", "animal", ["h", "farm", "mammal"]),
  Emoji("🐑", "sheep", "animal", ["s", "farm", "mammal"]),
  Emoji("🐍", "snake", "animal", ["s", "wild", "reptile"]),
  Emoji("🐳", "whale", "animal", ["w", "sea", "mammal"]),
  Emoji("🦓", "zebra", "animal", ["z", "wild", "mammal"]),
  Emoji("🦆", "duck", "animal", ["d", "bird", "water"]),
  Emoji("🦋", "butterfly", "insect", ["b", "wing", "flower"]),
  Emoji("🐝", "bee", "insect", ["b", "honey", "flower"]),
  Emoji("🐞", "ladybug", "insect", ["l", "red", "spot"]),
  Emoji("🌸", "cherry blossom", "plant", ["c", "pink", "flower"]),
  Emoji("🌻", "sunflower", "plant", ["s", "yellow", "flower"]),
  Emoji("🌵", "cactus", "plant", ["c", "green", "desert"]),
  Emoji("🌳", "tree", "plant", ["t", "green", "nature"]),
  Emoji("🍁", "maple leaf", "plant", ["m", "red", "autumn"]),
  Emoji("🌊", "wave", "nature", ["w", "blue", "water"]),
  Emoji("🔥", "fire", "nature", ["f", "red", "hot"]),
  Emoji("🌍", "earth", "nature", ["e", "planet", "blue"]),
  Emoji("🌋", "volcano", "nature", ["v", "mountain", "hot"]),
  Emoji("⭐", "star", "sky", ["s", "yellow", "night"]),
  Emoji("🌙", "moon", "sky", ["m", "yellow", "night"]),
  Emoji("☀️", "sun", "sky", ["s", "yellow", "day"]),
  Emoji("☁️", "cloud", "sky", ["c", "white", "weather"]),
  Emoji("🌈", "rainbow", "sky", ["r", "color", "weather"]),
  Emoji("⚡", "lightning", "sky", ["l", "yellow", "weather"]),
  Emoji("❄️", "snowflake", "sky", ["s", "white", "cold"]),
  Emoji("🏠", "house", "place", ["h", "building", "home"]),
  Emoji("🏫", "school", "place", ["s", "building", "education"]),
  Emoji("🏥", "hospital", "place", ["h", "building", "health"]),
  Emoji("🏦", "bank", "place", ["b", "building", "money"]),
  Emoji("🏪", "convenience store", "place", ["c", "building", "shop"]),
  Emoji("🏰", "castle", "place", ["c", "building", "history"]),
  Emoji("🏝️", "island", "place", ["i", "beach", "nature"]),
  Emoji("🚗", "car", "vehicle", ["c", "road", "transport"]),
  Emoji("🚌", "bus", "vehicle", ["b", "road", "transport"]),
  Emoji("🚲", "bicycle", "vehicle", ["b", "road", "transport"]),
  Emoji("✈️", "airplane", "vehicle", ["a", "sky", "transport"]),
  Emoji("🚀", "rocket", "vehicle", ["r", "sky", "space"]),
  Emoji("🚢", "ship", "vehicle", ["s", "sea", "transport"]),
  Emoji("🚂", "train", "vehicle", ["t", "rail", "transport"]),
  Emoji("🚕", "taxi", "vehicle", ["t", "road", "transport"]),
  Emoji("🚁", "helicopter", "vehicle", ["h", "sky", "transport"]),
  Emoji("🛥️", "yacht", "vehicle", ["y", "sea", "transport"]),
  Emoji("🎸", "guitar", "music", ["g", "sound", "instrument"]),
  Emoji("🎹", "piano", "music", ["p", "sound", "instrument"]),
  Emoji("🥁", "drum", "music", ["d", "sound", "instrument"]),
  Emoji("🎵", "musical note", "music", ["m", "sound", "song"]),
  Emoji("🎨", "palette", "art", ["p", "color", "paint"]),
  Emoji("🎭", "performing arts", "art", ["p", "theater", "mask"]),
  Emoji("📚", "books", "object", ["b", "read", "education"]),
  Emoji("💻", "laptop", "object", ["l", "tech", "work"]),
  Emoji("📱", "mobile phone", "object", ["m", "tech", "communication"]),
  Emoji("⌚", "watch", "object", ["w", "tech", "time"]),
  Emoji("🔑", "key", "object", ["k", "metal", "lock"]),
  Emoji("💡", "light bulb", "object", ["l", "light", "idea"]),
  Emoji("🎁", "gift", "object", ["g", "box", "surprise"]),
  Emoji("☂️", "umbrella", "object", ["u", "rain", "weather"]),
  Emoji("✉️", "envelope", "object", ["e", "mail", "paper"]),
  Emoji("✂️", "scissors", "object", ["s", "tool", "cut"]),
  Emoji("⚽", "soccer", "sport", ["s", "ball", "game"]),
  Emoji("🏀", "basketball", "sport", ["b", "ball", "game"]),
  Emoji("🎾", "tennis", "sport", ["t", "ball", "game"]),
  Emoji("🎮", "video game", "sport", ["v", "controller", "game"]),
  Emoji("🎣", "fishing", "sport", ["f", "outdoor", "hobby"]),
  Emoji("🍣", "sushi", "food", ["s", "japan", "fish"]),
  Emoji("🍜", "ramen", "food", ["r", "japan", "noodle"]),
  Emoji("🍕", "pizza", "food", ["p", "italy", "cheese"]),
  Emoji("🍔", "hamburger", "food", ["h", "america", "meat"]),
  Emoji("🍰", "cake", "food", ["c", "sweet", "dessert"]),
  Emoji("🍦", "ice cream", "food", ["i", "cold", "dessert"]),
  Emoji("🍫", "chocolate", "food", ["c", "sweet", "dessert"]),
  Emoji("🥚", "egg", "food", ["e", "protein", "breakfast"]),
  Emoji("🍞", "bread", "food", ["b", "wheat", "breakfast"]),
  Emoji("🥐", "croissant", "food", ["c", "france", "breakfast"]),
  Emoji("🍪", "cookie", "food", ["c", "sweet", "snack"]),
  Emoji("☕", "coffee", "drink", ["c", "hot", "brown"]),
  Emoji("🍵", "tea", "drink", ["t", "hot", "green"]),
  Emoji("🥤", "soft drink", "drink", ["s", "cold", "sweet"]),
  Emoji("🍺", "beer", "drink", ["b", "alcohol", "cold"]),
  Emoji("🍷", "wine", "drink", ["w", "alcohol", "red"]),
  Emoji("🧃", "juice", "drink", ["j", "cold", "fruit"]),
  Emoji("👁️", "eye", "body", ["e", "face", "sight"]),
  Emoji("👂", "ear", "body", ["e", "face", "hearing"]),
  Emoji("👃", "nose", "body", ["n", "face", "smell"]),
  Emoji("👄", "mouth", "body", ["m", "face", "speak"]),
  Emoji("🦷", "tooth", "body", ["t", "face", "health"]),
]

pub fn find(name: String) -> Result(Emoji, Nil) {
  list.find(all, fn(e) { string.lowercase(e.name) == string.lowercase(name) })
}

pub fn last_char(s: String) -> String {
  case string.pop_grapheme(string.reverse(s)) {
    Ok(#(c, _)) -> c
    Error(_) -> ""
  }
}

pub fn first_char(s: String) -> String {
  case string.pop_grapheme(s) {
    Ok(#(c, _)) -> c
    Error(_) -> ""
  }
}

pub fn candidates_for(emoji: Emoji, used: List(String)) -> List(Emoji) {
  let required = last_char(emoji.name)
  all
  |> list.filter(fn(e) {
    !list.contains(used, e.emoji) && first_char(e.name) == required
  })
}

pub fn any_candidate(prev: Emoji, used: List(String)) -> Result(Emoji, Nil) {
  case candidates_for(prev, used) {
    [] -> Error(Nil)
    cs ->
      Ok(
        list.shuffle(cs)
        |> list.first()
        |> fn(x) {
          let assert Ok(x) = x
          x
        },
      )
  }
}
