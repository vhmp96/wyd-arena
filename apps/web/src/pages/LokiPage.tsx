import { useState, useCallback, useRef } from 'react';
import { Download, Upload, Trophy, Trash2, Info } from 'lucide-react';
import { Layout } from '@/components/Layout';
import { LokiRankTab } from './loki/LokiRankPage';
import {
  loadLoki,
  saveLoki,
  exportLoki,
  importLoki,
  defaultLokiState,
  calcScoreQuest,
  calcScorePower,
  calcLokiPower,
  getCurrentTier,
  LOKI_DATES,
} from '@/lib/lokiStorage';
import type { LokiState, EquipmentSlot } from '@/lib/lokiStorage';
import { QuestSection } from './loki/QuestSection';
import { GearSection } from './loki/GearSection';
import { MarcosSection } from './loki/MarcosSection';
import { ShopSection } from './loki/ShopSection';
import { TiersSection } from './loki/TiersSection';
import { RefinacaoCalcTab } from './loki/RefinacaoCalcTab';
import { cn } from '@/lib/utils';

type TopTab = 'progresso' | 'ranking';
type Tab = 'quests' | 'gear' | 'marcos' | 'shop' | 'tiers' | 'calc';

const TOP_TABS: { id: TopTab; label: string }[] = [
  { id: 'progresso', label: 'Progresso' },
  { id: 'ranking', label: 'Ranking' },
];

const TABS: { id: Tab; label: string }[] = [
  { id: 'quests', label: 'Quests' },
  { id: 'gear', label: 'Score Power' },
  { id: 'marcos', label: 'Marcos' },
  { id: 'shop', label: 'Loja' },
  { id: 'tiers', label: 'Tiers' },
  { id: 'calc', label: 'Calculadora' },
];

function fmt(n: number) {
  return n.toLocaleString('pt-BR');
}

