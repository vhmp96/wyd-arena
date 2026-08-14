import { TIERS, getCurrentTier } from '@/lib/lokiStorage';
import type { LokiState } from '@/lib/lokiStorage';
import { calcScoreQuest, calcScorePower } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

interface Props {
  state: LokiState;
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export function TiersSection({ state }: Props) {
  const scoreQuest = calcScoreQuest(state.quests);
  const scorePower = calcScorePower(state.equipment, state.mountEvo, state.mountLevel, state.mountQuality, state.weaponType);
  const currentTier = getCurrentTier(scoreQuest, scorePower);

  return (
    <div className="space-y-4">
      {/* Current standing */}
      <div className={cn(
        'rounded-lg border px-4 py-3 flex items-center justify-between',
        currentTier ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/20',
      )}>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Seu tier atual</p>
          <p className={cn('text-2xl font-bold', currentTier?.color ?? 'text-muted-foreground')}>
            {currentTier?.label ?? 'Abaixo de Ferro'}
          </p>
        </div>
        <div className="text-right text-sm space-y-1">
          <div>
            <span className="text-muted-foreground">Score Quest: </span>
            <span className="font-semibold text-primary">{scoreQuest}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Score Power: </span>
            <span className="font-semibold text-primary">{fmt(scorePower)}</span>
          </div>
        </div>
      </div>

      {/* ── Desktop table ───────────────────────────────── */}
      <div className="hidden sm:block rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
              <th className="px-4 py-2 text-left font-medium">Tier</th>
              <th className="px-4 py-2 text-center font-medium">Vagas</th>
              <th className="px-4 py-2 text-right font-medium">Score Quest mín.</th>
              <th className="px-4 py-2 text-right font-medium">Score Power mín.</th>
              <th className="px-4 py-2 text-center font-medium w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TIERS.map((tier) => {
              const meetsQuest = scoreQuest >= tier.minScoreQuest;
              const meetsPower = scorePower >= tier.minScorePower;
              const qualifies = meetsQuest && meetsPower;
              const isCurrent = currentTier?.id === tier.id;

              return (
                <tr
                  key={tier.id}
                  className={cn(
                    'transition-colors',
                    isCurrent && 'bg-primary/5',
                    !isCurrent && 'hover:bg-muted/20',
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={cn('font-bold text-base', tier.color)}>{tier.label}</span>
                    {isCurrent && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        atual
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    Top {tier.slots}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={meetsQuest ? 'text-emerald-400' : 'text-red-400'}>
                      {tier.minScoreQuest}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={meetsPower ? 'text-emerald-400' : (tier.minScorePower === 0 ? 'text-muted-foreground' : 'text-red-400')}>
                      {tier.minScorePower === 0 ? '—' : fmt(tier.minScorePower)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {qualifies ? (
                      <span className="text-emerald-400 text-xs font-medium">✓ Elegível</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ────────────────────────────────── */}
      <div className="sm:hidden rounded-lg border bg-card overflow-hidden divide-y divide-border">
        {TIERS.map((tier) => {
          const meetsQuest = scoreQuest >= tier.minScoreQuest;
          const meetsPower = scorePower >= tier.minScorePower;
          const qualifies = meetsQuest && meetsPower;
          const isCurrent = currentTier?.id === tier.id;

          return (
            <div
              key={tier.id}
              className={cn('px-3 py-2.5', isCurrent && 'bg-primary/5')}
            >
              {/* Row 1: tier name + vagas + status badge */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={cn('font-bold text-base', tier.color)}>{tier.label}</span>
                  {isCurrent && (
                    <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">atual</span>
                  )}
                  <span className="text-xs text-muted-foreground">Top {tier.slots}</span>
                </div>
                {qualifies ? (
                  <span className="text-emerald-400 text-xs font-medium">✓ Elegível</span>
                ) : (
                  <span className="text-muted-foreground text-xs">—</span>
                )}
              </div>
              {/* Row 2: requirements */}
              <div className="flex gap-4 text-xs pl-0.5">
                <div>
                  <span className="text-muted-foreground">Quest mín: </span>
                  <span className={cn('font-semibold tabular-nums', meetsQuest ? 'text-emerald-400' : 'text-red-400')}>
                    {tier.minScoreQuest}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Power mín: </span>
                  <span className={cn('font-semibold tabular-nums', meetsPower ? 'text-emerald-400' : (tier.minScorePower === 0 ? 'text-muted-foreground' : 'text-red-400'))}>
                    {tier.minScorePower === 0 ? '—' : fmt(tier.minScorePower)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Distribution note */}
      <div className="rounded-lg border bg-muted/20 px-4 py-3 text-xs text-muted-foreground space-y-1">
        <p className="font-medium text-foreground text-sm">Distribuição de jogadores</p>
        {TIERS.map((t) => (
          <p key={t.id}>
            <span className={cn('font-semibold', t.color)}>{t.label}:</span>{' '}
            {t.id === 'diamante' ? 'Top 10' : `Próximos ${t.slots}`} classificados com maior Loki Score que atendam o requisito mínimo.
          </p>
        ))}
      </div>
    </div>
  );
}
