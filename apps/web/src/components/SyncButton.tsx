import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { syncApi } from '@/lib/api';
import { ARENA_TIME_LABELS } from '@wyd/shared';

function fmtDatetime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['sync-status'],
    queryFn: syncApi.status,
    refetchInterval: 60_000,
  });

  const last = data?.last;

  async function handleSync() {
    setLoading(true);
    setFeedback(null);
    try {
      const result = await syncApi.trigger();
      setFeedback(result);
      await queryClient.invalidateQueries({ queryKey: ['sync-status'] });
      await queryClient.invalidateQueries({ queryKey: ['arenas'] });
      await queryClient.invalidateQueries({ queryKey: ['rankings'] });
    } catch {
      setFeedback({ ok: false, message: 'Erro ao conectar com a API.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {last && (
        <span className="hidden text-xs text-muted-foreground sm:block">
          Última sync: {fmtDatetime(last.startedAt)}
          {' · '}Arena {ARENA_TIME_LABELS[last.arenaNumber] ?? last.arenaNumber}
          {' · '}
          <span className={last.status === 'SUCCESS' ? 'text-green-400' : last.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}>
            {last.status}
          </span>
        </span>
      )}

      {feedback && (
        <span className={`text-xs ${feedback.ok ? 'text-green-400' : 'text-red-400'}`}>
          {feedback.message}
        </span>
      )}

      <button
        onClick={handleSync}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Sincronizando...' : 'Sincronizar'}
      </button>
    </div>
  );
}
