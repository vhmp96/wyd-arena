import { MARCOS, MARCO_CATEGORIES, resolveMarcos, calcScoreQuest } from '@/lib/lokiStorage';
import type { LokiState } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

interface Props {
  state: LokiState;
  onToggleMarco: (id: string, value: boolean) => void;
}

export function MarcosSection({ state, onToggleMarco }: Props) {
  const scoreQuest = calcScoreQuest(state.quests);
  const resolved = resolveMarcos(
    state.marcos,
    scoreQuest,
    state.equipment,
    state.mountEvo,
    state.mountLevel,
    state.mountQuality,
  );

  const totalLokiCoins = MARCOS.reduce((sum, m) => sum + (resolved[m.id] ? m.lokiCoins : 0), 0);
  const totalHonorCoins = MARCOS.reduce((sum, m) => sum + (resolved[m.id] ? (m.honorCoins ?? 0) : 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border bg-card px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Loki Coins ganhos</p>
          <p className="text-2xl font-bold text-yellow-400">{totalLokiCoins}</p>
          <p className="text-xs text-muted-foreground">de 310 máx.</p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">Honor Coins ganhos</p>
          <p className="text-2xl font-bold text-purple-400">{totalHonorCoins}</p>
          <p className="text-xs text-muted-foreground">de 5 máx.</p>
        </div>
      </div>

      {/* Marcos by category */}
      {MARCO_CATEGORIES.map((cat) => {
        const catMarcos = MARCOS.filter((m) => m.category === cat.id);
        const catDone = catMarcos.filter((m) => resolved[m.id]).length;

        return (
          <div key={cat.id} className="rounded-lg border bg-card overflow-hidden">
            <div className="border-b px-4 py-2.5 flex items-center justify-between bg-muted/20">
              <span className="text-sm font-semibold">{cat.label}</span>
              <span className="text-xs text-muted-foreground">
                {catDone}/{catMarcos.length}
              </span>
            </div>
            <div className="divide-y divide-border">
              {catMarcos.map((m) => {
                const done = !!resolved[m.id];
                return (
                  <div
                    key={m.id}
                    className={cn('flex items-center gap-3 px-4 py-2.5', done && 'bg-emerald-950/20')}
                  >
                    {m.auto ? (
                      <div
                        className={cn(
                          'h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                          done ? 'border-emerald-500 bg-emerald-500/30' : 'border-border',
                        )}
                      >
                        {done && (
                          <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={(e) => onToggleMarco(m.id, e.target.checked)}
                        className="rounded border-border accent-emerald-500 h-4 w-4 shrink-0"
                      />
                    )}

                    <span className={cn('flex-1 text-sm', done && 'line-through text-muted-foreground')}>
                      {m.label}
                    </span>

                    {m.honorCoins ? (
                      <span className={cn('text-sm font-semibold shrink-0', done ? 'text-purple-400' : 'text-muted-foreground')}>
                        {m.honorCoins} <span className="text-xs font-normal">honor</span>
                      </span>
                    ) : (
                      <span className={cn('text-sm font-semibold shrink-0', done ? 'text-yellow-400' : 'text-muted-foreground')}>
                        {m.lokiCoins} <span className="text-xs font-normal">coins</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted-foreground">
        Marcos automáticos (círculo) são calculados com base nos seus dados. Os manuais (checkbox) você marca quando completar no jogo.
      </p>
    </div>
  );
}
