import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { arenaApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Layout } from '@/components/Layout';
import { arenaDetailRoute } from '@/router';
import { ARENA_TIME_LABELS } from '@wyd/shared';

function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const DIVISION_LABELS: Record<string, string> = {
  champion: 'Champion',
  aspirant: 'Aspirant',
};

export function ArenaDetailPage() {
  const { id } = useParams({ from: arenaDetailRoute.id });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['arena', id],
    queryFn: () => arenaApi.get(id),
  });

  return (
    <Layout>
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-1.5 text-muted-foreground hover:text-foreground px-0">
          <Link to="/arenas">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Arenas
          </Link>
        </Button>
      </div>
      <div>
        {isLoading && (
          <div className="py-12 text-center text-muted-foreground">Carregando arena...</div>
        )}

        {isError && (
          <div className="py-12 text-center text-destructive">
            Erro ao carregar arena. Verifique se a API está rodando.
          </div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold">Detalhes da Arena</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">{fmtDate(data.arenaDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Arena</p>
                  <p className="font-medium">{ARENA_TIME_LABELS[data.arenaNumber] ?? `#${data.arenaNumber}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <Badge variant="outline" className="mt-0.5">
                    {DIVISION_LABELS[data.division] ?? data.division}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              <div className="border-b px-6 py-4">
                <h2 className="text-lg font-semibold">Jogadores</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jogador</TableHead>
                    <TableHead className="text-center">Kills</TableHead>
                    <TableHead className="text-center">Deaths</TableHead>
                    <TableHead className="text-center">Pontos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.players.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                        Nenhum jogador registrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {data.players.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        <Link
                          to="/"
                          search={{ q: p.playerName }}
                          className="hover:underline hover:text-primary"
                        >
                          {p.playerName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-center">{p.killsDelta}</TableCell>
                      <TableCell className="text-center">{p.deathsDelta}</TableCell>
                      <TableCell className="text-center">{p.pointsDelta}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
