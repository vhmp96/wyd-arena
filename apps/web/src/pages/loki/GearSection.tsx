import { calcEquipScore, calcMountScore, SLOT_MAX_TIER } from '@/lib/lokiStorage';
import type { LokiState, EquipmentSlot } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

interface Props {
  state: LokiState;
  autoQuestScore: number;
  onEquipChange: (id: string, field: keyof EquipmentSlot, value: unknown) => void;
  onMountChange: (field: 'mountEvo' | 'mountLevel' | 'mountQuality', value: unknown) => void;
  onWeaponTypeChange: (wt: '1h' | '2h') => void;
  onManualQuestScoreChange: (v: number | undefined) => void;
}

const EVO_OPTIONS = [
  { value: '', label: '—' },
  { value: '1', label: '1ª' },
  { value: '2', label: '2ª' },
  { value: '3', label: '3ª' },
];

const MOUNT_MAX_LEVEL: Record<1 | 2 | 3, number> = { 1: 120, 2: 150, 3: 250 };
const MOUNT_MAX_QUALITY: Record<1 | 2 | 3, number> = { 1: 20, 2: 50, 3: 250 };
const WEAPON_IDS = new Set(['arma', 'escudo']);
const ACC_IDS = new Set(['brinco', 'colar', 'cinto', 'pedra1', 'pedra2', 'pedra3']);

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

function slotMaxRef(slot: EquipmentSlot): number {
  return slot.id === 'medalha' ? 15 : slot.evo === 3 ? 15 : 11;
}

function slotMaxTier(slot: EquipmentSlot): number {
  if (ACC_IDS.has(slot.id) && slot.evo) {
    return slot.evo === 1 ? 10 : slot.evo === 2 ? 20 : 30;
  }
  return SLOT_MAX_TIER[slot.id] ?? 30;
}

// ─── Desktop: table row ───────────────────────────────────────────────────────

