# Emoji Shiritori

絵文字しりとりバトル（PWA）。React + TypeScript + Vite。GitHub Pages にデプロイ。

## ゲームルール

場の絵文字の名前の最後の文字を見て、その文字から始まる絵文字を手札から出す。先に手札をなくしたプレイヤーが勝ち。

- **ゆっくり**: 場1枚。名前を隠して、絵文字だけで考えるモード。
- **スピード**: 場2枚。複数の選択肢から最速でつなぐモード。
- **ひとり練習**: CPUなし。デッキを補充しながら絵文字を自由に試せるサンドボックス。
- CPUは一定間隔で、実際に出せるカードを自動選択する。
- ヒントONでは「次の文字」とプレイ可能カードを視覚的に確認できる。
- 日本語はカタカナをひらがなへ正規化して判定する。

## URL でゲーム要素バランスを指定

`?`（クエリ文字列）ではなく **ハッシュ URL** で指定する。

```text
https://bonsai.github.io/emoji-shiritori/#/hand=8/fields=2/cpu=700/hints=on/mode=speed
```

| キー | 意味 | 例 |
|---|---|---|
| `hand` | 手札サイズ | `hand=8` |
| `fields` | 場カード数 | `fields=2` |
| `cpu` | CPU 行動間隔 (ms) | `cpu=700` |
| `hints` | ヒント初期状態 | `hints=on` / `hints=off` |
| `mode` | 初期モード | `mode=speed` / `relax` / `solo` |
| `config` | API からバランス JSON を取得する URL | `config=http://localhost:8787/api/balance` |

ハッシュパラメータ → API config の順に適用（後者が勝つ）。config 取得失敗時はハッシュ + デフォルトで動作。

## データ構造

絵文字データは `data/emojis.json` に分離している。

```text
Emoji
├─ emoji       表示する絵文字
├─ name        英語名
├─ jaName      日本語名・読み
├─ category    カテゴリ
└─ tags[]      検索・分類用タグ
```

ゲームロジックは `src/emojis.ts` に集約し、文字の正規化、先頭文字・末尾文字の取得、配置可能判定を行う。データの必須項目と絵文字重複はテストで検証する。

## API サーバー

`server/index.mjs`（node:http、依存なし）。`data/*.json` を返す。

```text
npm run api
```

| エンドポイント | 内容 |
|---|---|
| `GET /api/health` | ヘルスチェック |
| `GET /api/balance` | デフォルトバランス |
| `GET /api/modes` | モード定義 |
| `GET /api/emojis` | 絵文字データ |
| `GET /api/i18n` | ja/en テキスト |

CORS 全許可。`?config=<api>/api/balance` のように SPA から参照できる。

## 開発

```text
npm install
npm run dev
npm run build
npm run lint
npm test
npm run api
```

## デプロイ

push すると `.github/workflows/pages.yml` により GitHub Pages に自動デプロイ。
