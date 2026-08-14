import { Hono } from 'hono';
import { requireAuth } from '../middleware/requireAuth';
import type { SeasonService } from '../services/SeasonService';

export function createSeasonRoutes(seasonService: SeasonService) {
  const app = new Hono();

  app.post('/consolidate', requireAuth, async (c) => {
    const result = await seasonService.consolidate();
    return c.json(result, result.ok ? 200 : 500);
  });

  app.get('/player/:name', async (c) => {
    const name = c.req.param('name');
    const data = await seasonService.getPlayerSeasonHistory(name);
    return c.json(data);
  });

  app.get('/:month', async (c) => {
    const month = c.req.param('month');
    if (!/^\d{4}-\d{2}$/.test(month)) return c.json({ error: 'Formato inválido. Use YYYY-MM.' }, 400);
    const data = await seasonService.getSeasonTop10(month);
    return c.json({ data });
  });

  return app;
}
