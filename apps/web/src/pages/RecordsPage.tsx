import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Swords, Flame, Trophy, Skull } from 'lucide-react';

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
function fmtMonth(ym: string) {
  const [y, m] = ym.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
}
import { Layout } from '@/components/Layout';
import { statsApi } from '@/lib/api';
import type { RecordEntry } from '@wyd/shared';

function RecordCard({
  title,
  icon,
  unit,
  entries,
}: {
  title: string;
  icon: React.ReactNode;
  unit: string;
  entries: RecordEntry[] | undefined;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3 text-sm font-medium flex items-center gap-2">
        {icon}
        {title}
      </div>
      <div className="divide-y divide-border">
        {(!entries || entries.length === 0) && (
          <p className="py-8 text-center text-sm text-muted-foreground">Sem dados ainda.</p>
        )}
        {entries?.map((e, i) => (
          <div key={`${e.charName}-${i}`} className="flex items-center justify-between px-4 py-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`font-mono text-xs w-5 text-center font-bold ${
                  i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                }`}
              >
                {i + 1}
              </span>
              <Link to="/" search={{ q: e.charName }} className="font-medium truncate hover:underline hover:text-primary">
                {e.charName}
              </Link>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {e.detail.replace(/^(\d{4}-\d{2})/, (_, ym) => fmtMonth(ym))}
              </span>
              <span className="font-semibold text-primary tabular-nums">
                {e.value} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecordsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['stats-records'],
    queryFn: statsApi.records,
  });

  return (
    <Layout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold">Recordes</h1>
          <p className="text-sm text-muted-foreground">Os maiores feitos registrados nas arenas.</p>
        </div>

        {isLoading && <p className="py-12 text-center text-muted-foreground">Carregando recordes...</p>}

        {data && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RecordCard
              title="Mais kills numa temporada"
              icon={<Swords className="h-4 w-4 text-red-400" />}
              unit="kills"
              entries={data.mostKillsSeason}
            />
            <RecordCard
              title="Mais mortes numa temporada"
              icon={<Skull className="h-4 w-4 text-slate-400" />}
              unit="mortes"
              entries={data.mostDeathsSeason}
            />
            <RecordCard
              title="Maiores sequências de vitória"
              icon={<Flame className="h-4 w-4 text-orange-400" />}
              unit="seguidas"
              entries={data.longestStreak}
            />
            <RecordCard
              title="Mais vitórias num dia"
              icon={<Trophy className="h-4 w-4 text-yellow-400" />}
              unit="vitórias"
              entries={data.mostWinsInDay}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