export function LokiPage() {
  const [state, setState] = useState<LokiState>(() => loadLoki());
  const [topTab, setTopTab] = useState<TopTab>('progresso');
  const [activeTab, setActiveTab] = useState<Tab>('quests');
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().toISOString().slice(0, 10);
    const idx = LOKI_DATES.indexOf(today);
    return idx >= 0 ? idx : LOKI_DATES.length - 1;
  });
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = useCallback((updater: (prev: LokiState) => LokiState) => {
    setState((prev) => {
      const next = updater(prev);
      saveLoki(next);
      return next;
    });
  }, []);

  const handleToggleQuest = useCallback((key: string, value: boolean) => {
    update((prev) => ({ ...prev, quests: { ...prev.quests, [key]: value } }));
  }, [update]);

  const handleEquipChange = useCallback((id: string, field: keyof EquipmentSlot, value: unknown) => {
    update((prev) => ({
      ...prev,
      equipment: prev.equipment.map((s) => s.id === id ? { ...s, [field]: value } : s),
    }));
  }, [update]);

  const handleMountChange = useCallback((field: 'mountEvo' | 'mountLevel' | 'mountQuality', value: unknown) => {
    update((prev) => ({ ...prev, [field]: value }));
  }, [update]);

  const handleWeaponTypeChange = useCallback((wt: '1h' | '2h') => {
    update((prev) => ({ ...prev, weaponType: wt }));
  }, [update]);

  const handleToggleMarco = useCallback((id: string, value: boolean) => {
    update((prev) => ({ ...prev, marcos: { ...prev.marcos, [id]: value } }));
  }, [update]);

  const handleManualQuestScoreChange = useCallback((v: number | undefined) => {
    update((prev) => ({ ...prev, manualQuestScore: v }));
  }, [update]);

  const handleToggleCart = useCallback((itemKey: string, value: boolean) => {
    update((prev) => ({ ...prev, shopCart: { ...prev.shopCart, [itemKey]: value } }));
  }, [update]);

  const handleExport = () => exportLoki(state);

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    const fresh = defaultLokiState();
    setState(fresh);
    saveLoki(fresh);
    setConfirmDelete(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const imported = await importLoki(file);
      setState(imported);
      saveLoki(imported);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Erro desconhecido.');
    }
    e.target.value = '';
  };

  const scoreQuest = calcScoreQuest(state.quests);
  const effectiveQuestScore = (state.manualQuestScore != null && state.manualQuestScore > 0)
    ? state.manualQuestScore
    : scoreQuest;
  const scorePower = calcScorePower(state.equipment, state.mountEvo, state.mountLevel, state.mountQuality, state.weaponType);
  const lokiPower = calcLokiPower(scorePower, effectiveQuestScore);
  const tier = getCurrentTier(effectiveQuestScore, scorePower);

  return (
    <Layout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Loki 7
            </h1>
            <p className="text-sm text-muted-foreground">13 – 22 de junho de 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-md hover:bg-muted transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              Importar
            </button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
            <button
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors',
                confirmDelete
                  ? 'border-red-500 bg-red-950/40 text-red-400 hover:bg-red-950/60'
                  : 'border-border hover:bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? 'Confirmar?' : 'Deletar dados'}
            </button>
          </div>
        </div>

        {/* Top-level tabs: Progresso | Ranking */}
        <div className="border-b border-border flex gap-0.5">
          {TOP_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTopTab(t.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                topTab === t.id
                  ? 'text-yellow-400 border-yellow-400'
                  : 'text-muted-foreground border-transparent hover:text-foreground',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Ranking — sempre montado, escondido via CSS para evitar re-render ao trocar de aba */}
        <div className={topTab === 'ranking' ? '' : 'hidden'}>
          <LokiRankTab />
        </div>

        <div className={topTab === 'progresso' ? '' : 'hidden'}><>

        {importError && (
          <div className="rounded-md border border-red-500/30 bg-red-950/20 px-4 py-2 text-sm text-red-400">
            {importError}
          </div>
        )}

        {/* Source + disclaimer */}
        <div className="bg-muted/40 border border-border rounded-md px-3 py-2 text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Baseado no evento oficial WYD Global
          </span>
          <a
            href="https://wydglobal.raidhut.com/pt-br/3486"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Ver notícia ↗
          </a>
          <span className="hidden sm:inline text-muted-foreground/40">·</span>
          <span>Rastreador independente, sem vínculo com a marca WYD.</span>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Score Quest</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{effectiveQuestScore}</p>
            {state.manualQuestScore != null && state.manualQuestScore > 0 && (
              <p className="text-xs text-yellow-500 mt-0.5">manual</p>
            )}
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Score Power</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{fmt(scorePower)}</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Loki Score</p>
            <p className="text-2xl font-bold text-primary tabular-nums">{fmt(lokiPower)}</p>
          </div>
          <div className="rounded-lg border bg-card px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Tier</p>
            <p className={cn('text-2xl font-bold', tier?.color ?? 'text-muted-foreground')}>
              {tier?.label ?? '—'}
            </p>
          </div>
        </div>

        {/* Tabs — select on mobile, nav on desktop */}
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value as Tab)}
            className="w-full bg-muted border border-border rounded px-3 py-2 text-sm font-medium"
          >
            {TABS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block border-b border-border">
          <nav className="flex gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  activeTab === t.id
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div>
          {activeTab === 'quests' && (
            <QuestSection
              state={state}
              selectedDay={selectedDay}
              onDayChange={setSelectedDay}
              onToggleQuest={handleToggleQuest}
            />
          )}
          {activeTab === 'gear' && (
            <GearSection
              state={state}
              autoQuestScore={scoreQuest}
              onEquipChange={handleEquipChange}
              onMountChange={handleMountChange}
              onWeaponTypeChange={handleWeaponTypeChange}
              onManualQuestScoreChange={handleManualQuestScoreChange}
            />
          )}
          {activeTab === 'marcos' && (
            <MarcosSection state={state} onToggleMarco={handleToggleMarco} />
          )}
          {activeTab === 'shop' && (
            <ShopSection state={state} onToggleCart={handleToggleCart} />
          )}
          {activeTab === 'tiers' && <TiersSection state={state} />}
          {activeTab === 'calc' && <RefinacaoCalcTab />}
        </div>

        </></div>
      </div>
    </Layout>
  );
}
