import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearch, Link } from '@tanstack/react-router';
import { Layout } from '@/components/Layout';
import { Search, Trophy, ChevronLeft, ChevronRight, Crown, Flame } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { rankingsApi, playerApi, seasonApi, levelApi } from '@/lib/api';
import type { PlayerSeasonHistory } from '@/lib/api';
import { ARENA_TIME_LABELS } from '@wyd/shared';
import type { RankingPlayer, PlayerSearchResult } from '@wyd/shared';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multiselect';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { KingdomDot, GuildIcon } from '@/components/PlayerBadges';
import { TrendingTab } from '@/pages/players/TrendingTab';
import { CompareTab } from '@/pages/players/CompareTab';

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function RankingTable({ players, title }: { players: RankingPlayer[]; title: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: levelData } = useQuery({
    queryKey: ['level-ranking'],
    queryFn: levelApi.list,
    staleTime: 0,
  });

  const levelMap = useMemo(() => {
    const map = new Map<string, { kingdom: string | null; guildMark: string | null; level: number; levelSub: number }>();
    levelData?.data.forEach((p) => map.set(p.name, { kingdom: p.kingdom, guildMark: p.guildMark, level: p.level, levelSub: p.levelSub }));
    return map;
  }, [levelData]);

  const winnerNames = useMemo(() => players.filter((p) => p.wins > 0).map((p) => p.charName), [players]);

  const displayed = selected.length > 0
    ? players.filter((p) => selected.includes(p.charName))
    : players;

  const totalPages = Math.max(1, Math.ceil(displayed.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = displayed.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSelectChange(val: string[]) {
    setSelected(val);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Filtrar por vencedor</label>
        <MultiSelect
          options={winnerNames}
          selected={selected}
          onChange={handleSelectChange}
          placeholder={`Filtrar vencedores em ${title}...`}
        />
      </div>

      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Vitórias</TableHead>
              <TableHead className="text-center">Kills</TableHead>
              <TableHead className="text-center">Deaths</TableHead>
              <TableHead className="text-center">K/D</TableHead>
              <TableHead className="text-center">CS</TableHead>
              <TableHead className="text-center">Bonus Kill</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                  Nenhum jogador encontrado.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((p, i) => {
              const lvl = levelMap.get(p.charName);
              return (
                <TableRow key={p.charName} className={p.wins > 0 ? '' : 'opacity-50'}>
                  <TableCell className="text-xs text-muted-foreground">
                    {(currentPage - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {lvl && <KingdomDot kingdom={lvl.kingdom} />}
                      <GuildIcon guildMark={lvl?.guildMark} size={5} />
                      <Link to="/" search={{ q: p.charName }} className="hover:underline hover:text-primary">
                        {p.charName}
                      </Link>
                      {p.lastArena && (
                        <Tooltip content="Vencedor última arena">
                          <Crown className="h-3.5 w-3.5 text-primary shrink-0 cursor-default" />
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{p.wins}</TableCell>
                  <TableCell className="text-center">
                    {p.kills}
                    {p.lastArena && p.lastArena.killsDelta > 0 && (
                      <span className="ml-1 text-xs text-primary">(+{p.lastArena.killsDelta})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {p.deaths}
                    {p.lastArena && p.lastArena.deathsDelta > 0 && (
                      <span className="ml-1 text-xs text-muted-foreground">(+{p.lastArena.deathsDelta})</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center tabular-nums text-muted-foreground">
                    {(p.kills / Math.max(1, p.deaths)).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">{p.points}</TableCell>
                  <TableCell className="text-center">{p.bonusKill}</TableCell>
                  <TableCell className="text-center font-semibold">{p.total}</TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground tabular-nums">
                    {lvl ? `${lvl.level}/${lvl.levelSub}` : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Linhas por página:</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="rounded border bg-background px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-4">
          <span>
            {displayed.length === 0
              ? '0 resultados'
              : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, displayed.length)} de ${displayed.length}`}
          </span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(m, 10) - 1]} ${y}`;
}

const DIVISION_LABELS: Record<string, string> = { champion: 'Champion', aspirant: 'Aspirant' };


function PlayerHistory({ result }: { result: PlayerSearchResult }) {
  const { data: seasonHistory } = useQuery({
    queryKey: ['season-history', result.name],
    queryFn: () => seasonApi.getPlayerHistory(result.name),
  });

  const { data: levelList } = useQuery({
    queryKey: ['level-ranking'],
    queryFn: levelApi.list,
    staleTime: 0,
  });

  const levelData = useMemo(
    () => levelList?.data.find((p) => p.name === result.name) ?? null,
    [levelList, result.name],
  );

  const { data: rankings } = useQuery({
    queryKey: ['rankings'],
    queryFn: rankingsApi.get,
  });

  const { data: partners } = useQuery({
    queryKey: ['partners', result.id],
    queryFn: () => playerApi.partners(result.id),
    enabled: result.totalWins > 0,
  });

  const arenaRank = useMemo(() => {
    if (!rankings) return null;
    const champIdx = rankings.champion.findIndex((p) => p.charName === result.name);
    if (champIdx !== -1) return { division: 'Champion', rank: champIdx + 1 };
    const aspIdx = rankings.aspirant.findIndex((p) => p.charName === result.name);
    if (aspIdx !== -1) return { division: 'Aspirant', rank: aspIdx + 1 };
    return null;
  }, [rankings, result.name]);

  const rankingStats = useMemo(() => {
    if (!rankings) return null;
    return (
      rankings.champion.find((p) => p.charName === result.name) ??
      rankings.aspirant.find((p) => p.charName === result.name) ??
      null
    );
  }, [rankings, result.name]);

  const months = useMemo(() => {
    const set = new Set(result.history.map((h) => h.arenaDate.slice(0, 7)));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [result.history]);

  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  const filtered = useMemo(() =>
    selectedMonth === 'all'
      ? result.history
      : result.history.filter((h) => h.arenaDate.startsWith(selectedMonth)),
    [result.history, selectedMonth],
  );

  const stats = useMemo(() => ({
    arenas: filtered.length,
    wins: filtered.filter((h) => h.winner).length,
    kills: filtered.reduce((s, h) => s + h.kills, 0),
    deaths: filtered.reduce((s, h) => s + h.deaths, 0),
  }), [filtered]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {levelData && <KingdomDot kingdom={levelData.kingdom} />}
              <GuildIcon guildMark={levelData?.guildMark} size={5} />
              <h3 className="text-base font-semibold">{result.name}</h3>
            </div>
            {result.totalWins > 0 && (
              <Badge variant="success" className="gap-1">
                <Trophy className="h-3 w-3" />
                {result.totalWins} vitórias
              </Badge>
            )}
            {result.currentStreak > 1 && (
              <Badge variant="default" className="gap-1 bg-orange-500/15 text-orange-400 border-orange-500/30">
                <Flame className="h-3 w-3" />
                {result.currentStreak} seguidas
              </Badge>
            )}
            {result.bestStreak > 1 && (
              <span className="text-xs text-muted-foreground">
                recorde: {result.bestStreak} seguidas
              </span>
            )}
            {levelData && (
              <span className="text-xs text-muted-foreground">
                Lv {levelData.somaLevel} ({levelData.level}/{levelData.levelSub})
              </span>
            )}
            {arenaRank && (
              <span className={`text-xs font-semibold ${
                arenaRank.rank === 1 ? 'text-yellow-400' :
                arenaRank.rank === 2 ? 'text-slate-300' :
                arenaRank.rank === 3 ? 'text-amber-600' :
                'text-muted-foreground'
              }`}>
                #{arenaRank.rank} {arenaRank.division}
              </span>
            )}
          </div>
          {months.length > 1 && (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded border bg-background px-2 py-1 text-sm"
            >
              <option value="all">Todos os meses</option>
              {months.map((m) => (
                <option key={m} value={m}>{fmtMonth(m)}</option>
              ))}
            </select>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-sm">
          <div><p className="text-muted-foreground">Arenas</p><p className="font-medium">{stats.arenas}</p></div>
          <div><p className="text-muted-foreground">Vitórias</p><p className="font-medium">{stats.wins}</p></div>
          <div><p className="text-muted-foreground">Kills</p><p className="font-medium">{selectedMonth === 'all' ? (rankingStats?.kills ?? stats.kills) : stats.kills}</p></div>
          <div><p className="text-muted-foreground">Deaths</p><p className="font-medium">{selectedMonth === 'all' ? (rankingStats?.deaths ?? stats.deaths) : stats.deaths}</p></div>
        </div>

        {partners && partners.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Com quem mais ganhou
            </p>
            <div className="flex flex-wrap gap-2">
              {partners.map((p, i) => (
                <Link
                  key={p.name}
                  to="/"
                  search={{ q: p.name }}
                  className="flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs hover:border-primary hover:text-primary transition-colors"
                >
                  <span className={`font-mono font-bold ${i === 0 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                    {p.winsTogether}×
                  </span>
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {seasonHistory && seasonHistory.top10Count > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Histórico de Seasons
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span><span className="font-semibold text-foreground">{seasonHistory.top1Count}×</span> 1º lugar</span>
              <span><span className="font-semibold text-foreground">{seasonHistory.top10Count}×</span> top 10</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {seasonHistory.history.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs w-5 text-center font-bold ${s.rank === 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                    #{s.rank}
                  </span>
                  <span className="text-muted-foreground">{fmtMonth(s.month)}</span>
                  <span className="text-xs border border-border rounded px-1.5 py-0.5">{DIVISION_LABELS[s.division] ?? s.division}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{s.wins} vitórias</span>
                  <span>{s.kills} kills</span>
                  <span className="font-semibold text-foreground">{s.total} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-lg border bg-card overflow-x-auto">
          <div className="border-b px-4 py-3 text-sm font-medium">
            {selectedMonth === 'all' ? 'Histórico completo' : `Histórico — ${fmtMonth(selectedMonth)}`}
            <span className="ml-2 text-muted-foreground">
              ({filtered.length} arena{filtered.length !== 1 ? 's' : ''}{stats.wins > 0 ? ` · ${stats.wins} vitória${stats.wins !== 1 ? 's' : ''}` : ''})
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Arena</TableHead>
                <TableHead className="text-center">Kills</TableHead>
                <TableHead className="text-center">Deaths</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((h) => (
                <TableRow key={h.arenaId}>
                  <TableCell>{fmtDate(h.arenaDate)}</TableCell>
                  <TableCell>{ARENA_TIME_LABELS[h.arenaNumber] ?? `#${h.arenaNumber}`}</TableCell>
                  <TableCell className="text-center">{h.kills}</TableCell>
                  <TableCell className="text-center">{h.deaths}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {filtered.length === 0 && selectedMonth !== 'all' && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Nenhuma arena em {fmtMonth(selectedMonth)}.
        </p>
      )}
    </div>
  );
}

function PlayerSearch({ initialQ }: { initialQ?: string }) {
  const [input, setInput] = useState(initialQ ?? '');
  const [query, setQuery] = useState(initialQ ?? '');

  useEffect(() => {
    if (initialQ) setQuery(initialQ);
  }, [initialQ]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['players-search', query],
    queryFn: () => playerApi.search(query),
    enabled: query.length >= 2,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setQuery(input.trim())}
          placeholder="Nome do jogador (mín. 2 caracteres)..."
          className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          onClick={() => setQuery(input.trim())}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
      </div>

      {(isLoading || isFetching) && query && (
        <p className="py-8 text-center text-sm text-muted-foreground">Buscando...</p>
      )}
      {data && !isFetching && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhum jogador encontrado para "{query}".</p>
      )}
      {data && !isFetching && data.map((result) => (
        <PlayerHistory key={result.id} result={result} />
      ))}
    </div>
  );
}

export function PlayersPage() {
  const { q } = useSearch({ from: '/' });
  const [tab, setTab] = useState<string>(q ? 'search' : 'champion');

  useEffect(() => {
    if (q) setTab('search');
  }, [q]);

  const { data, isLoading } = useQuery({
    queryKey: ['rankings'],
    queryFn: rankingsApi.get,
  });

  return (
    <Layout>
      {isLoading && <p className="py-12 text-center text-muted-foreground">Carregando rankings...</p>}
      {data && (
        <>
        <div className="sm:hidden mb-4">
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value)}
            className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-medium"
          >
            <option value="champion">Champion</option>
            <option value="aspirant">Aspirant</option>
            <option value="trending">Em Alta</option>
            <option value="compare">Comparar</option>
            <option value="search">Pesquisar Player</option>
          </select>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="hidden sm:flex">
            <TabsTrigger value="champion">Champion</TabsTrigger>
            <TabsTrigger value="aspirant">Aspirant</TabsTrigger>
            <TabsTrigger value="trending">Em Alta</TabsTrigger>
            <TabsTrigger value="compare">Comparar</TabsTrigger>
            <TabsTrigger value="search">Pesquisar Player</TabsTrigger>
          </TabsList>
          <TabsContent value="champion">
            <RankingTable players={data.champion} title="Champion" />
          </TabsContent>
          <TabsContent value="aspirant">
            <RankingTable players={data.aspirant} title="Aspirant" />
          </TabsContent>
          <TabsContent value="trending">
            <TrendingTab />
          </TabsContent>
          <TabsContent value="compare">
            <CompareTab />
          </TabsContent>
          <TabsContent value="search">
            <PlayerSearch initialQ={q} />
          </TabsContent>
        </Tabs>
        </>
      )}
    </Layout>
  );
}
