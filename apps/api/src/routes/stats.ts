import { Hono } from 'hono';
import type { StatsService } from '../services/StatsService';

export function createStatsRoutes(statsService: StatsService) {
  const app = new Hono();

  app.get('/trending', async (c) => {
    const data = await statsService.getTrending();
    return c.json(data);
  });

  app.get('/period', async (c) => {
    const range = c.req.query('range') === 'week' ? 'week' : 'day';
    const data = await statsService.getPeriodRanking(range);
    return c.json(data);
  });

  app.get('/records', async (c) => {
    const data = await statsService.getRecords();
    return c.json(data);
  });

  return app;
}
