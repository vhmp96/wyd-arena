// Configuração do Hono separada de "como rodar" (servidor local vs Netlify Function).
// index.ts (dev local) e netlify/functions/api.ts (produção) importam esse app.
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getDb } from '@wyd/db';
import { ArenaService } from './services/ArenaService';
import { PlayerService } from './services/PlayerService';
import { SyncService } from './services/SyncService';
import { SeasonService } from './services/SeasonService';
import { LevelService } from './services/LevelService';
import { StatsService } from './services/StatsService';
import { createArenaRoutes } from './routes/arenas';
import { createPlayerRoutes } from './routes/players';
import { createRankingsRoute } from './routes/rankings';
import { createSyncRoutes } from './routes/sync';
import { createAuthRoutes } from './routes/auth';
import { createSeasonRoutes } from './routes/seasons';
import { createLevelRoutes } from './routes/level';
import { createStatsRoutes } from './routes/stats';
import { createLokiRoutes } from './routes/loki';

export const app = new Hono();

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  ...(process.env.WEB_URL ? [process.env.WEB_URL] : []),
];

app.use('*', cors({ origin: allowedOrigins }));

const db = getDb();
export const arenaService = new ArenaService(db);
export const playerService = new PlayerService(db);
export const syncService = new SyncService(db);
export const seasonService = new SeasonService(db);
export const levelService = new LevelService(db);
export const statsService = new StatsService(db);

app.route('/arenas', createArenaRoutes(arenaService));
app.route('/players', createPlayerRoutes(playerService));
app.route('/rankings', createRankingsRoute(db));
app.route('/sync', createSyncRoutes(syncService));
app.route('/seasons', createSeasonRoutes(seasonService));
app.route('/auth', createAuthRoutes());
app.route('/level', createLevelRoutes(levelService));
app.route('/stats', createStatsRoutes(statsService));
app.route('/loki', createLokiRoutes());

app.get('/health', (c) => c.json({ status: 'ok' }));
