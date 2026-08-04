import emoji
import gleam/list
import gleeunit

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn find_apple_test() {
  let assert Ok(apple) = emoji.find("apple")
  assert apple.emoji == "🍎"
}

pub fn candidate_chain_test() {
  let assert Ok(apple) = emoji.find("apple")
  let used = ["🍎"]
  let cs = emoji.candidates_for(apple, used)
  let assert True = cs != []
}

pub fn any_candidate_test() {
  let assert Ok(apple) = emoji.find("apple")
  let assert Ok(_) = emoji.any_candidate(apple, [])
}
