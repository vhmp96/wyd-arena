import { useState } from 'react';
import { Calculator, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SLOT_MAX_TIER } from '@/lib/lokiStorage';

type Evo = 1 | 2 | 3;
type WeaponType = '1h' | '2h';
type Section = 'refin' | 'evo' | 'tier' | 'mount' | 'medal';

const SCENARIOS = [
  { key: 'ruim',  label: 'Ruim',  sub: '95% fazem igual ou mais', z: -1.645, color: 'text-red-400'    },
  { key: 'medio', label: 'Médio', sub: '50% · esperado',           z:  0,     color: 'text-yellow-400' },
  { key: 'bom',   label: 'Bom',   sub: 'top 20% · boa sorte',      z:  0.842, color: 'text-blue-400'  },
  { key: 'otimo', label: 'Ótimo', sub: 'top 5% · sorte rara',      z:  1.645, color: 'text-green-400' },
] as const;

const REFIN_RATES     = [0.15,  0.10,  0.05 ] as const;
const REFIN_BOON      = [20,    30,    40   ] as const;
const MAX_REFIN       = [11,    11,    15   ] as const;
const TIER_CAPE_RATES = [0.05,  0.03,  0.01 ] as const;
const MOUNT_LV_RATES  = [0.20,  0.16,  0.06 ] as const;
const MOUNT_QTY_RATES = [0.10,  0.12,  0.04 ] as const;
const MOUNT_LV_MAX    = [120,   150,   250  ] as const;
const MOUNT_QTY_MAX   = [20,    50,    250  ] as const;
const MEDAL_RATES     = [0.03,  0.025, 0.02 ] as const;
const MEDAL_MAX       = [5,     10,    15   ] as const;
const TIER_MAX        = 10; // por faixa de evo (acessórios/capa)
const ACC_LABELS      = ['Joia 1', 'Joia 2', 'Joia 3', 'Brinco', 'Cinto', 'Colar'] as const;

// Armaduras em ordem de prioridade de dano (arma tratada separadamente)
const ARMOR_DAMAGE_ORDER = [
  { label: 'Luva',  id: 'luva'  },
  { label: 'Elmo',  id: 'elmo'  },
  { label: 'Bota',  id: 'bota'  },
  { label: 'Peito', id: 'peito' },
  { label: 'Calça', id: 'calca' },
] as const;

const SECTION_BADGE: Record<Section, string> = {
  refin: 'Refin', tier: 'Tier', mount: 'Mont', medal: 'Medal', evo: 'Evo',
};
const SECTION_BADGE_COLOR: Record<Section, string> = {
  refin:  'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  tier:   'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  mount:  'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  medal:  'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  evo:    'bg-green-500/10 text-green-400 border border-green-500/20',
};

function scenarioSuccesses(att: number, p: number, z: number, boon?: number): number {
  if (att <= 0 || p <= 0) return 0;
  const natural = Math.max(0, att * p + z * Math.sqrt(att * p * (1 - p)));
  if (boon == null) return Math.round(natural);
  return Math.round(natural) + Math.floor(Math.max(0, att - natural) / boon);
}

