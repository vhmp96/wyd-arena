import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Flame } from 'lucide-react';
import { statsApi } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const DIVISION_LABELS: Record<string, string> = { champion: 'Champion', aspirant: 'Aspirant' };

function Trending() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats-trending'],
    queryFn: statsApi.trending,
  });

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <div className="border-b px-4 py-3 text-sm font-medium flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-400" />
        Em alta — maiores ganhos de pontos (últimos 7 dias)
      </div>
      {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Sem dados suficientes ainda.</p>
      )}
      {data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Divisão</TableHead>
              <TableHead className="text-center">+Pontos</TableHead>
              <TableHead className="text-center">+Kills</TableHead>
              <TableHead className="text-center">+Vitórias</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p, i) => (
              <TableRow key={`${p.charName}-${p.division}`}>
                <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link to="/" search={{ q: p.charName }} className="hover:underline hover:text-primary">
                    {p.charName}
                  </Link>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {DIVISION_LABELS[p.division] ?? p.division}
                </TableCell>
                <TableCell className="text-center font-semibold text-primary">+{p.pointsGained}</TableCell>
                <TableCell className="text-center">+{p.killsGained}</TableCell>
                <TableCell className="text-center">+{p.winsGained}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function PeriodRanking() {
  const [range, setRange] = useState<'day' | 'week'>('day');
  const { data, isLoading } = useQuery({
    queryKey: ['stats-period', range],
    queryFn: () => statsApi.period(range),
  });

  return (
    <div className="rounded-lg border bg-card overflow-x-auto">
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium">Ranking por período</span>
        <div className="flex gap-1">
          <Button variant={range === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setRange('day')}>
            Último dia
          </Button>
          <Button variant={range === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setRange('week')}>
            Última semana
          </Button>
        </div>
      </div>
      {isLoading && <p className="py-8 text-center text-sm text-muted-foreground">Carregando...</p>}
      {data && data.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma arena no período.</p>
      )}
      {data && data.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Divisão</TableHead>
              <TableHead className="text-center">Vitórias</TableHead>
              <TableHead className="text-center">Kills</TableHead>
              <TableHead className="text-center">Deaths</TableHead>
              <TableHead className="text-center">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((p, i) => (
              <TableRow key={`${p.charName}-${p.division}`}>
                <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link to="/" search={{ q: p.charName }} className="hover:underline hover:text-primary">
                    {p.charName}
                  </Link>
                </TableCell>
                <TableCell className="text-center text-xs text-muted-foreground">
                  {DIVISION_LABELS[p.division] ?? p.division}
                </TableCell>
                <TableCell className="text-center">{p.wins}</TableCell>
                <TableCell className="text-center">{p.kills}</TableCell>
                <TableCell className="text-center">{p.deaths}</TableCell>
                <TableCell className="text-center font-semibold">{p.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function TrendingTab() {
  return (
    <div className="space-y-4">
      <Trending />
      <PeriodRanking />
    </div>
  );
}
