import { Hono } from 'hono';
import type { PlayerService } from '../services/PlayerService';

export function createPlayerRoutes(playerService: PlayerService) {
  const app = new Hono();

  app.get('/search', async (c) => {
    const q = c.req.query('q') ?? '';
    const trimmed = q.trim();
    if (trimmed.length < 2 || trimmed.length > 100) return c.json([]);
    const data = await playerService.searchPlayers(trimmed);
    return c.json(data);
  });

  app.get('/:id/partners', async (c) => {
    const id = c.req.param('id');
    const data = await playerService.getTopPartners(id);
    return c.json(data);
  });

  app.get('/:id/timeline', async (c) => {
    const id = c.req.param('id');
    const data = await playerService.getTimeline(id);
    return c.json(data);
  });

  return app;
}
