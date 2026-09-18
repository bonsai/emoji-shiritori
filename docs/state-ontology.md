# 「状態」の語義オントロジー（じょうたい / state）

## 1. 目的

`状態`（じょうたい）は同音異義語であり、英語 `state` も多義的で、プログラミングではさらに意味が増える。
state machine を実装する前に、**このゲームで「状態」が指すものを一意に決める**。

この文書は `docs/shiritori-ontology-and-rules.md`（しりとりのオントロジー）を補完する。

## 2. 日本語の同音異義（多くの「読み」と「字」）

| 語 | 意味 | 本ゲームとの関係 |
|---|---|---|
| 状態 | ある時点のありさま・様子 | **主対象**（state machine が扱う） |
| 常態 | 通常のあり方、平常 | 参考: 「初期状態」「平常時」の意味で使うことはある |
| 上体 | 身体の上部 | 無関係 |
| 情態 | 感情・気分のありさま | 無関係 |
| 静態 | 静止したありさま（対: 動態） | 無関係（`せいたい`） |

→ 本ゲームで「状態」と書いたら **状態（ありさま）** を指す。他の字は使わない。

## 3. 英語の多義

| 語 | 意味 | 使い分け |
|---|---|---|
| `state` | ある時点のデータのありさま | **状態機械の状態**（`GameState`） |
| `status` | 進捗・地位・表示用の区分 | 表示用（勝敗・接続状態など） |
| `condition` | 条件・前提 | ガード条件・前提 |
| `situation` / `phase` | 局面・段階 | **遷移の段階**（`Phase`） |
| `mode` | 遊び方の種類 | `Mode`（speed / relax / solo） |

## 4. プログラミングにおける多義

| 種類 | 説明 | 本ゲームでの所在 |
|---|---|---|
| machine state | 有限・名前付き・遷移を持つ状態 | `GameState`（reducer が遷移） |
| application state | アプリが保持するドメインデータ | `field` / `hand` / `deck` 等 |
| view state | 表示のための一時的な状態 | UI 側（`Screen`） |
| config | 設定値 | `GameBalance`（存在する） |
| server state | サーバが持つ状態 | `server/`（現状は balance 提供のみ） |
| component state | React の `useState` | `App.tsx`（移行対象） |
| atomic state | Jotai 等の atom 由来の状態 | 未導入（導入する場合は別 issue） |

**混同しやすい点**: 「状態」を `useState` の値すべてに使うと、機械の状態と表示状態が混ざる。
→ 型と名前で分離する（下記）。

## 5. 本ゲームの定義（一意化）

```text
GameState = Phase + domain data + counters
```

| 名前 | 型 | 意味 |
|---|---|---|
| `GameState` | object | state machine の状態（唯一の正） |
| `Phase` | `"playing" \| "finished"` | 遷移の段階。`ready`/`menu` は UI 側 |
| `FinishReason` | `"timeout" \| "stalemate" \| "cleared" \| null` | 終了理由（表示用 status） |
| `field` / `hand` / `deck` | `Emoji` | ドメインデータ（ontology 準拠） |
| `combo` / `moves` | number | カウンタ |
| `secondsLeft` | number | 残り時間 |

- 遷移は `reduce(state, event, lang, rng)` のみが行う（純粋関数）
- 表示用の区分は `Phase` / `FinishReason` から導出し、別の `status` フィールドを増やさない
- 乱数は `rng` 注入で外部化し、状態機械自体を決定的にする

## 6. 命名規則

1. `*State` … state machine の状態（reducer の入出力）
2. `*Phase` … 遷移の段階。文字列リテラルの union
3. `*Status` … **表示専用**。永続化・遷移には使わない
4. `*Mode` … 遊び方の種類
5. `is*` / `can*` … 判定（副作用なし）
6. `next*` … 派生（例: `nextChoices` = 次の選択肢）

## 7. 不変条件

1. `GameState` の変更は `reduce` 経由のみ
2. 不正イベント（置けないカード・終了後の操作）は状態を変えない
3. `Phase` は単調（`playing → finished` の一方向）
4. 日本語・英語の差は読みだけに閉じ込め、遷移は共通

## 8. 関連

- `docs/shiritori-ontology-and-rules.md` … Field / Hand / Deck / Move / Chain の定義
- `src/game.ts` … 本オントロジーの実装（state machine）
