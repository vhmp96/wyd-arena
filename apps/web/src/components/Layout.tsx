import { Link, useRouterState, useNavigate } from '@tanstack/react-router';
import { Swords } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
}

const NAV_ROUTES = [
  { path: '/',          label: 'Jogadores' },
  { path: '/arenas',    label: 'Arenas' },
  { path: '/level',     label: 'Level' },
  { path: '/recordes',  label: 'Recordes' },
  { path: '/utilidades',label: 'Utilidades' },
  { path: '/loki',      label: 'Loki 7' },
  { path: '/sobre',     label: 'Sobre a Iniciativa' },
];

export function Layout({ children, headerRight }: LayoutProps) {
  const { location } = useRouterState();
  const navigate = useNavigate();

  const isArenas = location.pathname.startsWith('/arenas') || location.pathname.startsWith('/arena/');
  const isLevel = location.pathname === '/level';
  const isUtilidades = location.pathname === '/utilidades';
  const isRecordes = location.pathname === '/recordes';
  const isLoki = location.pathname.startsWith('/loki');
  const isSobre = location.pathname === '/sobre';
  const isHome = !isArenas && !isSobre && !isLevel && !isUtilidades && !isRecordes && !isLoki;

  const currentPath = isHome ? '/' : isLoki ? '/loki' : location.pathname;

  function activePath(path: string) {
    if (path === '/') return isHome;
    if (path === '/arenas') return isArenas;
    if (path === '/loki') return isLoki;
    return location.pathname === path;
  }

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">

          {/* ── Mobile: logo + select ─────────────────────── */}
          <div className="sm:hidden flex items-center gap-3 py-2.5">
            <Link
              to="/"
              search={{ q: undefined }}
              className="flex items-center gap-2 shrink-0 group"
            >
              <Swords className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
              <span className="font-bold tracking-widest uppercase text-sm">
                WYD <span className="text-primary">Arena</span>
              </span>
            </Link>
            <select
              value={currentPath}
              onChange={(e) => {
                const p = e.target.value;
                if (p === '/') navigate({ to: '/', search: { q: undefined } });
                else navigate({ to: p as never });
              }}
              className="flex-1 bg-muted border border-border rounded px-2 py-1.5 text-sm font-medium"
            >
              {NAV_ROUTES.map((r) => (
                <option key={r.path} value={r.path}>{r.label}</option>
              ))}
            </select>
            {headerRight}
          </div>

          {/* ── Desktop: single row ───────────────────────── */}
          <div className="hidden sm:flex items-center gap-6 py-3">
            <Link
              to="/"
              search={{ q: undefined }}
              className="flex items-center gap-2 shrink-0 group"
            >
              <Swords className="h-5 w-5 text-primary transition-transform group-hover:rotate-12" />
              <span className="font-bold tracking-widest uppercase text-sm">
                WYD <span className="text-primary">Arena</span>
              </span>
            </Link>
            <nav className="flex items-center gap-0.5">
              {NAV_ROUTES.filter((r) => r.path !== '/sobre').map((r) => {
                const cls = cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors border-b-2',
                  r.path === '/loki'
                    ? activePath(r.path)
                      ? 'text-yellow-400 border-yellow-400'
                      : 'text-yellow-600 border-transparent hover:text-yellow-400'
                    : activePath(r.path)
                      ? 'text-primary border-primary'
                      : 'text-muted-foreground border-transparent hover:text-foreground',
                );
                const label = r.label;
                if (r.path === '/') {
                  return <Link key="/" to="/" search={{ q: undefined }} className={cls}>{label}</Link>;
                }
                return <Link key={r.path} to={r.path as never} className={cls}>{label}</Link>;
              })}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Link
                to="/sobre"
                className={cn(
                  'px-3 py-1.5 text-sm font-medium transition-colors border-b-2',
                  isSobre
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground',
                )}
              >
                Sobre a Iniciativa
              </Link>
              {headerRight}
            </div>
          </div>

        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Swords className="h-3 w-3 text-primary/60" />
              WYD Arena Tracker
            </span>
            <span>© 2025 · Deuteront &amp; Hespert</span>
          </div>
          <p className="text-xs text-muted-foreground/50 text-center">
            Projeto independente. Não possui vínculo oficial com Raidhut ou com a marca WYD.
          </p>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
}
