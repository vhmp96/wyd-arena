import { LOKI_DATES, QUEST_DEFS, questKey, questEcForDay } from '@/lib/lokiStorage';
import type { LokiState, QuestDef } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

const DAY_LABELS = LOKI_DATES.map((d, i) => {
  const [, m, day] = d.split('-');
  return `Dia ${i + 1} (${day}/${m})`;
});

const MAX_NUMBERED = 12;

function isNumbered(q: QuestDef): boolean {
  return q.id.endsWith('_1') || q.id.endsWith('_2') || q.id.endsWith('_3');
}

function questFamily(id: string): string {
  return id.replace(/_(PLUS|MINUS|[123])$/, '');
}

function questNum(id: string): 1 | 2 | 3 | null {
  if (id.endsWith('_1')) return 1;
  if (id.endsWith('_2')) return 2;
  if (id.endsWith('_3')) return 3;
  return null;
}

const NOT_DONE_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'border-l-white bg-slate-600/70',
  2: 'border-l-slate-300 bg-slate-700/60',
  3: 'border-l-slate-500 bg-slate-800/50',
};

const DONE_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'border-l-emerald-700 bg-emerald-950/50',
  2: 'border-l-emerald-500 bg-emerald-900/50',
  3: 'border-l-emerald-300 bg-emerald-800/50',
};

interface Props {
  state: LokiState;
  selectedDay: number;
  onDayChange: (day: number) => void;
  onToggleQuest: (key: string, value: boolean) => void;
}

export function QuestSection({ state, selectedDay, onDayChange, onToggleQuest }: Props) {
  const date = LOKI_DATES[selectedDay];
  const groupA = QUEST_DEFS.filter((q) => q.group === 'A');
  const groupB = QUEST_DEFS.filter((q) => q.group === 'B');

  const numberedChecked = QUEST_DEFS.filter(
    (q) => isNumbered(q) && !!state.quests[questKey(date, q.id)],
  ).length;
  const limitReached = numberedChecked >= MAX_NUMBERED;

  const dayTotals = (quests: QuestDef[]) =>
    quests.reduce(
      (acc, q) => {
        const done = !!state.quests[questKey(date, q.id)];
        return {
          ec: acc.ec + (done ? questEcForDay(q, selectedDay) : 0),
          sp: acc.sp + (done && q.sp !== null ? q.sp : 0),
        };
      },
      { ec: 0, sp: 0 },
    );

  const totA = dayTotals(groupA);
  const totB = dayTotals(groupB);

  const renderGroup = (quests: QuestDef[], title: string) => {
    const tots = quests === groupA ? totA : totB;
    return (
      <div className="flex-1 min-w-0 rounded-lg border bg-card">
        <div className="border-b px-4 py-2.5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </div>
        <div className="flex flex-col">
          {quests.map((q, i) => {
            const newFamily = i > 0 && questFamily(quests[i - 1].id) !== questFamily(q.id);
            const key = questKey(date, q.id);
            const done = !!state.quests[key];
            const numbered = isNumbered(q);
            const num = questNum(q.id);
            const disabled = numbered && !done && limitReached;
            const ec = questEcForDay(q, selectedDay);
            return (
              <label
                key={q.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-all border-l-[6px] cursor-pointer',
                  newFamily && 'mt-3',
                  disabled && 'cursor-not-allowed opacity-25',
                  num && done && DONE_CLASSES[num],
                  num && !done && !disabled && NOT_DONE_CLASSES[num],
                  num && !done && disabled && 'border-l-zinc-800 bg-zinc-900/30',
                  !numbered && done && 'border-l-sky-400 bg-sky-500/30',
                  !numbered && !done && 'border-l-sky-600 bg-sky-950/30 hover:bg-sky-950/40',
                )}
              >
                <input
                  type="checkbox"
                  checked={done}
                  disabled={disabled}
                  onChange={(e) => onToggleQuest(key, e.target.checked)}
                  className="rounded border-border accent-emerald-500 h-4 w-4 shrink-0"
                />
                <span className={cn(
                  'flex-1 text-sm',
                  done ? 'line-through text-muted-foreground/40' : 'text-foreground font-semibold',
                )}>
                  {q.label}
                </span>
                <span className={cn('text-xs tabular-nums shrink-0', done ? 'text-muted-foreground/40' : 'text-amber-400 font-semibold')}>
                  {ec} EC
                </span>
                {q.sp !== null ? (
                  <span className={cn(
                    'text-xs font-bold tabular-nums w-10 text-right shrink-0',
                    done ? 'text-muted-foreground/40' : 'text-emerald-400',
                  )}>
                    +{q.sp} SP
                  </span>
                ) : (
                  <span className="w-10" />
                )}
              </label>
            );
          })}
        </div>
        <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            <span className="text-amber-400 font-semibold">{tots.ec} EC</span> coletados
          </span>
          <span>
            <span className="text-primary font-semibold">+{tots.sp} SP</span> hoje
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Day selector — select on mobile, buttons on desktop */}
      <div className="sm:hidden">
        <select
          value={selectedDay}
          onChange={(e) => onDayChange(Number(e.target.value))}
          className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-medium"
        >
          {DAY_LABELS.map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
      </div>
      <div className="hidden sm:flex flex-wrap gap-1.5">
        {DAY_LABELS.map((label, i) => (
          <button
            key={i}
            onClick={() => onDayChange(i)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors border',
              selectedDay === i
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Quest counter */}
      <div className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5">
        <span className="text-sm text-muted-foreground">Quests entregues hoje</span>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: MAX_NUMBERED }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-full',
                  i < numberedChecked ? 'bg-emerald-500' : 'bg-border',
                )}
              />
            ))}
          </div>
          <span
            className={cn(
              'text-sm font-bold tabular-nums',
              numberedChecked >= MAX_NUMBERED ? 'text-emerald-400' : 'text-primary',
            )}
          >
            {numberedChecked} / {MAX_NUMBERED}
          </span>
        </div>
      </div>

      {/* Quest groups */}
      <div className="flex flex-col sm:flex-row gap-4">
        {renderGroup(groupA, 'Arenas')}
        {renderGroup(groupB, 'Outros')}
      </div>

      {/* Day summary */}
      <div className="rounded-lg border bg-muted/30 px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total do dia</span>
        <div className="flex items-center gap-6">
          <span>
            <span className="text-amber-400 font-semibold">{totA.ec + totB.ec}</span>{' '}
            <span className="text-muted-foreground text-xs">EC</span>
          </span>
          <span>
            <span className="text-primary font-semibold">+{totA.sp + totB.sp}</span>{' '}
            <span className="text-muted-foreground text-xs">SP</span>
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Quests com fundo azul podem ser entregues independentemente do limite diário.
      </p>
    </div>
  );
}
