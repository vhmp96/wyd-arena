import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { RefreshCw, LogOut, ArrowLeft, Trash2, Trophy, Database } from 'lucide-react';
import { authApi, syncApi, arenaApi, seasonApi, levelApi } from '@/lib/api';
import type { SnapshotEntry } from '@/lib/api';
import { ARENA_TIME_LABELS } from '@wyd/shared';
import type { ArenaDiv } from '@wyd/shared';

function fmtDatetime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await authApi.login(password);
    if (result.ok && result.token) {
      sessionStorage.setItem('admin_token', result.token);
      onLogin();
    } else {
      setError(result.error ?? 'Senha incorreta');
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold">Painel de Administração</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

const DIVISION_LABELS: Record<string, string> = { champion: 'Champion', aspirant: 'Aspirant' };

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function ArenaManager() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-arenas'],
    queryFn: () => arenaApi.list({}),
  });

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Apagar arena ${label}?`)) return;
    setDeletingId(id);
    setDeleteError(null);
    const result = await arenaApi.delete(id);
    setDeletingId(null);
    if (!result.ok) {
      setDeleteError(result.error ?? 'Erro ao apagar arena');
      return;
    }
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['arenas'] });
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold">Gerenciar Arenas</h2>
        <span className="text-xs text-muted-foreground">{data?.data.length ?? 0} arenas</span>
      </div>
      {isLoading && <p className="px-6 py-4 text-sm text-muted-foreground">Carregando...</p>}
      {deleteError && <p className="px-6 py-3 text-sm text-destructive">{deleteError}</p>}
      {data?.data.length === 0 && <p className="px-6 py-4 text-sm text-muted-foreground">Nenhuma arena cadastrada.</p>}
      <div className="divide-y divide-border">
        {data?.data.map((a) => {
          const label = `${fmtDate(a.arenaDate)} · ${ARENA_TIME_LABELS[a.arenaNumber] ?? `#${a.arenaNumber}`} · ${DIVISION_LABELS[a.division as ArenaDiv] ?? a.division}`;
          return (
            <div key={a.id} className="flex items-center justify-between px-6 py-2.5 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">{a.winnerCount} vencedor{a.winnerCount !== 1 ? 'es' : ''}</span>
                <button
                  onClick={() => handleDelete(a.id, label)}
                  disabled={deletingId === a.id}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-40 transition-colors"
                  title="Apagar arena"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LevelSyncer() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSync() {
    setLoading(true);
    setFeedback(null);
    const result = await levelApi.sync();
    setFeedback(result);
    setLoading(false);
    await queryClient.invalidateQueries({ queryKey: ['level-ranking'] });
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        Sincronizar Ranking de Level
      </h2>
      <p className="text-sm text-muted-foreground">
        Busca os 500 players do ranking de level da API externa e salva no banco. Executado automaticamente às 3h todo dia.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSync}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Sincronizar agora'}
        </button>
        {feedback && (
          <span className={`text-sm ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}

