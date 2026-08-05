# Emoji Shiritori

絵文字しりとりバトル（PWA）。React + TypeScript + Vite。GitHub Pages にデプロイ。

## URL でゲーム要素バランスを指定

`?`（クエリ文字列）ではなく **ハッシュ URL** で指定する。

```
https://bonsai.github.io/emoji-shiritori/#/hand=12/fields=3/cpu=700/hints=on/mode=relax
```

| キー | 意味 | 例 |
|---|---|---|
| `hand` | 手札サイズ | `hand=12` |
| `fields` | 場カード数 | `fields=3` |
| `cpu` | CPU 行動間隔 (ms) | `cpu=700` |
| `hints` | ヒント発光初期状態 | `hints=on` / `hints=off` |
| `mode` | 初期モード | `mode=speed` / `relax` / `solo` |
| `config` | API からバランス JSON を取得する URL | `config=http://localhost:8787/api/balance` |

ハッシュパラメータ → API config の順に適用（後者が勝つ）。config 取得失敗時はハッシュ + デフォルトで動作。

## API サーバー

`server/index.mjs`（node:http、依存なし）。`data/*.json` を返す。

```
npm run api          # PORT=8787 で起動（PORT 環境変数で変更可）
```

| エンドポイント | 内容 |
|---|---|
| `GET /api/health` | ヘルスチェック |
| `GET /api/balance` | デフォルトバランス |
| `GET /api/modes` | モード定義 |
| `GET /api/emojis` | 絵文字データ |
| `GET /api/i18n` | ja/en テキスト |

CORS 全許可。`?config=<api>/api/balance` のように SPA から参照できる。

## データ分離

`src/emojis.ts` は `data/emojis.json` を import（コード埋め込み廃止）。絵文字の追加・変更は `data/emojis.json` を編集する。

## 開発

```
npm install
npm run dev       # ローカル開発
npm run build     # tsc + vite build
npm run lint      # oxlint
npm run api       # API サーバー
```

## デプロイ

push すると `.github/workflows/pages.yml` が GitHub Pages に自動デプロイ。
