import balance from "../data/balance.json";
import modes from "../data/modes.json";
import emojis from "../data/emojis.json";
import i18n from "../data/i18n.json";

const routes = {
  "/api/health": { ok: true, service: "emoji-shiritori-api" },
  "/api/balance": () => balance,
  "/api/modes": () => modes,
  "/api/emojis": () => emojis,
  "/api/i18n": () => i18n,
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const handler = routes[url.pathname];
    if (!handler) {
      return Response.json(
        { error: "not found", path: url.pathname },
        { status: 404, headers: cors }
      );
    }

    const payload = typeof handler === "function" ? handler() : handler;
    return Response.json(payload, { headers: cors });
  },
};
