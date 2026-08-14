import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Label } from '@/components/ui/label';

// ─── Red Dragon ───────────────────────────────────────────────
const RD_BASE_RATES: Record<string, number> = {
  '+9 → +10': 45,
  '+10 → +11': 37.5,
  '+11 → +12': 22.5,
  '+12 → +13': 15,
  '+13 → +14': 10,
  '+14 → +15': 5,
};

const RD_SOUL_BONUS: Record<string, number> = {
  '+9 → +10': 2,
  '+10 → +11': 2,
  '+11 → +12': 2,
  '+12 → +13': 2,
  '+13 → +14': 1.5,
  '+14 → +15': 1,
};

// ─── Bahamut ──────────────────────────────────────────────────
const BH_BASE_RATES: Record<string, number> = {
  '+1 → +5': 20,
  '+5 → +9': 15,
  '+9 → +12': 10,
  '+12 → +15': 5,
};

const BH_SOUL_BONUS: Record<string, number> = {
  '+1 → +5': 1,
  '+5 → +9': 1,
  '+9 → +12': 1,
  '+12 → +15': 0.35,
};

// ─── Helpers ──────────────────────────────────────────────────
const SOUL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function getChanceColor(chance: number) {
  if (chance >= 35) return 'text-green-400';
  if (chance >= 20) return 'text-yellow-400';
  if (chance >= 10) return 'text-orange-400';
  return 'text-red-400';
}

function getBarColor(chance: number) {
  if (chance >= 35) return 'bg-green-500';
  if (chance >= 20) return 'bg-yellow-500';
  if (chance >= 10) return 'bg-orange-500';
  return 'bg-red-500';
}

function fmtChance(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

// ─── Calculator block (reutilizável) ──────────────────────────
function Calculator({
  upgradeOptions,
  baseRates,
  soulBonus,
  soulLabel,
  cols,
}: {
  upgradeOptions: string[];
  baseRates: Record<string, number>;
  soulBonus: Record<string, number>;
  soulLabel: string;
  cols: number;
}) {
  const [upgrade, setUpgrade] = useState(upgradeOptions[0]);
  const [soul, setSoul] = useState(0);
  const [simAttempts, setSimAttempts] = useState(10);

  const base = baseRates[upgrade];
  const bonusPerLevel = soulBonus[upgrade];
  const totalBonus = soul * bonusPerLevel;
  const chanceFinal = Math.min(base + totalBonus, 100);
  const expectedAttempts = 100 / chanceFinal;
  const probInN = (1 - Math.pow(1 - chanceFinal / 100, simAttempts)) * 100;

  return (
    <div className="space-y-4">
      {/* Upgrade */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Nível de upgrade</p>
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {upgradeOptions.map(lvl => (
            <button
              key={lvl}
              type="button"
              onClick={() => setUpgrade(lvl)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                upgrade === lvl
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Soul */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{soulLabel}</p>
          <span className="text-xs text-muted-foreground">+{bonusPerLevel}% por nível</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {SOUL_LEVELS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSoul(s)}
              className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                soul === s
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              }`}
            >
              +{s}
            </button>
          ))}
        </div>
      </div>

      {/* Resultado */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Taxa Base</span>
          <span>{base}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Bônus Soul (+{soul})</span>
          <span className={totalBonus > 0 ? 'text-green-400' : 'text-muted-foreground'}>
            +{fmtChance(totalBonus)}%
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-border pt-2">
          <span className="text-sm font-semibold">Chance Final</span>
          <span className={`text-2xl font-bold ${getChanceColor(chanceFinal)}`}>
            {fmtChance(chanceFinal)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(chanceFinal)}`}
            style={{ width: `${chanceFinal}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Tentativas esperadas</span>
          <span className="font-medium text-foreground">~{expectedAttempts.toFixed(1)}×</span>
        </div>
      </div>

      {/* Simulador */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground shrink-0">Tentativas</Label>
          <input
            type="range" min={1} max={100} value={simAttempts}
            onChange={e => setSimAttempts(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-medium w-8 text-right">{simAttempts}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Chance de acertar em {simAttempts} tentativas</span>
          <span className={`font-bold ${getChanceColor(probInN)}`}>{probInN.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getBarColor(probInN)}`}
            style={{ width: `${probInN}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Tab principal ────────────────────────────────────────────
export function RefinacaoTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-base">Calculadora de Refinação</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Taxas baseadas em{' '}
          <a
            href="https://impwyd.com/#tools"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            impwyd.com
          </a>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Dragon */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <p className="text-sm font-semibold text-primary">Red Dragon</p>
          <Calculator
            upgradeOptions={Object.keys(RD_BASE_RATES)}
            baseRates={RD_BASE_RATES}
            soulBonus={RD_SOUL_BONUS}
            soulLabel="Dragon Soul"
            cols={3}
          />
        </div>

        {/* Bahamut */}
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <p className="text-sm font-semibold text-primary">Bahamut</p>
          <Calculator
            upgradeOptions={Object.keys(BH_BASE_RATES)}
            baseRates={BH_BASE_RATES}
            soulBonus={BH_SOUL_BONUS}
            soulLabel="Bahamut Soul"
            cols={2}
          />
        </div>
      </div>
    </div>
  );
}
