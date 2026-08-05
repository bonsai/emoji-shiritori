import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8787;
const DATA = join(__dirname, "..", "data");

function load(name) {
  return JSON.parse(readFileSync(join(DATA, name), "utf8"));
}

const routes = {
  "/api/health": { ok: true, service: "emoji-shiritori-api" },
  "/api/balance": () => load("balance.json"),
  "/api/modes": () => load("modes.json"),
  "/api/emojis": () => load("emojis.json"),
  "/api/i18n": () => load("i18n.json"),
};

createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  const { pathname } = new URL(req.url, "http://localhost");
  const handler = routes[pathname];

  if (!handler) {
    res.statusCode = 404;
    return res.end(JSON.stringify({ error: "not found", path: pathname }));
  }

  try {
    res.end(JSON.stringify(typeof handler === "function" ? handler() : handler));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: String(err) }));
  }
}).listen(PORT, () => {
  console.log(`emoji-shiritori API listening on http://localhost:${PORT}`);
});