function attemptsForTarget(target: number, p: number, z: number, boon?: number): number {
  if (target <= 0) return 0;
  let lo = 1, hi = Math.max(target * 500, 2000);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (scenarioSuccesses(mid, p, z, boon) >= target) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

interface UpgradeDef {
  id: string;
  label: string;
  section: Section;
  ecCost: number;
  rate: number;
  boon?: number;
  max: number;
  fmt: (n: number) => string;
  pairId?: string;
  spPerSuccess: number;
}

function buildUpgrades(evo: Evo, wt: WeaponType): UpgradeDef[] {
  const ei   = evo - 1;
  const boon = REFIN_BOON[ei];
  const mr   = MAX_REFIN[ei];

  // ── SP por sucesso (fórmulas lokiStorage.ts) ──────────────────
  const refinInc = [0.20, 0.30, 0.50][ei];
  const spRefin1H   = (refinInc / mr) * (60000 * 0.70);
  const spRefin2H   = (refinInc / mr) * (120000 * 0.70);
  const spRefinAcc  = (refinInc / mr) * (30000 * 0.70);
  const spRefinCape = (refinInc / mr) * (100000 * 0.70);
  const spMedal     = 100000 / 15;

  // Tier equipamento (linear): addFront / maxTierReal
  const add1H = 60000 * 0.20;
  const add2H = 120000 * 0.20;

  // Tier bandado (capa/acessórios): fração por faixa de evo
  const tierBandFrac = [0.025, 0.035, 0.040][ei];
  const spTierCape = tierBandFrac * (100000 * 0.20);
  const spTierAcc  = tierBandFrac * (30000 * 0.20);

  // Montaria
  const lvInc = [0.20, 0.30, 0.50][ei];
  const qlInc = [0.10, 0.30, 0.60][ei];
  const spMountLv = (lvInc / MOUNT_LV_MAX[ei]) * 100000;
  const spMountQl = (qlInc / MOUNT_QTY_MAX[ei]) * 80000;

  // Tier offset só para acessórios/capa (30 tiers cumulativos)
  const tierOffset = ei * TIER_MAX;
  const fmtTierBanded = (n: number) => `T${tierOffset + n}`;

  // ── REFINAÇÃO ─────────────────────────────────────────────────
  const weaponRefin: UpgradeDef[] = wt === '2h'
    ? [{ id: 'r-arma2h', label: 'Arma (2H)', section: 'refin', ecCost: 6, rate: REFIN_RATES[ei], boon: boon * 2, max: mr, fmt: n => `+${n}`, pairId: 'arma2h', spPerSuccess: spRefin2H }]
    : [
        { id: 'r-arma',   label: 'Arma (1H)', section: 'refin', ecCost: 3, rate: REFIN_RATES[ei], boon, max: mr, fmt: n => `+${n}`, pairId: 'arma',   spPerSuccess: spRefin1H },
        { id: 'r-escudo', label: 'Escudo',    section: 'refin', ecCost: 3, rate: REFIN_RATES[ei], boon, max: mr, fmt: n => `+${n}`, pairId: 'escudo', spPerSuccess: spRefin1H },
      ];

  // Armaduras em ordem de dano: luva > elmo > bota > peito > calça
  const armorRefin: UpgradeDef[] = ARMOR_DAMAGE_ORDER.map(({ label, id }) => ({
    id: `r-${id}`, label, section: 'refin' as Section,
    ecCost: 3, rate: REFIN_RATES[ei], boon, max: mr, fmt: (n: number) => `+${n}`,
    pairId: id, spPerSuccess: spRefin1H,
  }));

  // Capa separada — fica depois do set inteiro
  const capaRefin: UpgradeDef = {
    id: 'r-capa', label: 'Capa', section: 'refin',
    ecCost: 3, rate: REFIN_RATES[ei], boon, max: mr, fmt: n => `+${n}`,
    pairId: undefined, spPerSuccess: spRefinCape,
  };

  const accRefin: UpgradeDef[] = ACC_LABELS.map((label, i) => ({
    id: `r-acc${i}`, label, section: 'refin' as Section,
    ecCost: 3, rate: REFIN_RATES[ei], boon, max: mr, fmt: (n: number) => `+${n}`,
    pairId: `acc${i}`, spPerSuccess: spRefinAcc,
  }));

  // ── EVOLUÇÃO ──────────────────────────────────────────────────
  const evoUpgrades: UpgradeDef[] = evo >= 2 ? [
    ...(wt === '2h'
      ? [{ id: 'e-arma2h', label: 'Evo Arma (2H)', section: 'evo' as Section, ecCost: 2, rate: 0.10, max: 1, fmt: () => '✓', pairId: 'arma2h', spPerSuccess: 0 }]
      : [
          { id: 'e-arma',   label: 'Evo Arma (1H)', section: 'evo' as Section, ecCost: 2, rate: 0.10, max: 1, fmt: () => '✓', pairId: 'arma',   spPerSuccess: 0 },
          { id: 'e-escudo', label: 'Evo Escudo',    section: 'evo' as Section, ecCost: 2, rate: 0.10, max: 1, fmt: () => '✓', pairId: 'escudo', spPerSuccess: 0 },
        ]),
    ...ARMOR_DAMAGE_ORDER.map(({ label, id }) => ({
      id: `e-${id}`, label: `Evo ${label}`, section: 'evo' as Section,
      ecCost: 2, rate: 0.10, max: 1, fmt: () => '✓', pairId: id, spPerSuccess: 0,
    })),
    ...ACC_LABELS.map((label, i) => ({
      id: `e-acc${i}`, label: `Evo ${label}`, section: 'evo' as Section,
      ecCost: 2, rate: 0.10, max: 1, fmt: () => '✓', pairId: `acc${i}`, spPerSuccess: 0,
    })),
  ] : [];

  // ── TIER ──────────────────────────────────────────────────────
  // Equipamentos: maxTier real de lokiStorage (5-7 total, sem offset por evo)
  const weaponTier: UpgradeDef[] = wt === '2h'
    ? [{
        id: 't-arma2h', label: 'Tier Arma (2H)', section: 'tier' as Section,
        ecCost: 4, rate: 0.10, max: SLOT_MAX_TIER['arma'], fmt: n => `T${n}`,
        spPerSuccess: add2H / SLOT_MAX_TIER['arma'],
      }]
    : [
        { id: 't-arma',   label: 'Tier Arma (1H)', section: 'tier' as Section,
          ecCost: 2, rate: 0.10, max: SLOT_MAX_TIER['arma'],   fmt: n => `T${n}`,
          spPerSuccess: add1H / SLOT_MAX_TIER['arma'] },
        { id: 't-escudo', label: 'Tier Escudo',    section: 'tier' as Section,
          ecCost: 2, rate: 0.10, max: SLOT_MAX_TIER['escudo'], fmt: n => `T${n}`,
          spPerSuccess: add1H / SLOT_MAX_TIER['escudo'] },
      ];

  const armorTier: UpgradeDef[] = ARMOR_DAMAGE_ORDER.map(({ label, id }) => {
    const maxT = SLOT_MAX_TIER[id] ?? 5;
    return {
      id: `t-${id}`, label: `Tier ${label}`, section: 'tier' as Section,
      ecCost: 2, rate: 0.10, max: maxT, fmt: (n: number) => `T${n}`,
      spPerSuccess: add1H / maxT,
    };
  });

  // Capa e acessórios: 10 tiers por faixa de evo (30 total), sistema bandado
  const capeTier: UpgradeDef = {
    id: 't-capa', label: 'Tier Capa', section: 'tier',
    ecCost: 5, rate: TIER_CAPE_RATES[ei], max: TIER_MAX, fmt: fmtTierBanded,
    spPerSuccess: spTierCape,
  };

  const accTier: UpgradeDef[] = ACC_LABELS.map((label, i) => ({
    id: `t-acc${i}`, label: `Tier ${label}`, section: 'tier' as Section,
    ecCost: 5, rate: TIER_CAPE_RATES[ei], max: TIER_MAX, fmt: fmtTierBanded,
    spPerSuccess: spTierAcc,
  }));

  // ── MONTARIA ─────────────────────────────────────────────────
  const mount: UpgradeDef[] = [
    { id: 'mount-lv',  label: 'Level Montaria',    section: 'mount', ecCost: 1, rate: MOUNT_LV_RATES[ei],  max: MOUNT_LV_MAX[ei],  fmt: n => `L${n}`,  spPerSuccess: spMountLv },
    { id: 'mount-qty', label: 'Qualidade Montaria', section: 'mount', ecCost: 5, rate: MOUNT_QTY_RATES[ei], max: MOUNT_QTY_MAX[ei], fmt: n => `Q${n}`,  spPerSuccess: spMountQl },
  ];

  // ── MEDALHA ───────────────────────────────────────────────────
  const medal: UpgradeDef = {
    id: 'medal', label: 'Medalha', section: 'medal',
    ecCost: 3, rate: MEDAL_RATES[ei], max: MEDAL_MAX[ei], fmt: n => `+${n}`,
    spPerSuccess: spMedal,
  };

  // ── ORDEM EXPLÍCITA: refin (dano) → tier (dano) → mont → medal ──
  // Dentro de refin/tier: arma > luva > elmo > bota > peito > calça > acessórios > capa
  const nonEvoItems: UpgradeDef[] = [
    ...weaponRefin, ...armorRefin, ...accRefin, capaRefin,
    ...weaponTier,  ...armorTier,  ...accTier,  capeTier,
    ...mount,
    medal,
  ];

  // Intercalar evo items antes do seu par de refin
  const evoMap = new Map(evoUpgrades.map(e => [e.pairId!, e]));
  const result: UpgradeDef[] = [];
  for (const item of nonEvoItems) {
    if (item.pairId && evoMap.has(item.pairId)) {
      result.push(evoMap.get(item.pairId)!);
    }
    result.push(item);
  }
  return result;
}

interface SimResult { values: number[]; spent: number[]; remainingEC: number; canEvolve: boolean }

function simulate(ec: number, upgrades: UpgradeDef[], z: number): SimResult {
  let remaining = ec;
  const values: number[] = [];
  const spent:  number[] = [];

  for (const upg of upgrades) {
    if (remaining <= 0) { values.push(0); spent.push(0); continue; }
    const att    = Math.floor(remaining / upg.ecCost);
    const gained = Math.min(upg.max, scenarioSuccesses(att, upg.rate, z, upg.boon));
    if (gained >= upg.max) {
      const cost = attemptsForTarget(upg.max, upg.rate, z, upg.boon) * upg.ecCost;
      remaining -= cost;
      values.push(upg.max);
      spent.push(cost);
    } else {
      values.push(gained);
      spent.push(remaining);
      remaining = 0;
    }
  }

  const evoIdxs   = upgrades.map((u, i) => u.section === 'evo'   ? i : -1).filter(i => i >= 0);
  const refinIdxs = upgrades.map((u, i) => u.section === 'refin' ? i : -1).filter(i => i >= 0);
  const canEvolve = evoIdxs.length > 0
    ? evoIdxs.every(i => (values[i] ?? 0) >= 1)
    : refinIdxs.every(i => (values[i] ?? 0) >= upgrades[i].max);
  return { values, spent, remainingEC: Math.max(0, remaining), canEvolve };
}

function cellStyle(lv: number, max: number): string {
  if (lv <= 0)          return 'text-muted-foreground/30';
  if (lv >= max)        return 'text-green-400 font-semibold';
  if (lv >= max * 0.6)  return 'text-yellow-400';
  return 'text-orange-400';
}

const QUICK_EC = [300, 500, 670, 1000, 1500] as const;

export function RefinacaoCalcTab() {
  const [ec, setEc]   = useState(670);
  const [evo, setEvo] = useState<Evo>(1);
  const [wt, setWt]   = useState<WeaponType>('1h');

  const upgrades = buildUpgrades(evo, wt);
  const sims     = SCENARIOS.map(s => simulate(ec, upgrades, s.z));

  const evoPairMap = new Map<string, number>();
  upgrades.forEach((u, i) => { if (u.section === 'evo' && u.pairId) evoPairMap.set(u.pairId, i); });

  type TableRow = { refinIdx: number; evoIdx?: number };
  const tableRows: TableRow[] = [];
  upgrades.forEach((upg, idx) => {
    if (upg.section === 'evo') return;
    const evoIdx = upg.pairId ? evoPairMap.get(upg.pairId) : undefined;
    tableRows.push({ refinIdx: idx, evoIdx });
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-primary" />
        <h2 className="font-semibold text-base">Simulador de Set</h2>
        <span className="text-xs text-muted-foreground">· refin → tier → montaria · arma &gt; luva &gt; elmo &gt; bota &gt; peito &gt; calça &gt; acess. &gt; capa</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-5">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Event Coins</p>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="number" min={0} value={ec}
              onChange={e => setEc(Math.max(0, Number(e.target.value)))}
              className="w-28 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium tabular-nums"
            />
            {QUICK_EC.map(v => (
              <button key={v} type="button" onClick={() => setEc(v)}
                className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  ec === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground')}>
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Evolução atual</p>
          <div className="flex gap-1">
            {([1, 2, 3] as Evo[]).map(v => (
              <button key={v} type="button" onClick={() => setEvo(v)}
                className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  evo === v ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground')}>
                {v}ª
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Tipo de arma</p>
          <div className="flex gap-1">
            {(['1h', '2h'] as WeaponType[]).map(w => (
              <button key={w} type="button" onClick={() => setWt(w)}
                className={cn('rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                  wt === w ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground')}>
                {w === '1h' ? '1H + Escudo' : '2H'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[160px]">
                  Upgrade
                </th>
                <th className="text-center py-2.5 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  EC/click
                </th>
                <th className="text-center py-2.5 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                  SP/EC
                </th>
                {SCENARIOS.map(s => (
                  <th key={s.key} className={cn('text-center py-2.5 px-4', s.color)}>
                    <div className="text-xs font-semibold uppercase tracking-wide">{s.label}</div>
                    <div className="text-xs font-normal opacity-60 normal-case tracking-normal">{s.sub}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => {
                const upg = upgrades[row.refinIdx];
                const eff = upg.spPerSuccess * upg.rate / upg.ecCost;

                // Separador visual entre seções
                const prevSection = ri > 0 ? upgrades[tableRows[ri - 1].refinIdx].section : upg.section;
                const sectionChanged = ri > 0 && upg.section !== prevSection;

                return (
                  <tr key={upg.id} className={cn(
                    'border-t border-border/30 hover:bg-muted/20 transition-colors',
                    sectionChanged && 'border-t-2 border-border',
                  )}>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0', SECTION_BADGE_COLOR[upg.section])}>
                          {SECTION_BADGE[upg.section]}
                        </span>
                        <span className="font-medium text-foreground/90">{upg.label}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-center text-xs text-muted-foreground whitespace-nowrap">
                      {row.evoIdx != null
                        ? <>{upgrades[row.evoIdx].ecCost}+{upg.ecCost}</>
                        : upg.ecCost}
                    </td>
                    <td className="py-2.5 px-2 text-center text-xs font-medium tabular-nums text-muted-foreground">
                      {Math.round(eff)}
                    </td>
                    {sims.map((sim, si) => {
                      const refinVal  = sim.values[row.refinIdx] ?? 0;
                      const refinCost = sim.spent[row.refinIdx]  ?? 0;
                      const evoVal    = row.evoIdx != null ? (sim.values[row.evoIdx] ?? 0) : undefined;
                      const evoCost   = row.evoIdx != null ? (sim.spent[row.evoIdx]  ?? 0) : 0;
                      const totalCost = evoCost + refinCost;

                      if (evoVal === 0) {
                        return (
                          <td key={si} className="py-2.5 px-4 text-center tabular-nums text-red-400/60">
                            ✗<span className="ml-1 text-xs opacity-60">({evoCost} EC)</span>
                          </td>
                        );
                      }

                      const prefix = evoVal === 1 ? '✓ ' : '';
                      return (
                        <td key={si} className={cn('py-2.5 px-4 text-center tabular-nums', cellStyle(refinVal, upg.max))}>
                          {refinVal <= 0 && evoVal == null ? '—' : (
                            <span>
                              {prefix}{upg.fmt(refinVal)}
                              <span className="ml-1 text-xs opacity-60">({totalCost} EC)</span>
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              <tr className="border-t-2 border-border bg-muted/10">
                <td className="py-2 px-4 text-xs text-muted-foreground font-medium uppercase tracking-wide">Pode evoluir?</td>
                <td /><td />
                {sims.map((sim, si) => (
                  <td key={si} className="py-2 px-4 text-center">
                    {sim.canEvolve
                      ? <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto" />
                      : <XCircle      className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                    }
                  </td>
                ))}
              </tr>

              <tr className="border-t border-border/30">
                <td className="py-2 px-4 text-xs text-muted-foreground font-medium">EC sobrando</td>
                <td /><td />
                {sims.map((sim, si) => (
                  <td key={si} className="py-2 px-4 text-center text-xs font-medium tabular-nums text-muted-foreground">
                    {sim.remainingEC > 0 ? sim.remainingEC : '—'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
