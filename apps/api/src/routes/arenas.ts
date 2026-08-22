import { Hono } from 'hono';
import type { ArenaService } from '../services/ArenaService';
import { requireAuth } from '../middleware/requireAuth';

export function createArenaRoutes(arenaService: ArenaService) {
  const app = new Hono();

  app.get('/', async (c) => {
    const arenaDate = c.req.query('arenaDate');
    const arenaNumberRaw = c.req.query('arenaNumber');
    const arenaNumber = arenaNumberRaw ? parseInt(arenaNumberRaw, 10) : undefined;
    if (arenaNumber !== undefined && (Number.isNaN(arenaNumber) || arenaNumber < 1 || arenaNumber > 4)) {
      return c.json({ error: 'arenaNumber inválido' }, 400);
    }
    const division = c.req.query('division') as 'champion' | 'aspirant' | undefined;
    const winnerNamesRaw = c.req.query('winnerNames');
    const winnerNames = winnerNamesRaw ? winnerNamesRaw.split(',').map((n) => n.trim()).filter(Boolean) : undefined;

    const data = await arenaService.listArenas({ arenaDate, arenaNumber, division, winnerNames });
    return c.json({ data });
  });

  app.get('/champions', async (c) => {
    const arenaDate = c.req.query('arenaDate');
    const arenaNumberRaw = c.req.query('arenaNumber');
    const arenaNumber = arenaNumberRaw ? parseInt(arenaNumberRaw, 10) : NaN;
    if (!arenaDate || Number.isNaN(arenaNumber) || arenaNumber < 1 || arenaNumber > 4) {
      return c.json({ error: 'arenaDate e arenaNumber (1 a 4) são obrigatórios' }, 400);
    }
    const data = await arenaService.getChampions(arenaDate, arenaNumber);
    return c.json(data);
  });

  app.get('/:id', async (c) => {
    const id = c.req.param('id');
    const data = await arenaService.getArena(id);
    if (!data) {
      return c.json({ error: 'Arena not found' }, 404);
    }
    return c.json(data);
  });

  app.delete('/:id', requireAuth, async (c) => {
    const id = c.req.param('id') ?? '';
    if (!id) return c.json({ error: 'Arena not found' }, 404);
    const deleted = await arenaService.deleteArena(id);
    if (!deleted) return c.json({ error: 'Arena not found' }, 404);
    return c.json({ ok: true });
  });

  return app;
}
