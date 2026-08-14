import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { playerApi } from '@/lib/api';
import type { PlayerSearchResult } from '@wyd/shared';

function PlayerPicker({
  label,
  onPick,
  picked,
}: {
  label: string;
  onPick: (p: PlayerSearchResult | null) => void;
  picked: PlayerSearchResult | null;
}) {
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');

  const { data, isFetching } = useQuery({
    queryKey: ['players-search', query],
    queryFn: () => playerApi.search(query),
    enabled: query.length >= 2,
  });

  if (picked) {
    return (
      <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
        <span className="font-semibold">{picked.name}</span>
        <button
          onClick={() => onPick(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          trocar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setQuery(input.trim())}
          placeholder={label}
          className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          onClick={() => setQuery(input.trim())}
          className="inline-flex h-10 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>
      {isFetching && <p className="text-xs text-muted-foreground">Buscando...</p>}
      {data && data.length > 0 && (
        <div className="max-h-40 overflow-auto rounded-md border bg-card">
          {data.slice(0, 8).map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-muted"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
      {data && query.length >= 2 && !isFetching && data.length === 0 && (
        <p className="text-xs text-muted-foreground">Nenhum jogador encontrado.</p>
      )}
    </div>
  );
}

function kd(p: PlayerSearchResult) {
  return p.totalKills / Math.max(1, p.totalDeaths);
}

function StatRow({
  label,
  a,
  b,
  format = (n: number) => String(n),
}: {
  label: string;
  a: number;
  b: number;
  format?: (n: number) => string;
}) {
  const aWins = a > b;
  const bWins = b > a;
  return (
    <div className="grid grid-cols-3 items-center border-b border-border py-2 text-sm last:border-0">
      <span className={`text-right tabular-nums ${aWins ? 'font-bold text-primary' : ''}`}>{format(a)}</span>
      <span className="text-center text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className={`text-left tabular-nums ${bWins ? 'font-bold text-primary' : ''}`}>{format(b)}</span>
    </div>
  );
}

export function CompareTab() {
  const [a, setA] = useState<PlayerSearchResult | null>(null);
  const [b, setB] = useState<PlayerSearchResult | null>(null);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <PlayerPicker label="Jogador 1..." picked={a} onPick={setA} />
        <PlayerPicker label="Jogador 2..." picked={b} onPick={setB} />
      </div>

      {a && b && (
        <div className="rounded-lg border bg-card p-4">
          <div className="grid grid-cols-3 items-center pb-3 text-center">
            <span className="text-right font-bold">{a.name}</span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="text-left font-bold">{b.name}</span>
          </div>
          <StatRow label="Arenas" a={a.totalArenas} b={b.totalArenas} />
          <StatRow label="Vitórias" a={a.totalWins} b={b.totalWins} />
          <StatRow label="Kills" a={a.totalKills} b={b.totalKills} />
          <StatRow label="Deaths" a={a.totalDeaths} b={b.totalDeaths} />
          <StatRow label="K/D" a={kd(a)} b={kd(b)} format={(n) => n.toFixed(2)} />
          <StatRow label="Streak atual" a={a.currentStreak} b={b.currentStreak} />
          <StatRow label="Melhor streak" a={a.bestStreak} b={b.bestStreak} />
        </div>
      )}

      {(!a || !b) && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Escolha dois jogadores para comparar.
        </p>
      )}
    </div>
  );
}
