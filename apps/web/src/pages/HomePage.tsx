import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { arenaApi, rankingsApi, levelApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MultiSelect } from '@/components/ui/multiselect';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { ARENA_TIME_LABELS } from '@wyd/shared';
import type { ListArenasQueryDto, ArenaDiv } from '@wyd/shared';
import { KingdomDot, GuildIcon } from '@/components/PlayerBadges';

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

const DIVISION_LABELS: Record<string, string> = {
  champion: 'Champion',
  aspirant: 'Aspirant',
};

function ArenaDetailModal({ arenaId, open, onClose }: { arenaId: string; open: boolean; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['arena', arenaId],
    queryFn: () => arenaApi.get(arenaId),
    enabled: open && !!arenaId,
  });

  const { data: rankings } = useQuery({
    queryKey: ['rankings'],
    queryFn: rankingsApi.get,
    enabled: open,
  });

  const { data: levelList } = useQuery({
    queryKey: ['level-ranking'],
    queryFn: levelApi.list,
    staleTime: 0,
    enabled: open,
  });

  const rankMap = useMemo(() => {
    if (!rankings || !data) return {} as Record<string, number>;
    const list = data.division === 'champion' ? rankings.champion : rankings.aspirant;
    return Object.fromEntries(list.map((p, i) => [p.charName, i + 1]));
  }, [rankings, data]);

  const levelMap = useMemo(() => {
    const map = new Map<string, { kingdom: string | null; guildMark: string | null }>();
    levelList?.data.forEach((p) => map.set(p.name, { kingdom: p.kingdom, guildMark: p.guildMark }));
    return map;
  }, [levelList]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          {data ? (
            <DialogTitle className="flex items-center gap-2">
              {fmtDate(data.arenaDate)} · {ARENA_TIME_LABELS[data.arenaNumber] ?? `#${data.arenaNumber}`}
              <Badge variant="outline" className="ml-1">{DIVISION_LABELS[data.division] ?? data.division}</Badge>
            </DialogTitle>
          ) : (
            <DialogTitle>Arena</DialogTitle>
          )}
        </DialogHeader>

        <div className="px-6 pb-6">
          {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}
          {data && data.players.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Nenhum jogador registrado.</p>
          )}
          {data && data.players.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jogador</TableHead>
                  <TableHead className="text-center">Kills</TableHead>
                  <TableHead className="text-center">Deaths</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.players.map((p) => {
                  const lvl = levelMap.get(p.playerName);
                  return (
                    <TableRow key={p.id} className="text-sm">
                      <TableCell className="py-1.5 font-medium">
                        <div className="flex items-center gap-1.5">
                          {rankMap[p.playerName] !== undefined && (
                            <Tooltip content="Rank mais recente">
                              <span className={`font-mono text-xs font-bold w-6 text-right shrink-0 cursor-default ${
                                rankMap[p.playerName] === 1 ? 'text-yellow-400' :
                                rankMap[p.playerName] === 2 ? 'text-slate-300' :
                                rankMap[p.playerName] === 3 ? 'text-amber-600' :
                                'text-muted-foreground'
                              }`}>
                                #{rankMap[p.playerName]}
                              </span>
                            </Tooltip>
                          )}
                          {lvl && <KingdomDot kingdom={lvl.kingdom} />}
                          <GuildIcon guildMark={lvl?.guildMark} size={4} />
                          <Link
                            to="/"
                            search={{ q: p.playerName }}
                            className="hover:underline hover:text-primary"
                            onClick={onClose}
                          >
                            {p.playerName}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-center">{p.killsDelta}</TableCell>
                      <TableCell className="py-1.5 text-center">{p.deathsDelta}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ArenaTable({ division, winnerOptions }: { division: ArenaDiv; winnerOptions: string[] }) {
  const [dateInput, setDateInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [selectedWinners, setSelectedWinners] = useState<string[]>([]);
  const [filters, setFilters] = useState<ListArenasQueryDto>({ division });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedArenaId, setSelectedArenaId] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['arenas', filters],
    queryFn: () => arenaApi.list(filters),
  });

  function handleSearch() {
    setFilters({
      division,
      arenaDate: dateInput || undefined,
      arenaNumber: numberInput ? Number(numberInput) : undefined,
      winnerNames: selectedWinners.length > 0 ? selectedWinners : undefined,
    });
    setPage(1);
  }

  const allRows = data?.data ?? [];
  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = allRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label>Data</Label>
            <DatePicker value={dateInput} onChange={setDateInput} />
          </div>
          <div className="w-full sm:w-44 space-y-1">
            <Label htmlFor={`arenaNumber-${division}`}>Arena</Label>
            <select
              id={`arenaNumber-${division}`}
              value={numberInput}
              onChange={(e) => setNumberInput(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Todas</option>
              {Object.entries(ARENA_TIME_LABELS).map(([num, label]) => (
                <option key={num} value={num}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <Label>Filtrar por vencedor</Label>
          <MultiSelect
            options={winnerOptions}
            selected={selectedWinners}
            onChange={setSelectedWinners}
            placeholder="Selecionar vencedores..."
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSearch} className="gap-2">
            <Search className="h-4 w-4" />
            Pesquisar
          </Button>
        </div>
      </div>

      {isLoading && <p className="py-10 text-center text-muted-foreground">Carregando...</p>}
      {isError && <p className="py-10 text-center text-destructive">Erro ao carregar. Verifique se a API está rodando.</p>}

      {data && (
        <>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Arena</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-12 text-center text-muted-foreground">
                      Nenhuma arena encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {pageRows.map((arena) => (
                  <TableRow
                    key={arena.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedArenaId(arena.id)}
                  >
                    <TableCell className="py-2">{fmtDate(arena.arenaDate)}</TableCell>
                    <TableCell className="py-2">{ARENA_TIME_LABELS[arena.arenaNumber] ?? `#${arena.arenaNumber}`}</TableCell>
                  </TableRow>
                ))}
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
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {allRows.length === 0
                  ? '0 resultados'
                  : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, allRows.length)} de ${allRows.length}`}
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
        </>
      )}

      {selectedArenaId && (
        <ArenaDetailModal
          arenaId={selectedArenaId}
          open={!!selectedArenaId}
          onClose={() => setSelectedArenaId(null)}
        />
      )}
    </div>
  );
}

function LastWinnersSidebar({ division }: { division: ArenaDiv }) {
  const { data: rankings } = useQuery({
    queryKey: ['rankings'],
    queryFn: rankingsApi.get,
  });

  const { data: levelList } = useQuery({
    queryKey: ['level-ranking'],
    queryFn: levelApi.list,
    staleTime: 0,
  });

  const levelMap = useMemo(() => {
    const map = new Map<string, { kingdom: string | null; guildMark: string | null }>();
    levelList?.data.forEach((p) => map.set(p.name, { kingdom: p.kingdom, guildMark: p.guildMark }));
    return map;
  }, [levelList]);

  const label = division === 'champion' ? 'Champion' : 'Aspirant';

  // Antes só vinha quem tinha vencido — agora vem todo mundo que participou da
  // última arena (o backend já não filtra mais por vencedor). O campo "winner"
  // continua disponível pra destacar quem de fato ganhou dentro da lista geral.
  const participantes = (division === 'champion' ? rankings?.champion : rankings?.aspirant)
    ?.filter((p) => p.lastArena)
    .sort((a, b) => (b.lastArena?.killsDelta ?? 0) - (a.lastArena?.killsDelta ?? 0))
    ?? [];

  if (!rankings) return null;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        Última Arena {label} <span className="normal-case font-normal">(geral)</span>
      </p>
      {participantes.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-2">Nenhum resultado recente</p>
      ) : (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left pb-1 font-medium">Nome</th>
              <th className="text-center pb-1 font-medium w-8">K</th>
              <th className="text-center pb-1 font-medium w-8">D</th>
            </tr>
          </thead>
          <tbody>
            {participantes.map((p) => {
              const lvl = levelMap.get(p.charName);
              return (
                <tr key={p.charName} className="border-b border-border/40 last:border-0">
                  <td className="py-1 pr-1">
                    <div className="flex items-center gap-1">
                      {p.lastArena?.winner && (
                        <span title="Venceu essa arena" className="shrink-0">🏆</span>
                      )}
                      {lvl?.kingdom && (
                        <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${lvl.kingdom === 'blue' ? 'bg-blue-500' : 'bg-red-500'}`} />
                      )}
                      {lvl?.guildMark && (
                        <img
                          src={`https://wydmisc.raidhut.com.br/guild/img_guilds/global/${lvl.guildMark}.bmp`}
                          alt=""
                          className="h-4 w-4 shrink-0 object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <Link
                        to="/"
                        search={{ q: p.charName }}
                        className="font-medium hover:underline hover:text-primary truncate block max-w-[100px]"
                      >
                        {p.charName}
                      </Link>
                    </div>
                  </td>
                  <td className="py-1 text-center tabular-nums text-primary">{p.lastArena!.killsDelta}</td>
                  <td className="py-1 text-center tabular-nums text-muted-foreground">{p.lastArena!.deathsDelta}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function HomePage() {
  const [tab, setTab] = useState<string>('champion');

  const { data: rankings } = useQuery({
    queryKey: ['rankings'],
    queryFn: rankingsApi.get,
  });

  const championWinners = rankings?.champion.filter((p) => p.wins > 0).map((p) => p.charName) ?? [];
  const aspirantWinners = rankings?.aspirant.filter((p) => p.wins > 0).map((p) => p.charName) ?? [];

  return (
    <Layout>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="sm:col-span-3">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="champion">Champion</TabsTrigger>
              <TabsTrigger value="aspirant">Aspirant</TabsTrigger>
            </TabsList>
            <TabsContent value="champion">
              <ArenaTable division="champion" winnerOptions={championWinners} />
            </TabsContent>
            <TabsContent value="aspirant">
              <ArenaTable division="aspirant" winnerOptions={aspirantWinners} />
            </TabsContent>
          </Tabs>
        </div>
        <div className="sm:col-span-1 sm:pt-10">
          <LastWinnersSidebar division={tab as ArenaDiv} />
        </div>
      </div>
    </Layout>
  );
}
