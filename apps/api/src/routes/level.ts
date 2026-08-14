import { Hono } from 'hono';
import type { LevelService } from '../services/LevelService';
import { requireAuth } from '../middleware/requireAuth';

export function createLevelRoutes(levelService: LevelService) {
  const app = new Hono();

  app.get('/', async (c) => {
    try {
      const data = await levelService.list();
      return c.json({ data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ error: msg }, 502);
    }
  });

  app.get('/guilds', async (c) => {
    try {
      const data = await levelService.getGuildRanking();
      return c.json({ data });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ error: msg }, 502);
    }
  });

  app.get('/player/:name', async (c) => {
    const name = c.req.param('name');
    try {
      const all = await levelService.list();
      const player = all.find((p) => p.name.toLowerCase() === name.toLowerCase());
      if (!player) return c.json(null);
      return c.json(player);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return c.json({ error: msg }, 502);
    }
  });

  app.post('/sync', requireAuth, async (c) => {
    const result = await levelService.sync();
    return c.json(result, result.ok ? 200 : 502);
  });

  return app;
}
