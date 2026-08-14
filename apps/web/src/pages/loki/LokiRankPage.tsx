import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gem, Crown, Trophy, Star, Award, Cog, Search, ChevronLeft, ChevronRight, Users, Tv2, Check, RefreshCw } from 'lucide-react';
import { lokiApi } from '@/lib/api';
import type { LokiRankPlayer } from '@/lib/api';
import { TIERS } from '@/lib/lokiStorage';
import type { TierDef } from '@/lib/lokiStorage';
import { Tooltip } from '@/components/ui/tooltip';
import { MultiSelect } from '@/components/ui/multiselect';
import { cn } from '@/lib/utils';

const CLASS_NAMES: Record<number, string> = {
  0: 'TK', 1: 'Foema', 2: 'BM', 3: 'Huntress',
  4: 'Mortal', 5: 'Celestia', 6: 'Champion', 7: 'Slayer',
  8: 'Seraph', 9: 'Dragon', 10: 'Barbarian', 11: 'Arch',
};

const TIER_ICONS: Record<string, React.ElementType> = {
  diamante: Gem, platina: Crown, ouro: Trophy,
  prata: Star, bronze: Award, ferro: Cog,
};

const PAGE_SIZE = 50;
const FRIENDS_KEY = 'loki7_friends';

function loadFriends(): string[] {
  try { return JSON.parse(localStorage.getItem(FRIENDS_KEY) ?? '[]') as string[]; }
  catch { return []; }
}

function getTierByRank(pos: number): TierDef | null {
  let acc = 0;
  for (const tier of TIERS) {
    acc += tier.slots;
    if (pos <= acc) return tier;
  }
  return null;
}

function fmt(n: number) { return n.toLocaleString('pt-BR'); }

const TIER_TOOLTIP_CONTENT: Record<string, React.ReactNode> = Object.fromEntries(
  TIERS.map((tier) => [
    tier.id,
    <div className="space-y-1 text-left">
      <p className={cn('font-bold', tier.color)}>{tier.label}</p>
      <p className="text-muted-foreground">Top {tier.slots} jogadores</p>
    </div>,
  ]),
);

function TierIcon({ tier }: { tier: TierDef | null }) {
  if (!tier) return <span className="text-muted-foreground text-xs">—</span>;
  const Icon = TIER_ICONS[tier.id] ?? Cog;
  return (
    <Tooltip content={TIER_TOOLTIP_CONTENT[tier.id]}>
      <span className="cursor-default inline-flex">
        <Icon className={cn('h-4 w-4', tier.color)} />
      </span>
    </Tooltip>
  );
}

function sq(p: LokiRankPlayer) { return p.sumQuest50 + p.sumQuest51 + p.sumQuest52; }

function TableSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="hidden sm:block">
        <div className="border-b bg-muted/30 px-4 py-2 flex gap-4">
          {[40, 32, 160, 80, 100, 100, 100].map((w, i) => (
            <div key={i} className="h-3 rounded animate-pulse bg-muted" style={{ width: w }} />
          ))}
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b last:border-0 px-4 py-3 flex gap-4 items-center">
            {[40, 32, 140, 80, 90, 90, 90].map((w, j) => (
              <div key={j} className="h-3 rounded animate-pulse bg-muted/60" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
      <div className="sm:hidden divide-y divide-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-3 py-3 space-y-2">
            <div className="flex justify-between">
              <div className="flex gap-2 items-center">
                <div className="h-3 w-6 rounded animate-pulse bg-muted/60" />
                <div className="h-3 w-4 rounded animate-pulse bg-muted/60" />
                <div className="h-3 w-28 rounded animate-pulse bg-muted/60" />
              </div>
              <div className="h-3 w-16 rounded animate-pulse bg-muted/60" />
            </div>
            <div className="flex gap-4 pl-8">
              <div className="h-2.5 w-20 rounded animate-pulse bg-muted/40" />
              <div className="h-2.5 w-20 rounded animate-pulse bg-muted/40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type RankedPlayer = LokiRankPlayer & { originalRank: number };

function RankTable({ rows }: { rows: RankedPlayer[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b text-muted-foreground uppercase tracking-wider bg-muted/30">
          <th className="px-2 py-1.5 text-center font-medium w-8">Pos</th>
          <th className="px-2 py-1.5 text-center font-medium w-7">Tier</th>
          <th className="px-2 py-1.5 text-left font-medium">Jogador</th>
          <th className="px-2 py-1.5 text-center font-medium hidden lg:table-cell">Cl.</th>
          <th className="px-2 py-1.5 text-right font-medium hidden xl:table-cell">Quest</th>
          <th className="px-2 py-1.5 text-right font-medium hidden xl:table-cell">Power</th>
          <th className="px-2 py-1.5 text-right font-medium">Score</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((p) => {
          const scoreQ = sq(p);
          const tier = getTierByRank(p.originalRank);
          return (
            <tr key={p.charname} className="hover:bg-muted/20 transition-colors">
              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground">{p.originalRank}º</td>
              <td className="px-2 py-1.5 text-center"><TierIcon tier={tier} /></td>
              <td className="px-2 py-1.5 font-medium truncate max-w-[120px]">{p.charname}</td>
              <td className="px-2 py-1.5 text-center text-muted-foreground hidden lg:table-cell">{CLASS_NAMES[p.class] ?? `${p.class}`}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground hidden xl:table-cell">{scoreQ}</td>
              <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground hidden xl:table-cell">{fmt(p.maxPR)}</td>
              <td className="px-2 py-1.5 text-right tabular-nums font-semibold text-primary">{fmt(p.totalScore)}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function LokiRankTab() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [friends, setFriends] = useState<string[]>(loadFriends);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ['loki-rank'],
    queryFn: lokiApi.rank,
    staleTime: 30 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 30 * 1000,
  });

  const ranked = useMemo(
    () => (data?.players ?? []).map((p, i) => ({ ...p, originalRank: i + 1 })),
    [data],
  );

  const allNames = useMemo(() => ranked.map((p) => p.charname), [ranked]);

  const friendRows = useMemo(() => {
    if (friends.length === 0) return [];
    const set = new Set(friends.map((f) => f.toLowerCase()));
    return ranked.filter((p) => set.has(p.charname.toLowerCase()));
  }, [ranked, friends]);

  const generalFiltered = useMemo(() => {
    if (!search) return ranked;
    return ranked.filter((p) => p.charname.toLowerCase().includes(search.toLowerCase()));
  }, [ranked, search]);

  const totalPages = Math.max(1, Math.ceil(generalFiltered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRows = generalFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFriendsChange(selected: string[]) {
    setFriends(selected);
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(selected));
  }

  function handleCopyObs() {
    const url = `${window.location.origin}/loki/overlay?names=${friends.map(encodeURIComponent).join(',')}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSearch() {
    setSearch(searchRef.current?.value.trim() ?? '');
    setPage(1);
  }

  const tierLegend = (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      {TIERS.map((t) => {
        const Icon = TIER_ICONS[t.id] ?? Cog;
        return (
          <span key={t.id} className="flex items-center gap-1">
            <Icon className={cn('h-3.5 w-3.5', t.color)} />
            <span className={t.color}>{t.label}</span>
          </span>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Tier legend */}
      {tierLegend}

      {/* Side-by-side layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

        {/* ── Amigos ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amigos</h2>
            {friends.length > 0 && (
              <button
                onClick={handleCopyObs}
                className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Tv2 className="h-3 w-3" />}
                {copied ? 'Copiado!' : 'OBS'}
              </button>
            )}
          </div>

          <MultiSelect
            options={allNames}
            selected={friends}
            onChange={handleFriendsChange}
            placeholder={isLoading ? 'Carregando jogadores...' : 'Adicionar amigos...'}
          />

          {isLoading && friends.length > 0 && <TableSkeleton />}

          {!isLoading && friendRows.length > 0 && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <RankTable rows={friendRows} />
            </div>
          )}

          {friends.length > 0 && friendRows.length === 0 && !isLoading && (
            <p className="text-xs text-muted-foreground px-1">Nenhum amigo encontrado no ranking.</p>
          )}

          {friends.length === 0 && (
            <p className="text-xs text-muted-foreground px-1">Selecione amigos para acompanhar aqui.</p>
          )}
        </div>

        {/* ── Rank Geral ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank Geral</h2>
            {isFetching && !isLoading && (
              <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
            )}
            {data && (
              <span className="text-xs text-muted-foreground ml-auto">{generalFiltered.length} jogadores</span>
            )}
          </div>

          <div className="flex gap-1.5">
            <input
              ref={searchRef}
              defaultValue=""
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nome..."
              className="flex h-8 flex-1 rounded-md border border-input bg-background px-3 text-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button
              onClick={handleSearch}
              className="flex items-center h-8 px-2.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>

          {isLoading && <TableSkeleton />}
          {isError && (
            <div className="rounded-lg border bg-card py-8 text-center text-xs text-red-400">Erro ao carregar ranking.</div>
          )}
          {!isLoading && !isError && (
            <div className="rounded-lg border bg-card overflow-hidden">
              <RankTable rows={pageRows} />
              {generalFiltered.length === 0 && (
                <div className="py-8 text-center text-xs text-muted-foreground">Nenhum jogador encontrado.</div>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">Pág. {currentPage}/{totalPages}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-0.5 px-2 py-1 rounded border border-border text-xs disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="h-3 w-3" />
                  Ant.
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-0.5 px-2 py-1 rounded border border-border text-xs disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Próx.
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
