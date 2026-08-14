import { Hono } from 'hono';

const LOKI_RANK_URL = 'https://mochila.tapiocahut.com/loki-component-rank';

export function createLokiRoutes() {
  const app = new Hono();

  app.get('/rank', async (c) => {
    try {
      const res = await fetch(LOKI_RANK_URL, {
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) {
        return c.json({ error: `Upstream HTTP ${res.status}` }, 502);
      }
      const data = await res.json();
      return c.json(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ error: msg }, 502);
    }
  });

  return app;
}