function EquipRow({
  slot,
  score,
  onEquipChange,
}: {
  slot: EquipmentSlot;
  score: number;
  onEquipChange: (id: string, field: keyof EquipmentSlot, value: unknown) => void;
}) {
  const maxRef = slotMaxRef(slot);
  const maxTier = slotMaxTier(slot);

  return (
    <tr className="transition-colors hover:bg-muted/20">
      <td className="px-4 py-2 font-medium">{slot.label}</td>
      <td className="px-3 py-2 text-center">
        {slot.type === 'evo' ? (
          <select
            value={slot.evo ?? ''}
            onChange={(e) =>
              onEquipChange(slot.id, 'evo', e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : null)
            }
            className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-2 py-1 text-xs w-16 text-center outline-none transition-colors"
          >
            {EVO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-center">
        <div className="inline-flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={maxRef}
            value={slot.refinement}
            onChange={(e) => {
              const v = Math.min(maxRef, Math.max(0, Number(e.target.value) || 0));
              e.target.value = String(v);
              onEquipChange(slot.id, 'refinement', v);
            }}
            className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-2 py-1 text-xs w-12 text-center tabular-nums outline-none transition-colors"
          />
          <span className="text-xs text-muted-foreground">/{maxRef}</span>
        </div>
      </td>
      <td className="px-3 py-2 text-center">
        {slot.hasTier ? (
          <div className="inline-flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={maxTier}
              value={slot.tier}
              onChange={(e) => {
                const v = Math.min(maxTier, Math.max(0, Number(e.target.value) || 0));
                e.target.value = String(v);
                onEquipChange(slot.id, 'tier', v);
              }}
              className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-2 py-1 text-xs w-12 text-center tabular-nums outline-none transition-colors"
            />
            <span className="text-xs text-muted-foreground">/{maxTier}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <span className={score > 0 ? 'text-primary font-semibold tabular-nums' : 'text-muted-foreground tabular-nums'}>
          {fmt(score)}
        </span>
      </td>
    </tr>
  );
}

function DesktopEquipTable({
  slots,
  weaponType,
  footerLabel,
  onEquipChange,
}: {
  slots: EquipmentSlot[];
  weaponType: '1h' | '2h';
  footerLabel: string;
  onEquipChange: (id: string, field: keyof EquipmentSlot, value: unknown) => void;
}) {
  const total = slots.reduce((s, slot) => s + calcEquipScore(slot, weaponType), 0);
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider">
          <th className="px-4 py-3 text-left font-medium">Equipamento</th>
          <th className="px-3 py-3 text-center font-medium w-24">Evolução</th>
          <th className="px-3 py-3 text-center font-medium w-24">Refinação</th>
          <th className="px-3 py-3 text-center font-medium w-24">Tier Adicional</th>
          <th className="px-3 py-3 text-right font-medium w-32">Score Power</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {slots.map((slot) => (
          <EquipRow
            key={slot.id}
            slot={slot}
            score={calcEquipScore(slot, weaponType)}
            onEquipChange={onEquipChange}
          />
        ))}
      </tbody>
      <tfoot>
        <tr className="border-t bg-muted/30">
          <td colSpan={4} className="px-4 py-2 text-sm font-medium text-muted-foreground">
            {footerLabel}
          </td>
          <td className="px-3 py-2 text-right font-bold text-primary tabular-nums">
            {fmt(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}

// ─── Mobile: card per item ────────────────────────────────────────────────────

function MobileEquipCard({
  slot,
  score,
  onEquipChange,
}: {
  slot: EquipmentSlot;
  score: number;
  onEquipChange: (id: string, field: keyof EquipmentSlot, value: unknown) => void;
}) {
  const maxRef = slotMaxRef(slot);
  const maxTier = slotMaxTier(slot);

  return (
    <div className="px-3 py-2.5 border-b last:border-b-0">
      {/* Row 1: name + score */}
      <div className="flex items-center gap-2 mb-2">
        <span className="flex-1 font-medium text-sm">{slot.label}</span>
        <span className={cn('text-sm tabular-nums shrink-0', score > 0 ? 'text-primary font-semibold' : 'text-muted-foreground')}>
          {fmt(score)}
        </span>
      </div>
      {/* Row 2: inputs with labels */}
      <div className={cn('pl-6 grid gap-2', slot.hasTier && slot.type === 'evo' ? 'grid-cols-3' : slot.type === 'evo' ? 'grid-cols-2' : 'grid-cols-1')}>
        {slot.type === 'evo' && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Evolução</p>
            <select
              value={slot.evo ?? ''}
              onChange={(e) =>
                onEquipChange(slot.id, 'evo', e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : null)
              }
              className="w-full bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-1.5 py-1 text-xs outline-none transition-colors"
            >
              {EVO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Refinação</p>
          <div className="flex items-center gap-0.5">
            <input
              type="number"
              min={0}
              max={maxRef}
              value={slot.refinement}
              onChange={(e) => {
                const v = Math.min(maxRef, Math.max(0, Number(e.target.value) || 0));
                e.target.value = String(v);
                onEquipChange(slot.id, 'refinement', v);
              }}
              className="w-full bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-1.5 py-1 text-xs tabular-nums outline-none transition-colors"
            />
            <span className="text-xs text-muted-foreground shrink-0">/{maxRef}</span>
          </div>
        </div>
        {slot.hasTier && (
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Tier</p>
            <div className="flex items-center gap-0.5">
              <input
                type="number"
                min={0}
                max={maxTier}
                value={slot.tier}
                onChange={(e) => {
                  const v = Math.min(maxTier, Math.max(0, Number(e.target.value) || 0));
                  e.target.value = String(v);
                  onEquipChange(slot.id, 'tier', v);
                }}
                className="w-full bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-1.5 py-1 text-xs tabular-nums outline-none transition-colors"
              />
              <span className="text-xs text-muted-foreground shrink-0">/{maxTier}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileEquipGroup({
  slots,
  weaponType,
  footerLabel,
  onEquipChange,
}: {
  slots: EquipmentSlot[];
  weaponType: '1h' | '2h';
  footerLabel: string;
  onEquipChange: (id: string, field: keyof EquipmentSlot, value: unknown) => void;
}) {
  const total = slots.reduce((s, slot) => s + calcEquipScore(slot, weaponType), 0);
  return (
    <>
      {slots.map((slot) => (
        <MobileEquipCard
          key={slot.id}
          slot={slot}
          score={calcEquipScore(slot, weaponType)}
          onEquipChange={onEquipChange}
        />
      ))}
      <div className="px-3 py-2 bg-muted/30 border-t flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{footerLabel}</span>
        <span className="text-sm font-bold text-primary tabular-nums">{fmt(total)}</span>
      </div>
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function GearSection({ state, autoQuestScore, onEquipChange, onMountChange, onWeaponTypeChange, onManualQuestScoreChange }: Props) {
  const wt = state.weaponType ?? '1h';
  const mountScore = calcMountScore(state.mountEvo, state.mountLevel, state.mountQuality);
  const mountMaxLevel = MOUNT_MAX_LEVEL[state.mountEvo ?? 1];
  const mountMaxQuality = MOUNT_MAX_QUALITY[state.mountEvo ?? 1];

  const weaponSlots = state.equipment.filter(
    (s) => WEAPON_IDS.has(s.id) && !(s.id === 'escudo' && wt === '2h'),
  );
  const otherSlots = state.equipment.filter((s) => !WEAPON_IDS.has(s.id));
  const weaponFooter = wt === '2h' ? 'Total Armas (2h = 120.000 máx)' : 'Total Armas';

  const isManualActive = state.manualQuestScore != null && state.manualQuestScore > 0;

  return (
    <div className="space-y-6">

      {/* ── Quest Score manual override ────────────────── */}
      <div className={cn(
        'rounded-lg border bg-card px-4 py-3',
        isManualActive ? 'border-primary/60' : 'border-border',
      )}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Score Quest
            </p>
            <p className="text-xs text-muted-foreground">
              Auto (quests marcadas): <span className="font-medium text-foreground">{autoQuestScore}</span>
              {isManualActive && (
                <span className="ml-2 text-yellow-500 font-medium">· substituído pelo manual</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder={String(autoQuestScore)}
              value={state.manualQuestScore ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '' || Number(raw) === 0) {
                  onManualQuestScoreChange(undefined);
                } else {
                  onManualQuestScoreChange(Math.max(0, Math.floor(Number(raw))));
                }
              }}
              className={cn(
                'bg-muted border rounded px-3 py-1.5 text-sm w-28 text-center tabular-nums outline-none transition-colors',
                isManualActive
                  ? 'border-primary/70 focus:border-primary'
                  : 'border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background',
              )}
            />
            {isManualActive && (
              <button
                onClick={() => onManualQuestScoreChange(undefined)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 border border-border rounded"
                title="Limpar — voltar ao automático"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Weapons card ───────────────────────────────── */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        {/* Header with 1h/2h toggle — always visible */}
        <div className="px-4 pt-3 pb-2 flex items-center justify-between border-b border-border">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Armas</h3>
          <div className="flex gap-1">
            {(['1h', '2h'] as const).map((t) => (
              <button
                key={t}
                onClick={() => onWeaponTypeChange(t)}
                className={cn(
                  'px-3 py-1 text-xs font-medium rounded border transition-colors',
                  wt === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted',
                )}
              >
                {t === '1h' ? 'Uma mão' : 'Duas mãos'}
              </button>
            ))}
          </div>
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block">
          <DesktopEquipTable
            slots={weaponSlots}
            weaponType={wt}
            footerLabel={weaponFooter}
            onEquipChange={onEquipChange}
          />
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden">
          <MobileEquipGroup
            slots={weaponSlots}
            weaponType={wt}
            footerLabel={weaponFooter}
            onEquipChange={onEquipChange}
          />
        </div>
      </div>

      {/* ── Armor / accessories / medal ────────────────── */}
      <div className="rounded-lg border bg-card overflow-x-auto">
        {/* Desktop table */}
        <div className="hidden sm:block">
          <DesktopEquipTable
            slots={otherSlots}
            weaponType={wt}
            footerLabel="Total Equipamentos"
            onEquipChange={onEquipChange}
          />
        </div>
        {/* Mobile cards */}
        <div className="sm:hidden">
          <MobileEquipGroup
            slots={otherSlots}
            weaponType={wt}
            footerLabel="Total Equipamentos"
            onEquipChange={onEquipChange}
          />
        </div>
      </div>

      {/* ── Mount ──────────────────────────────────────── */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Montaria</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Evolução</label>
            <select
              value={state.mountEvo ?? ''}
              onChange={(e) => onMountChange('mountEvo', e.target.value ? (Number(e.target.value) as 1 | 2 | 3) : null)}
              className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-2 py-2 text-sm w-full outline-none transition-colors"
            >
              <option value="">—</option>
              <option value="1">1ª (Zephyr)</option>
              <option value="2">2ª (Aerion)</option>
              <option value="3">3ª (Ancient Pegasus)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Level (máx {mountMaxLevel})</label>
            <input
              type="number"
              min={0}
              max={mountMaxLevel}
              value={state.mountLevel}
              onChange={(e) => {
                const v = Math.min(mountMaxLevel, Math.max(0, Number(e.target.value) || 0));
                e.target.value = String(v);
                onMountChange('mountLevel', v);
              }}
              className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-3 py-2 text-sm w-full tabular-nums outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Qualidade (máx {mountMaxQuality})</label>
            <input
              type="number"
              min={0}
              max={mountMaxQuality}
              value={state.mountQuality}
              onChange={(e) => {
                const v = Math.min(mountMaxQuality, Math.max(0, Number(e.target.value) || 0));
                e.target.value = String(v);
                onMountChange('mountQuality', v);
              }}
              className="bg-muted border border-white/25 hover:border-white/50 focus:border-white/70 focus:bg-background rounded px-3 py-2 text-sm w-full tabular-nums outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Score Power</label>
            <div className="bg-muted border border-border rounded px-3 py-2 text-sm font-bold text-primary tabular-nums">
              {fmt(mountScore)}
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Level (50%) · Qualidade (40%) · Evolução (10%) — máx 200.000
        </p>
      </div>

    </div>
  );
}
