import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { levelApi } from '@/lib/api';
import type { LevelPlayer } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { KingdomDot, GuildIcon } from '@/components/PlayerBadges';

const PAGE_SIZE_OPTIONS = [25, 50, 100];

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span>🥇</span>;
  if (rank === 2) return <span>🥈</span>;
  if (rank === 3) return <span>🥉</span>;
  return <span className="font-mono text-xs text-muted-foreground">{rank}</span>;
}

function LevelPlayersTab() {
  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['level-ranking'],
    queryFn: levelApi.list,
    staleTime: 0,
  });

  const filtered = useMemo(() => {
    const all = data?.data ?? [];
    if (!search) return all;
    return all.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function handleSearch() {
    setSearch(input.trim());
    setPage(1);
  }

  return (
    <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar por nome..."
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Buscar
            </Button>
            {search && (
              <Button variant="outline" onClick={() => { setSearch(''); setInput(''); setPage(1); }}>
                Limpar
              </Button>
            )}
          </div>
        </div>

        {isLoading && <p className="py-12 text-center text-muted-foreground">Carregando ranking...</p>}
        {isError && <p className="py-12 text-center text-destructive">Erro ao carregar.</p>}
        {!isLoading && !isError && data?.data.length === 0 && (
          <p className="py-12 text-center text-muted-foreground">
            Nenhum dado disponível. O snapshot é gerado às 3h diariamente.
          </p>
        )}

        {data && data.data.length > 0 && (
          <>
            <div className="rounded-lg border bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-10 text-center py-2">#</TableHead>
                    <TableHead className="py-2">Jogador</TableHead>
                    <TableHead className="text-center py-2 font-semibold">Level</TableHead>
                    <TableHead className="text-center py-2 font-semibold">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        Nenhum jogador encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {pageRows.map((p) => (
                    <TableRow key={p.id} className="text-xs">
                      <TableCell className="text-center py-1.5">
                        <RankBadge rank={p.rank} />
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <KingdomDot kingdom={p.kingdom} />
                          <GuildIcon guildMark={p.guildMark} size={5} />
                          <Link
                            to="/"
                            search={{ q: p.name }}
                            className="font-medium hover:underline hover:text-primary"
                          >
                            {p.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-1.5 tabular-nums text-muted-foreground">
                        {p.level}/{p.levelSub}
                      </TableCell>
                      <TableCell className="text-center py-1.5 tabular-nums font-semibold text-primary">
                        {p.somaLevel}
                      </TableCell>
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
                  {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {filtered.length === 0
                    ? '0 resultados'
                    : `${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filtered.length)} de ${filtered.length}`}
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

            <p className="text-center text-xs text-muted-foreground">
              {filtered.length} players · snapshot diário às 3h
            </p>
          </>
        )}
    </div>
  );
}

export function LevelRankingPage() {
  return (
    <Layout>
      <LevelPlayersTab />
    </Layout>
  );
}
