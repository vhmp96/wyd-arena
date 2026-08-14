import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from '@tanstack/react-router';
import { HomePage } from '@/pages/HomePage';
import { ArenaDetailPage } from '@/pages/ArenaDetailPage';
import { PlayersPage } from '@/pages/PlayersPage';
import { AdminPage } from '@/pages/AdminPage';
import { SobrePage } from '@/pages/SobrePage';
import { LevelRankingPage } from '@/pages/LevelRankingPage';
import { UtilidadesPage } from '@/pages/UtilidadesPage';
import { RecordsPage } from '@/pages/RecordsPage';
import { LokiPage } from '@/pages/LokiPage';
import { LokiOverlayPage } from '@/pages/loki/LokiOverlayPage';

const rootRoute = createRootRoute({
  component: Outlet,
});

const playersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  component: PlayersPage,
});

const arenasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/arenas',
  component: HomePage,
});

export const arenaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/arena/$id',
  component: ArenaDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const sobreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sobre',
  component: SobrePage,
});

const levelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/level',
  component: LevelRankingPage,
});

const utilidadesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/utilidades',
  component: UtilidadesPage,
});

const recordsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recordes',
  component: RecordsPage,
});

const lokiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/loki',
  component: LokiPage,
});

const lokiOverlayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/loki/overlay',
  validateSearch: (search: Record<string, unknown>) => ({
    names: typeof search.names === 'string' ? search.names : '',
  }),
  component: LokiOverlayPage,
});

const routeTree = rootRoute.addChildren([playersRoute, arenasRoute, arenaDetailRoute, adminRoute, sobreRoute, levelRoute, utilidadesRoute, recordsRoute, lokiRoute, lokiOverlayRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