function SeasonConsolidator() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleConsolidate() {
    if (!confirm('Vai buscar o ranking atual da RaidHut e salvar o top 10 do mês. Confirmar?')) return;
    setLoading(true);
    setFeedback(null);
    const result = await seasonApi.consolidate();
    setFeedback(result);
    setLoading(false);
  }

  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <h2 className="font-semibold flex items-center gap-2">
        <Trophy className="h-4 w-4 text-primary" />
        Consolidar Season
      </h2>
      <p className="text-sm text-muted-foreground">
        Busca o ranking atual da RaidHut e salva o top 10 de champion e aspirant como histórico fixo do mês.
        Executado automaticamente às 23:55 do último dia de cada mês.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleConsolidate}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Trophy className={`h-4 w-4 ${loading ? 'animate-pulse' : ''}`} />
          {loading ? 'Consolidando...' : 'Consolidar agora'}
        </button>
        {feedback && (
          <span className={`text-sm ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>
            {feedback.message}
          </span>
        )}
      </div>
    </div>
  );
}

function SnapshotManager() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, refetch } = useQuery({
    queryKey: ['admin-snapshots'],
    queryFn: () => syncApi.listSnapshots(),
  });

  const snapshots = data?.data ?? [];
  const latestId = snapshots[0]?.id;

  function fmtCollected(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  async function handleDelete(snap: SnapshotEntry) {
    const label = `${fmtDate(snap.arenaDate)} · ${ARENA_TIME_LABELS[snap.arenaNumber] ?? `#${snap.arenaNumber}`}`;
    if (!confirm(`Apagar snapshot ${label}? Isso não apaga as arenas já criadas com ele.`)) return;
    setDeletingId(snap.id);
    setError(null);
    const result = await syncApi.deleteSnapshot(snap.id);
    setDeletingId(null);
    if (!result.ok) { setError(result.error ?? 'Erro ao apagar snapshot'); return; }
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['admin-snapshots'] });
  }

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-6 py-4 flex items-center justify-between">
        <h2 className="font-semibold flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Snapshots recentes
        </h2>
        <span className="text-xs text-muted-foreground">{snapshots.length} snapshots</span>
      </div>
      <p className="px-6 pt-3 pb-1 text-xs text-muted-foreground">
        Apague o snapshot mais recente se ele estiver incorreto e sincronize novamente para recalcular o delta.
      </p>
      {error && <p className="px-6 py-2 text-sm text-destructive">{error}</p>}
      <div className="divide-y divide-border">
        {snapshots.map((snap, i) => (
          <div key={snap.id} className="flex items-center justify-between px-6 py-2.5 text-sm">
            <div className="flex items-center gap-3">
              {i === 0 && <span className="text-xs bg-primary/10 text-primary rounded px-1.5 py-0.5">mais recente</span>}
              <span className="text-muted-foreground">
                {fmtDate(snap.arenaDate)} · {ARENA_TIME_LABELS[snap.arenaNumber] ?? `#${snap.arenaNumber}`}
              </span>
              <span className="text-xs text-muted-foreground">{fmtCollected(snap.collectedAt)}</span>
            </div>
            {snap.id === latestId && (
              <button
                onClick={() => handleDelete(snap)}
                disabled={deletingId === snap.id}
                className="text-destructive hover:text-destructive/80 disabled:opacity-40 transition-colors"
                title="Apagar snapshot mais recente"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        {snapshots.length === 0 && (
          <p className="px-6 py-4 text-sm text-muted-foreground">Nenhum snapshot encontrado.</p>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [syncing, setSyncing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data, refetch } = useQuery({
    queryKey: ['sync-status'],
    queryFn: syncApi.status,
    refetchInterval: 30_000,
  });

  const history = data?.last ? [data.last] : [];

  async function handleSync() {
    setSyncing(true);
    setFeedback(null);
    const result = await syncApi.trigger();
    setFeedback(result);
    setSyncing(false);
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['arenas'] });
    await queryClient.invalidateQueries({ queryKey: ['rankings'] });
  }

  async function handleReset() {
    if (!confirm('Isso vai apagar todas as arenas, resultados e snapshots. Os players são mantidos. Confirmar?')) return;
    setResetting(true);
    setFeedback(null);
    const result = await syncApi.reset();
    setFeedback(result);
    setResetting(false);
    await refetch();
    await queryClient.invalidateQueries();
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center gap-4 px-4 py-4">
          <Link to="/" search={{ q: undefined }} className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-xl font-semibold">Painel de Administração</h1>
          <button
            onClick={onLogout}
            className="ml-auto inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
        {/* Sync card */}
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <h2 className="font-semibold">Sincronização de Dados</h2>
          <p className="text-sm text-muted-foreground">
            Busca os dados atuais da API externa e calcula os resultados da arena mais recente com base no diff de snapshots.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
            {feedback && (
              <span className={`text-sm ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>
                {feedback.message}
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Crons automáticos: <span className="font-mono">13:35 · 19:35 · 21:05 · 23:35</span></p>
          </div>
        </div>

        {/* Reset card */}
        <div className="rounded-lg border border-destructive/40 bg-card p-6 space-y-4">
          <h2 className="font-semibold text-destructive">Zona de Perigo</h2>
          <p className="text-sm text-muted-foreground">
            Apaga todas as arenas, resultados e snapshots. Os players são mantidos. A próxima sincronização cria um novo baseline.
          </p>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="inline-flex items-center gap-2 rounded-md border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {resetting ? 'Resetando...' : 'Resetar dados'}
          </button>
        </div>

        {/* Snapshot manager */}
        <SnapshotManager />

        {/* Level sync card */}
        <LevelSyncer />

        {/* Season consolidation card */}
        <SeasonConsolidator />

        {/* Arena manager */}
        <ArenaManager />

        {/* Last sync info */}
        {data?.last && (
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 font-semibold">Última Sincronização</h2>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Data</p>
                <p className="font-medium">{data.last.arenaDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Arena</p>
                <p className="font-medium">{ARENA_TIME_LABELS[data.last.arenaNumber] ?? data.last.arenaNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Disparado por</p>
                <p className="font-medium">{data.last.triggeredBy}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Iniciou</p>
                <p className="font-medium">{fmtDatetime(data.last.startedAt)}</p>
              </div>
              {data.last.finishedAt && (
                <div>
                  <p className="text-muted-foreground">Finalizou</p>
                  <p className="font-medium">{fmtDatetime(data.last.finishedAt)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className={`font-medium ${
                  data.last.status === 'SUCCESS' ? 'text-green-400'
                  : data.last.status === 'FAILED' ? 'text-red-400'
                  : 'text-yellow-400'
                }`}>{data.last.status}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>WYD Arena Tracker</span>
          <span>© 2025 · Deuteront &amp; Hespert</span>
        </div>
      </footer>
    </div>
  );
}

export function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('admin_token')) setAuthed(true);
  }, []);

  function logout() {
    sessionStorage.removeItem('admin_token');
    setAuthed(false);
  }

  if (!authed) return <LoginForm onLogin={() => setAuthed(true)} />;
  return <AdminPanel onLogout={logout} />;
}
