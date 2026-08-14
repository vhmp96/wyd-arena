import { useState } from 'react';
import { SHOP_ITEMS, MARCOS, resolveMarcos } from '@/lib/lokiStorage';
import type { LokiState } from '@/lib/lokiStorage';
import { calcScoreQuest } from '@/lib/lokiStorage';
import { cn } from '@/lib/utils';

interface Props {
  state: LokiState;
  onToggleCart: (itemKey: string, value: boolean) => void;
}

function itemKey(item: { qty: number; item: string }): string {
  return `${item.qty}_${item.item}`;
}

export function ShopSection({ state, onToggleCart }: Props) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'coins_asc' | 'coins_desc' | 'name'>('coins_asc');

  const scoreQuest = calcScoreQuest(state.quests);
  const resolved = resolveMarcos(state.marcos, scoreQuest, state.equipment, state.mountEvo, state.mountLevel, state.mountQuality);
  const totalCoins = MARCOS.reduce((sum, m) => sum + (resolved[m.id] ? m.lokiCoins : 0), 0);

  const cartCost = SHOP_ITEMS.filter((i) => state.shopCart[itemKey(i)]).reduce((s, i) => s + i.coins, 0);

  const filtered = SHOP_ITEMS.filter((i) =>
    i.item.toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'coins_asc') return a.coins - b.coins;
    if (sortBy === 'coins_desc') return b.coins - a.coins;
    return a.item.localeCompare(b.item);
  });

  return (
    <div className="space-y-4">
      {/* Budget bar */}
      <div className="rounded-lg border bg-card px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Loki Coins ganhos</div>
          <div className="font-bold text-yellow-400 text-lg">{totalCoins}</div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Planejado</div>
          <div className={cn('font-bold text-lg', cartCost > totalCoins ? 'text-red-400' : 'text-primary')}>
            {cartCost}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground text-xs mb-0.5">Saldo</div>
          <div className={cn('font-bold text-lg', totalCoins - cartCost < 0 ? 'text-red-400' : 'text-emerald-400')}>
            {totalCoins - cartCost}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          placeholder="Buscar item..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-muted border border-border rounded px-3 py-2 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="bg-muted border border-border rounded px-3 py-2 text-sm"
        >
          <option value="coins_asc">Mais barato primeiro</option>
          <option value="coins_desc">Mais caro primeiro</option>
          <option value="name">Nome A-Z</option>
        </select>
      </div>

      {/* Items */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-muted-foreground text-xs uppercase tracking-wider bg-muted/30">
              <th className="px-4 py-2 text-left font-medium w-10"></th>
              <th className="px-4 py-2 text-left font-medium">Item</th>
              <th className="px-3 py-2 text-center font-medium w-20">Qtd</th>
              <th className="px-3 py-2 text-right font-medium w-24">Coins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map((i) => {
              const key = itemKey(i);
              const selected = !!state.shopCart[key];
              return (
                <tr
                  key={key}
                  className={cn(
                    'hover:bg-muted/20 transition-colors cursor-pointer',
                    selected && 'bg-yellow-950/20',
                  )}
                  onClick={() => onToggleCart(key, !selected)}
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => onToggleCart(key, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-border accent-yellow-500 h-4 w-4"
                    />
                  </td>
                  <td className="px-4 py-2">{i.item}</td>
                  <td className="px-3 py-2 text-center text-muted-foreground">×{i.qty}</td>
                  <td className="px-3 py-2 text-right font-semibold text-yellow-400 tabular-nums">
                    {i.coins}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Nenhum item encontrado.</p>
        )}
      </div>
    </div>
  );
}
