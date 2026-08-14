import { Hono } from 'hono';
import type { SyncService } from '../services/SyncService';
import { requireAuth } from '../middleware/requireAuth';

export function createSyncRoutes(syncService: SyncService) {
  const app = new Hono();

  app.post('/trigger', requireAuth, async (c) => {
    const result = await syncService.trigger('manual');
    return c.json(result, result.ok ? 200 : 500);
  });

  app.post('/reset', requireAuth, async (c) => {
    const result = await syncService.resetData();
    return c.json(result, result.ok ? 200 : 500);
  });

  app.get('/status', async (c) => {
    const last = await syncService.lastSync();
    return c.json({ last });
  });

  app.get('/snapshots', requireAuth, async (c) => {
    const snaps = await syncService.listSnapshots();
    return c.json({ data: snaps });
  });

  app.delete('/snapshots/:id', requireAuth, async (c) => {
    const id = c.req.param('id');
    if (!id) return c.json({ ok: false, error: 'id obrigatório' }, 400);
    const result = await syncService.deleteSnapshot(id);
    return c.json(result, result.ok ? 200 : 400);
  });

  return app;
}
