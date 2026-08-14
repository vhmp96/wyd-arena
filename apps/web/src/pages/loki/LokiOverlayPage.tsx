import { useMemo } from 'react';
import { useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Gem, Crown, Trophy, Star, Award, Cog } from 'lucide-react';
import { lokiApi } from '@/lib/api';
import { TIERS } from '@/lib/lokiStorage';
import type { TierDef } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

const TIER_ICONS: Record<string, React.ElementType> = {
  diamante: Gem, platina: Crown, ouro: Trophy,
  prata: Star, bronze: Award, ferro: Cog,
};

type RankedPlayer = { charname: string; class: number; totalScore: number; originalRank: number };

function getTierByRank(pos: number): TierDef | null {
  let acc = 0;
  for (const tier of TIERS) {
    acc += tier.slots;
    if (pos <= acc) return tier;
  }
  return null;
}

function TierBadge({ tier }: { tier: TierDef | null }) {
  if (!tier) return <span className="text-white/30">—</span>;
  const Icon = TIER_ICONS[tier.id] ?? Cog;
  return <Icon className={cn('h-3.5 w-3.5 shrink-0', tier.color)} />;
}

function MiniTable({ rows }: { rows: RankedPlayer[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-white/10 text-white/30 uppercase text-[10px] tracking-wider">
          <th className="px-2 py-1 text-center w-8">Pos</th>
          <th className="px-2 py-1 text-center w-6">Tier</th>
          <th className="px-2 py-1 text-left">Jogador</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {rows.map((p) => {
          const tier = getTierByRank(p.originalRank);
          return (
            <tr key={p.charname} className="text-white">
              <td className="px-2 py-1.5 text-center tabular-nums text-white/40">{p.originalRank}º</td>
              <td className="px-2 py-1.5 text-center"><TierBadge tier={tier} /></td>
              <td className="px-2 py-1.5 font-semibold truncate max-w-[140px]">{p.charname}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function chunkRows(rows: RankedPlayer[], cols: number): RankedPlayer[][] {
  const size = Math.ceil(rows.length / cols);
  return Array.from({ length: cols }, (_, i) => rows.slice(i * size, (i + 1) * size));
}

export function LokiOverlayPage() {
  const { names: namesParam } = useSearch({ from: '/loki/overlay' });
  const names: string[] = useMemo(
    () => (namesParam ? namesParam.split(',').map((n) => n.trim()).filter(Boolean) : []),
    [namesParam],
  );

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['loki-rank'],
    queryFn: lokiApi.rank,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  const rows = useMemo(() => {
    if (!data || names.length === 0) return [];
    const set = new Set(names.map((n) => n.toLowerCase()));
    return data.players
      .map((p, i) => ({ ...p, originalRank: i + 1 }))
      .filter((p) => set.has(p.charname.toLowerCase()));
  }, [data, names]);

  const numCols = names.length >= 7 ? 3 : names.length >= 3 ? 2 : 1;
  const chunks = useMemo(() => chunkRows(rows, numCols), [rows, numCols]);

  const updatedAt = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null;

  if (names.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/80 text-white/50 text-xs">
        Nenhum jogador configurado. Use ?names=Nome1,Nome2 na URL.
      </div>
    );
  }

  return (
    <div className="p-3 font-sans">
      <div className="rounded-xl border border-white/10 bg-black/75 backdrop-blur-sm overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-yellow-400" />
            <span className="text-white font-bold text-xs tracking-wide">Loki 7 · Amigos</span>
          </div>
          {updatedAt && (
            <span className="text-white/30 text-[10px]">atualizado {updatedAt}</span>
          )}
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="px-3 py-3 space-y-1.5">
            {names.map((n) => (
              <div key={n} className="h-6 rounded bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="px-3 py-4 text-center text-red-400 text-xs">Erro ao carregar dados.</div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <div className="px-3 py-4 text-center text-white/30 text-xs">Nenhum jogador encontrado.</div>
        )}

        {/* Colunas dinâmicas */}
        {!isLoading && !isError && rows.length > 0 && (
          <div
            className="grid divide-x divide-white/10"
            style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
          >
            {chunks.map((chunk, i) => (
              <MiniTable key={i} rows={chunk} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
