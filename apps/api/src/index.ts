// Ponto de entrada SÓ PRA DESENVOLVIMENTO LOCAL (pnpm dev).
// Em produção no Netlify, a API roda como Netlify Function (netlify/functions/api.ts)
// e os crons abaixo viram Scheduled Functions separadas — veja netlify/functions/.
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { serve } from '@hono/node-server';
import cron from 'node-cron';
import { app, syncService, levelService, seasonService } from './app';

async function runCronWithRetry(attempt = 0) {
  try {
    const result = await syncService.trigger('cron', attempt);
    if (result.ok && result.arenasCreated !== null && result.arenasCreated < 2 && attempt < 5) {
      console.log(`[cron] ${result.arenasCreated} arena(s) criada(s) — tentativa ${attempt + 1}/5 em 5 min`);
      setTimeout(() => runCronWithRetry(attempt + 1), 5 * 60 * 1000);
    }
  } catch (err) {
    console.error('[cron] erro:', err);
  }
}

// horários de sync: 13:35 | 19:35 | 21:05 | 23:35
cron.schedule('35 13 * * *', () => runCronWithRetry());
cron.schedule('35 19 * * *', () => runCronWithRetry());
cron.schedule('5 21 * * *', () => runCronWithRetry());
cron.schedule('35 23 * * *', () => runCronWithRetry());

// sync de level ranking: 3:00 todo dia
cron.schedule('0 3 * * *', () => {
  levelService.sync().catch((err) => console.error('[level-cron] erro:', err));
});

// consolidação de season: 23:55 do último dia do mês
cron.schedule('55 23 * * *', () => {
  if (!seasonService.shouldRunCron()) return;
  seasonService.consolidate().catch((err) => console.error('[season-cron] erro:', err));
});

const PORT = Number(process.env.PORT ?? 4000);

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`API running at http://localhost:${PORT}`);
  console.log('Crons agendados: 13:35 | 19:35 | 21:05 | 23:35');
});
