import gleam/dict.{type Dict}
import gleam/int
import gleam/list
import gleam/string
import lustre
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

import emoji

pub type Model {
  Model(
    history: List(emoji.Emoji),
    used: List(String),
    input: String,
    message: String,
    game_over: Bool,
    scores: Dict(String, Int),
  )
}

pub type Msg {
  UserInput(String)
  Submit
  Choose(String)
  Reset
  CpuTurn
}

fn initial_model() -> Model {
  Model(
    history: [],
    used: [],
    input: "",
    message: "絵文字しりとり！ 絵文字の名前を入力するか、下から選んでね。",
    game_over: False,
    scores: dict.new(),
  )
}

pub fn main() {
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
}

fn init(_flags) -> Model {
  initial_model()
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    UserInput(value) -> Model(..model, input: value)

    Choose(name) -> play(model, name)

    Submit -> play(model, model.input)

    Reset -> initial_model()

    CpuTurn -> {
      case model.history {
        [] -> model
        [last, ..] -> {
          case emoji.any_candidate(last, model.used) {
            Ok(next) -> add_turn(model, next, "cpu")
            Error(_) -> end_game(model, "CPU が出せる絵文字がない！あなたの勝ち！")
          }
        }
      }
    }
  }
}

fn play(model: Model, raw_name: String) -> Model {
  let name = string.trim(raw_name) |> string.lowercase()
  case model.game_over {
    True -> model
    False -> {
      case emoji.find(name) {
        Error(_) -> Model(..model, message: "その絵emojiは見つからないよ: " <> raw_name)
        Ok(choice) -> {
          case list.contains(model.used, choice.emoji) {
            True -> Model(..model, message: "その絵emojiはもう使われたよ！")
            False -> {
              case model.history {
                [] -> add_turn(model, choice, "player")
                [last, ..] -> {
                  case emoji.first_char(choice.name) == emoji.last_char(last.name) {
                    True -> add_turn(model, choice, "player")
                    False ->
                      Model(
                        ..model,
                        message: "ルール違反！「" <> last.name <> "」の最後の文字「" <> emoji.last_char(last.name) <> "」から始まる名前を選んでね。",
                      )
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

fn add_turn(model: Model, choice: emoji.Emoji, who: String) -> Model {
  let new_history = [choice, ..model.history]
  let new_used = [choice.emoji, ..model.used]
  let new_scores = case dict.get(model.scores, who) {
    Ok(n) -> dict.insert(model.scores, who, n + 1)
    Error(_) -> dict.insert(model.scores, who, 1)
  }
  let msg = case who {
    "cpu" -> "CPU: " <> choice.emoji <> " " <> choice.name
    _ -> "あなた: " <> choice.emoji <> " " <> choice.name
  }
  let next_model = Model(
    ..model,
    history: new_history,
    used: new_used,
    input: "",
    message: msg,
    scores: new_scores,
  )
  case emoji.candidates_for(choice, new_used) {
    [] -> end_game(next_model, "もうつながる絵emojiがない！ゲームセット！")
    _ -> next_model
  }
}

fn end_game(model: Model, reason: String) -> Model {
  Model(..model, message: reason, game_over: True)
}

fn score_text(model: Model) -> String {
  let player = dict.get(model.scores, "player") |> unwrap(0)
  let cpu = dict.get(model.scores, "cpu") |> unwrap(0)
  "あなた " <> int.to_string(player) <> " - " <> int.to_string(cpu) <> " CPU"
}

fn unwrap(result, default) {
  case result {
    Ok(v) -> v
    Error(_) -> default
  }
}

fn view(model: Model) -> Element(Msg) {
  html.div([attribute.class("emoji-shiritori")], [
    html.h1([], [element.text("Emoji Shiritori")]),
    html.p([], [element.text(model.message)]),
    html.p([], [element.text(score_text(model))]),
    html.div([], [
      html.input([
        attribute.type_("text"),
        attribute.value(model.input),
        attribute.placeholder("絵emojiの名前（例: apple）"),
        event.on_input(UserInput),
      ]),
      html.button([event.on_click(Submit)], [element.text("送信")]),
      html.button([event.on_click(Reset)], [element.text("リセット")]),
      case model.game_over {
        True -> element.none()
        False -> {
          case model.history {
            [] -> element.none()
            [_last, ..] ->
              html.button([event.on_click(CpuTurn)], [element.text("CPUの番")])
          }
        }
      },
    ]),
    html.hr([]),
    html.h2([], [element.text("候補")]),
    html.div(
      [attribute.class("candidates")],
      emoji.all
        |> list.filter(fn(e) {
          case model.history {
            [] -> !list.contains(model.used, e.emoji)
            [last, ..] -> {
              !list.contains(model.used, e.emoji)
              && emoji.first_char(e.name) == emoji.last_char(last.name)
            }
          }
        })
        |> list.take(24)
        |> list.map(fn(e) {
          html.button(
            [
              event.on_click(Choose(e.name)),
              attribute.title(e.name <> " (" <> e.category <> ")"),
            ],
            [element.text(e.emoji)],
          )
        }),
    ),
    html.hr([]),
    html.h2([], [element.text("履歴")]),
    html.ol(
      [attribute.class("history")],
      model.history
        |> list.map(fn(e) {
          html.li([], [
            element.text(e.emoji <> " " <> e.name <> " (" <> e.category <> ")"),
          ])
        }),
    ),
  ])
}
