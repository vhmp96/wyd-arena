import { useState } from 'react';
import { Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MaterialPrices {
  valk_0: number;
  valk_9: number;
  medalha_roxa: number;
  bahamut_crystal_20: number;
  bahamut_rune_10: number;
  medalha_dourada: number;
  medalha_vermelha: number;
  pl_30: number;
  bahamut_fury: number;
}

interface HornResult {
  spear: {
    nivel_5: { unit: number; qtd: number; total: number };
    nivel_10: { unit: number; qtd: number; total: number };
    nivel_15: { unit: number; qtd: number; total: number };
    total: number;
  };
  cons: {
    fury_unit: number; fury_qtd: number; fury_total: number;
    pl_unit: number; pl_qtd: number; pl_total: number;
    total: number;
  };
  recursos: {
    itens: { nome: string; qtd: number; unit: number; total: number }[];
    total: number;
  };
  total_cost: number;
  qtd_horn: number;
  price_per_horn: number;
}

const DEFAULT_PRICES: MaterialPrices = {
  valk_0: 160,
  valk_9: 350,
  medalha_roxa: 300,
  bahamut_crystal_20: 70,
  bahamut_rune_10: 60,
  medalha_dourada: 300,
  medalha_vermelha: 700,
  pl_30: 20,
  bahamut_fury: 230,
};

const MATERIAL_LABELS: Record<keyof MaterialPrices, string> = {
  valk_0: 'Valk +0',
  valk_9: 'Valk +9',
  medalha_roxa: 'Medalha Roxa',
  bahamut_crystal_20: 'Cristal Bahamut ×20',
  bahamut_rune_10: 'Runa Bahamut ×10',
  medalha_dourada: 'Medalha Dourada',
  medalha_vermelha: 'Medalha Vermelha',
  pl_30: 'PL ×30',
  bahamut_fury: 'Bahamut Fury',
};

const RECURSOS_KEYS: (keyof MaterialPrices)[] = [
  'medalha_roxa', 'medalha_dourada', 'medalha_vermelha',
  'valk_0', 'bahamut_crystal_20', 'bahamut_rune_10',
];

function spearCost(level: 5 | 10 | 15, p: MaterialPrices): number {
  if (level === 5) return 2 * p.valk_9 + p.bahamut_rune_10 + p.bahamut_crystal_20;
  if (level === 10) return 2 * p.medalha_roxa + 2 * p.valk_9;
  return 2 * p.medalha_roxa + p.medalha_dourada + p.medalha_vermelha;
}

function consCost(p: MaterialPrices) {
  return {
    fury_unit: p.bahamut_fury,
    fury_qtd: 5,
    fury_total: 5 * p.bahamut_fury,
    pl_unit: p.pl_30,
    pl_qtd: 30,
    pl_total: 30 * p.pl_30,
    total: 5 * p.bahamut_fury + 30 * p.pl_30,
  };
}

function calculate(
  qtd5: number, qtd10: number, qtd15: number,
  qtdHorn: number,
  recursos: Partial<Record<keyof MaterialPrices, number>>,
  prices: MaterialPrices,
): HornResult {
  const s5u = spearCost(5, prices);
  const s10u = spearCost(10, prices);
  const s15u = spearCost(15, prices);
  const spear = {
    nivel_5: { unit: s5u, qtd: qtd5, total: s5u * qtd5 },
    nivel_10: { unit: s10u, qtd: qtd10, total: s10u * qtd10 },
    nivel_15: { unit: s15u, qtd: qtd15, total: s15u * qtd15 },
    total: s5u * qtd5 + s10u * qtd10 + s15u * qtd15,
  };
  const cons = consCost(prices);
  const itens = Object.entries(recursos)
    .filter(([, q]) => (q ?? 0) > 0)
    .map(([nome, qtd]) => {
      const unit = prices[nome as keyof MaterialPrices] ?? 0;
      return { nome, qtd: qtd!, unit, total: qtd! * unit };
    });
  const recursosTotal = itens.reduce((s, i) => s + i.total, 0);
  const total_cost = spear.total + cons.total - recursosTotal;
  return {
    spear, cons,
    recursos: { itens, total: recursosTotal },
    total_cost,
    qtd_horn: qtdHorn,
    price_per_horn: qtdHorn > 0 ? total_cost / qtdHorn : 0,
  };
}

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export function HornCalculatorTab() {
  const [qtd5, setQtd5] = useState(0);
  const [qtd10, setQtd10] = useState(0);
  const [qtd15, setQtd15] = useState(0);
  const [qtdHorn, setQtdHorn] = useState(1);
  const [recursos, setRecursos] = useState<Partial<Record<keyof MaterialPrices, number>>>({});
  const [prices, setPrices] = useState<MaterialPrices>({ ...DEFAULT_PRICES });
  const [result, setResult] = useState<HornResult | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(calculate(qtd5, qtd10, qtd15, qtdHorn, recursos, prices));
  }

  function updateRecurso(key: keyof MaterialPrices, value: string) {
    setRecursos(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  }

  function updatePrice(key: keyof MaterialPrices, value: string) {
    setPrices(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-primary" />
          <h2 className="font-semibold text-base">Calculadora de Horn</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Calcule o custo de fabricação de horns com base nas lanças usadas e recursos obtidos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Linha 1: inputs + preços lado a lado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Coluna esquerda: lanças, horns, recursos */}
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-medium">Lanças utilizadas</p>
              <div className="grid grid-cols-3 gap-3">
                {([5, 10, 15] as const).map(lvl => (
                  <div key={lvl} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Lança +{lvl}</Label>
                    <Input
                      type="number" min={0}
                      value={lvl === 5 ? qtd5 : lvl === 10 ? qtd10 : qtd15}
                      onChange={e => {
                        const v = parseInt(e.target.value) || 0;
                        if (lvl === 5) setQtd5(v);
                        else if (lvl === 10) setQtd10(v);
                        else setQtd15(v);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Horns fabricados</p>
                <Input
                  type="number" min={1}
                  value={qtdHorn}
                  onChange={e => setQtdHorn(parseInt(e.target.value) || 1)}
                  className="h-8 text-sm max-w-[120px]"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Recursos obtidos (drop)</p>
                <div className="grid grid-cols-2 gap-3">
                  {RECURSOS_KEYS.map(key => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs text-muted-foreground">{MATERIAL_LABELS[key]}</Label>
                      <Input
                        type="number" min={0}
                        value={recursos[key] ?? 0}
                        onChange={e => updateRecurso(key, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna direita: preços */}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-medium">Preços dos materiais</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(DEFAULT_PRICES) as (keyof MaterialPrices)[]).map(key => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs text-muted-foreground">{MATERIAL_LABELS[key]}</Label>
                  <Input
                    type="number" min={0}
                    value={prices[key]}
                    onChange={e => updatePrice(key, e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full">Calcular</Button>
      </form>

      {/* Resultado: full width */}
      {result && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-4">
          <p className="text-sm font-semibold">Resultado</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lanças */}
            <div className="space-y-1 text-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lanças</p>
              {([5, 10, 15] as const).map(lvl => {
                const s = result.spear[`nivel_${lvl}` as 'nivel_5' | 'nivel_10' | 'nivel_15'];
                if (s.qtd === 0) return null;
                return (
                  <div key={lvl} className="flex justify-between">
                    <span className="text-muted-foreground">{s.qtd}× Lança +{lvl} ({fmt(s.unit)} ea)</span>
                    <span>{fmt(s.total)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between font-medium border-t border-border pt-1">
                <span>Subtotal</span>
                <span>{fmt(result.spear.total)}</span>
              </div>
            </div>

            {/* CONS */}
            <div className="space-y-1 text-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">CONS</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{result.cons.fury_qtd}× Bahamut Fury</span>
                <span>{fmt(result.cons.fury_total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{result.cons.pl_qtd}× PL ×30</span>
                <span>{fmt(result.cons.pl_total)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-border pt-1">
                <span>Subtotal</span>
                <span>{fmt(result.cons.total)}</span>
              </div>
            </div>

            {/* Recursos + Total */}
            <div className="space-y-1 text-sm">
              {result.recursos.itens.length > 0 && (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Recursos (desconto)</p>
                  {result.recursos.itens.map(item => (
                    <div key={item.nome} className="flex justify-between text-green-400">
                      <span>{item.qtd}× {MATERIAL_LABELS[item.nome as keyof MaterialPrices] ?? item.nome}</span>
                      <span>−{fmt(item.total)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-medium border-t border-border pt-1 text-green-400">
                    <span>Subtotal</span>
                    <span>−{fmt(result.recursos.total)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Total destacado */}
          <div className="border-t border-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              Custo total: <span className="text-foreground font-medium">{fmt(result.total_cost)}</span>
              <span className="mx-2">·</span>
              {result.qtd_horn} horn{result.qtd_horn !== 1 ? 's' : ''}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-muted-foreground">Preço por horn</span>
              <span className="text-primary font-bold text-2xl">
                {result.qtd_horn > 0 ? fmt(Math.round(result.price_per_horn)) : '—'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
