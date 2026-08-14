import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Label } from '@/components/ui/label';

const RD_BASE_RATES: Record<string, number> = {
  '+9 → +10': 45,
  '+10 → +11': 37.5,
  '+11 → +12': 22.5,
  '+12 → +13': 15,
  '+13 → +14': 10,
  '+14 → +15': 5,
};

const SOUL_BONUS_PER_LEVEL: Record<string, number> = {
  '+9 → +10': 2,
  '+10 → +11': 2,
  '+11 → +12': 2,
  '+12 → +13': 2,
  '+13 → +14': 1.5,
  '+14 → +15': 1,
};

const UPGRADE_LEVELS = Object.keys(RD_BASE_RATES);
const SOUL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function getChanceColor(chance: number) {
  if (chance >= 35) return 'text-green-400';
  if (chance >= 20) return 'text-yellow-400';
  if (chance >= 10) return 'text-orange-400';
  return 'text-red-400';
}

export function RefinacaoRDTab() {
  const [upgrade, setUpgrade] = useState('+9 → +10');
  const [soul, setSoul] = useState(0);
  const [simAttempts, setSimAttempts] = useState(10);

  const base = RD_BASE_RATES[upgrade];
  const soulBonus = soul * SOUL_BONUS_PER_LEVEL[upgrade];
  const chanceFinal = Math.min(base + soulBonus, 100);
  const expectedAttempts = 100 / chanceFinal;

  // Probabilidade de sucesso em N tentativas: 1 - (1 - p)^n
  const probInN = (1 - Math.pow(1 - chanceFinal / 100, simAttempts)) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-base">Refinação — Red Dragon</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Selecione o nível de upgrade e o nível do Dragon Soul para ver a chance de sucesso.
        </p>
      </div>

      {/* Seleção de upgrade */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium">Nível de upgrade</p>
        <div className="grid grid-cols-3 gap-2">
          {UPGRADE_LEVELS.map(lvl => (
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

      {/* Seleção de soul */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Dragon Soul</p>
          <span className="text-xs text-muted-foreground">
            +{SOUL_BONUS_PER_LEVEL[upgrade]}% por nível
          </span>
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
        <p className="text-sm font-semibold">Resultado</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Taxa Base</span>
            <span>{base}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bônus Dragon Soul (+{soul})</span>
            <span className={soulBonus > 0 ? 'text-green-400' : 'text-muted-foreground'}>
              +{soulBonus.toFixed(soulBonus % 1 === 0 ? 0 : 1)}%
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-border pt-2">
            <span className="font-semibold">Chance Final</span>
            <span className={`text-2xl font-bold ${getChanceColor(chanceFinal)}`}>
              {chanceFinal % 1 === 0 ? chanceFinal : chanceFinal.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Barra de progresso visual */}
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              chanceFinal >= 35 ? 'bg-green-500' :
              chanceFinal >= 20 ? 'bg-yellow-500' :
              chanceFinal >= 10 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${chanceFinal}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>Tentativas esperadas</span>
          <span className="font-medium text-foreground">~{expectedAttempts.toFixed(1)}×</span>
        </div>
      </div>

      {/* Simulador de N tentativas */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium">Probabilidade em N tentativas</p>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-muted-foreground shrink-0">Nº de tentativas</Label>
          <input
            type="range"
            min={1}
            max={100}
            value={simAttempts}
            onChange={e => setSimAttempts(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-medium w-8 text-right">{simAttempts}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Chance de acertar pelo menos 1×</span>
          <span className={`font-bold text-lg ${getChanceColor(probInN)}`}>
            {probInN.toFixed(1)}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              probInN >= 75 ? 'bg-green-500' :
              probInN >= 50 ? 'bg-yellow-500' :
              probInN >= 25 ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${probInN}%` }}
          />
        </div>
      </div>
    </div>
  );
}
