export interface EquipmentSlot {
  id: string;
  label: string;
  type: 'evo' | 'fixed';
  fixedBase?: number;
  hasTier: boolean;
  active: boolean;
  evo: 1 | 2 | 3 | null;
  refinement: number;
  tier: number;
}

export interface LokiState {
  version: 7;
  quests: Record<string, boolean>;
  equipment: EquipmentSlot[];
  weaponType: '1h' | '2h';
  mountEvo: 1 | 2 | 3 | null;
  mountLevel: number;
  mountQuality: number;
  marcos: Record<string, boolean>;
  shopCart: Record<string, boolean>;
  lastUpdated: string;
  manualQuestScore?: number;
}

export const LOKI_KEY = 'loki7_data';

export const LOKI_DATES = [
  '2026-06-13',
  '2026-06-14',
  '2026-06-15',
  '2026-06-16',
  '2026-06-17',
  '2026-06-18',
  '2026-06-19',
  '2026-06-20',
  '2026-06-21',
  '2026-06-22',
  '2026-06-23',
];

export const LOKI_DAYS = LOKI_DATES.length;

export interface QuestDef {
  id: string;
  label: string;
  group: 'A' | 'B';
  ecBase: number;
  ecIncrement: number;
  sp: number | null;
}

export const QUEST_DEFS: QuestDef[] = [
  // Group A — Arena
  { id: 'DESERT_ROYALE_1', label: 'DESERT ROYALE 1', group: 'A', ecBase: 40, ecIncrement: 5, sp: 1 },
  { id: 'DESERT_ROYALE_2', label: 'DESERT ROYALE 2', group: 'A', ecBase: 50, ecIncrement: 5, sp: 2 },
  { id: 'DESERT_ROYALE_3', label: 'DESERT ROYALE 3', group: 'A', ecBase: 70, ecIncrement: 5, sp: 3 },
  { id: 'ROYAL_ARENA_1', label: 'ROYAL ARENA 1', group: 'A', ecBase: 40, ecIncrement: 5, sp: 1 },
  { id: 'ROYAL_ARENA_2', label: 'ROYAL ARENA 2', group: 'A', ecBase: 50, ecIncrement: 5, sp: 2 },
  { id: 'ROYAL_ARENA_3', label: 'ROYAL ARENA 3', group: 'A', ecBase: 70, ecIncrement: 5, sp: 3 },
  { id: 'MUSPELL_ARENA_1', label: 'MUSPELL ARENA 1', group: 'A', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'MUSPELL_ARENA_2', label: 'MUSPELL ARENA 2', group: 'A', ecBase: 40, ecIncrement: 5, sp: 2 },
  { id: 'MUSPELL_ARENA_3', label: 'MUSPELL ARENA 3', group: 'A', ecBase: 60, ecIncrement: 5, sp: 3 },
  { id: 'MORTAL_QUEST_1', label: 'MORTAL QUEST 1', group: 'A', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'MORTAL_QUEST_2', label: 'MORTAL QUEST 2', group: 'A', ecBase: 40, ecIncrement: 5, sp: 2 },
  { id: 'MORTAL_QUEST_3', label: 'MORTAL QUEST 3', group: 'A', ecBase: 50, ecIncrement: 5, sp: 3 },
  { id: 'IMATURITY_ANGEL_PLUS', label: 'IMATURITY ANGEL +', group: 'A', ecBase: 30, ecIncrement: 0, sp: null },
  { id: 'IMATURITY_ANGEL_MINUS', label: 'IMATURITY ANGEL −', group: 'A', ecBase: 30, ecIncrement: 0, sp: null },
  // Group B — Others
  { id: 'RELIQUARY_1', label: 'RELIQUARY 1', group: 'B', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'RELIQUARY_2', label: 'RELIQUARY 2', group: 'B', ecBase: 40, ecIncrement: 5, sp: 2 },
  { id: 'RELIQUARY_3', label: 'RELIQUARY 3', group: 'B', ecBase: 60, ecIncrement: 5, sp: 3 },
  { id: 'BOSS_RAMPAGE_1', label: 'BOSS RAMPAGE 1', group: 'B', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'BOSS_RAMPAGE_2', label: 'BOSS RAMPAGE 2', group: 'B', ecBase: 60, ecIncrement: 5, sp: 2 },
  { id: 'BOSS_RAMPAGE_3', label: 'BOSS RAMPAGE 3', group: 'B', ecBase: 80, ecIncrement: 5, sp: 3 },
  { id: 'TAURON_LOOT_1', label: 'TAURON LOOT 1', group: 'B', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'TAURON_LOOT_2', label: 'TAURON LOOT 2', group: 'B', ecBase: 40, ecIncrement: 5, sp: 2 },
  { id: 'TAURON_LOOT_3', label: 'TAURON LOOT 3', group: 'B', ecBase: 50, ecIncrement: 5, sp: 3 },
  { id: 'CHRONO_WAVES_1', label: 'CHRONO WAVES 1', group: 'B', ecBase: 30, ecIncrement: 5, sp: 1 },
  { id: 'CHRONO_WAVES_2', label: 'CHRONO WAVES 2', group: 'B', ecBase: 60, ecIncrement: 5, sp: 2 },
  { id: 'CHRONO_WAVES_3', label: 'CHRONO WAVES 3', group: 'B', ecBase: 80, ecIncrement: 5, sp: 3 },
  { id: 'ANCIENT_TITAN', label: 'ANCIENT TITAN', group: 'B', ecBase: 60, ecIncrement: 5, sp: 3 },
];

export function questKey(date: string, questId: string): string {
  return `${date}_${questId}`;
}

export function questEcForDay(quest: QuestDef, dayIndex: number): number {
  return quest.ecBase + quest.ecIncrement * dayIndex;
}

// Max tier per slot (varies by item type per official page)
export const SLOT_MAX_TIER: Record<string, number> = {
  elmo: 5,
  peito: 6,
  calca: 6,
  luva: 5,
  bota: 5,
  arma: 7,
  escudo: 7,
  capa: 30,
  brinco: 30,
  colar: 30,
  cinto: 30,
  pedra1: 30,
  pedra2: 30,
  pedra3: 30,
};

// Max Score Power contribution per slot (at 3ª evo + max refino + max tier)
const SLOT_MAX_POWER: Record<string, number> = {
  elmo: 60000,
  peito: 60000,
  calca: 60000,
  luva: 60000,
  bota: 60000,
  arma: 60000,
  escudo: 60000,
  brinco: 30000,
  colar: 30000,
  cinto: 30000,
  pedra1: 30000,
  pedra2: 30000,
  pedra3: 30000,
  medalha: 100000,
  capa: 100000,
};

// Accessories and cape use the band system for adicionais
const SCORE_BAND_IDS = new Set(['brinco', 'colar', 'cinto', 'pedra1', 'pedra2', 'pedra3', 'capa']);

// Score Power calculation
// Fórmula oficial: cada slot tem 3 frentes (Refinação 70%, Adicionais 20%, Evolução 10%)
// que enchem progressivamente conforme a evolução (sistema cumulativo).

// Refinação: base travada da evo anterior + progresso proporcional na evo atual
// 1ª (max +11) → cap 20%, 2ª (max +11) → cap 50%, 3ª (max +15) → cap 100%
const REF_BANDS: Record<1 | 2 | 3, { base: number; inc: number; maxRef: number }> = {
  1: { base: 0,    inc: 0.20, maxRef: 11 },
  2: { base: 0.20, inc: 0.30, maxRef: 11 },
  3: { base: 0.50, inc: 0.50, maxRef: 15 },
};

// Evolução: percentual fixo ao atingir cada tier de evo
const EVO_PCTS: Record<1 | 2 | 3, number> = { 1: 0.10, 2: 0.40, 3: 1.00 };

export function calcEquipScore(slot: EquipmentSlot, weaponType: '1h' | '2h' = '1h'): number {
  // Escudo não existe em build de 2 mãos
  if (slot.id === 'escudo' && weaponType === '2h') return 0;

  // Medalha: 100% Refinação, sem efeito de evo ou adicional
  if (slot.id === 'medalha') {
    return Math.floor((slot.refinement / 15) * 100000);
  }

  if (!slot.evo) return 0;

  // Arma 2h ocupa os dois slots (arma + escudo) → slotMax dobrado
  const slotMax = slot.id === 'arma' && weaponType === '2h'
    ? 120000
    : (SLOT_MAX_POWER[slot.id] ?? 60000);

  const refFront = slotMax * 0.70;
  const addFront = slotMax * 0.20;
  const evoFront = slotMax * 0.10;

  // Refinação (cumulativo)
  const { base, inc, maxRef } = REF_BANDS[slot.evo];
  const refScore = (base + (slot.refinement / maxRef) * inc) * refFront;

  // Evolução
  const evoScore = EVO_PCTS[slot.evo] * evoFront;

  // Adicionais
  let addScore: number;
  const t = slot.tier;
  if (SCORE_BAND_IDS.has(slot.id)) {
    // Acessórios e Capa: sistema de faixas (tiers 1-10 → 25%, 11-20 → 60%, 21-30 → 100%)
    if (t <= 10) addScore = (t / 10) * 0.25 * addFront;
    else if (t <= 20) addScore = (0.25 + ((t - 10) / 10) * 0.35) * addFront;
    else addScore = (0.60 + ((t - 20) / 10) * 0.40) * addFront;
  } else {
    // Armaduras e Armas: linear (tier / maxTier)
    const maxT = SLOT_MAX_TIER[slot.id] ?? 1;
    addScore = (t / maxT) * addFront;
  }

  return Math.floor(refScore + addScore + evoScore);
}

export function calcMountScore(evo: 1 | 2 | 3 | null, level: number, quality: number): number {
  if (!evo) return 0;

  const LEVEL_FRONT = 100000;  // 50% de 200.000
  const QUALITY_FRONT = 80000; // 40% de 200.000
  const EVO_FRONT = 20000;     // 10% de 200.000

  const MOUNT_MAX_LEVEL: Record<1 | 2 | 3, number> = { 1: 120, 2: 150, 3: 250 };
  const MOUNT_MAX_QUALITY: Record<1 | 2 | 3, number> = { 1: 20, 2: 50, 3: 250 };

  // Level: 1ª→20%, 2ª→50%, 3ª→100% (cumulativo)
  const LV_BANDS: Record<1 | 2 | 3, { base: number; inc: number }> = {
    1: { base: 0,    inc: 0.20 },
    2: { base: 0.20, inc: 0.30 },
    3: { base: 0.50, inc: 0.50 },
  };
  const { base: lb, inc: li } = LV_BANDS[evo];
  const levelScore = (lb + (level / MOUNT_MAX_LEVEL[evo]) * li) * LEVEL_FRONT;

  // Qualidade: 1ª→10%, 2ª→40%, 3ª→100% (cumulativo)
  const QL_BANDS: Record<1 | 2 | 3, { base: number; inc: number }> = {
    1: { base: 0,    inc: 0.10 },
    2: { base: 0.10, inc: 0.30 },
    3: { base: 0.40, inc: 0.60 },
  };
  const { base: qb, inc: qi } = QL_BANDS[evo];
  const qualityScore = (qb + (quality / MOUNT_MAX_QUALITY[evo]) * qi) * QUALITY_FRONT;

  const evoScore = EVO_PCTS[evo] * EVO_FRONT;

  return Math.floor(levelScore + qualityScore + evoScore);
}

export function calcScoreQuest(quests: Record<string, boolean>): number {
  return LOKI_DATES.reduce((total, date, dayIdx) => {
    return total + QUEST_DEFS.reduce((dayTotal, q) => {
      const key = questKey(date, q.id);
      if (quests[key] && q.sp !== null) return dayTotal + q.sp;
      return dayTotal;
    }, 0);
  }, 0);
}

export function calcScorePower(
  equipment: EquipmentSlot[],
  mountEvo: 1 | 2 | 3 | null,
  mountLevel: number,
  mountQuality: number,
  weaponType: '1h' | '2h' = '1h',
): number {
  const gearScore = equipment.reduce((sum, slot) => sum + calcEquipScore(slot, weaponType), 0);
  return gearScore + calcMountScore(mountEvo, mountLevel, mountQuality);
}

export function calcLokiPower(scorePower: number, scoreQuest: number): number {
  return scorePower + scoreQuest * 100;
}

// Default equipment slots
export function defaultEquipment(): EquipmentSlot[] {
  return [
    { id: 'elmo', label: 'Elmo', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'peito', label: 'Peito', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'calca', label: 'Calça', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'luva', label: 'Luva', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'bota', label: 'Bota', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'arma', label: 'Arma', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'escudo', label: 'Arma/Escudo', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'brinco', label: 'Brinco', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'capa', label: 'Capa', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'colar', label: 'Colar', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'cinto', label: 'Cinto', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'pedra1', label: 'Joia 1', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'pedra2', label: 'Joia 2', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'pedra3', label: 'Joia 3', type: 'evo', hasTier: true, active: true, evo: 1, refinement: 0, tier: 0 },
    { id: 'medalha', label: 'Medalha', type: 'fixed', hasTier: false, active: true, evo: null, refinement: 0, tier: 0 },
  ];
}

export function defaultLokiState(): LokiState {
  return {
    version: 7,
    quests: {},
    equipment: defaultEquipment(),
    weaponType: '1h',
    mountEvo: 1,
    mountLevel: 0,
    mountQuality: 0,
    marcos: {},
    shopCart: {},
    lastUpdated: new Date().toISOString(),
  };
}

export function loadLoki(): LokiState {
  try {
    const raw = localStorage.getItem(LOKI_KEY);
    if (!raw) return defaultLokiState();
    const parsed = JSON.parse(raw) as LokiState;
    if (parsed.version !== 7) return defaultLokiState();
    // merge default equipment in case new slots were added
    const defaultEq = defaultEquipment();
    const savedIds = new Set(parsed.equipment.map((e) => e.id));
    const merged = [
      ...parsed.equipment,
      ...defaultEq.filter((e) => !savedIds.has(e.id)),
    ];
    // migrate slot types and labels
    const migrated = merged.map((s) => {
      if (['pedra1', 'pedra2', 'pedra3'].includes(s.id) && s.type === 'fixed') {
        return { ...s, type: 'evo' as const, fixedBase: undefined, label: s.id === 'pedra1' ? 'Joia 1' : s.id === 'pedra2' ? 'Joia 2' : 'Joia 3' };
      }
      if (s.id === 'capa' && !s.hasTier) return { ...s, hasTier: true };
      // Remove fixedBase from medalha (no longer used)
      if (s.id === 'medalha' && s.fixedBase !== undefined) return { ...s, fixedBase: undefined };
      return s;
    });
    return {
      ...parsed,
      equipment: migrated,
      weaponType: parsed.weaponType ?? '1h',
    };
  } catch {
    return defaultLokiState();
  }
}

export function saveLoki(state: LokiState): void {
  localStorage.setItem(LOKI_KEY, JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
}

export function exportLoki(state: LokiState): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loki7_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importLoki(file: File): Promise<LokiState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string) as LokiState;
        if (parsed.version !== 7) {
          reject(new Error('Arquivo inválido: versão incorreta.'));
          return;
        }
        resolve(parsed);
      } catch {
        reject(new Error('Arquivo JSON inválido.'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo.'));
    reader.readAsText(file);
  });
}

// Tiers
export interface TierDef {
  id: string;
  label: string;
  color: string;
  minScoreQuest: number;
  minScorePower: number;
  slots: number;
}

export const TIERS: TierDef[] = [
  { id: 'diamante', label: 'Diamante', color: 'text-cyan-300', minScoreQuest: 350, minScorePower: 700000, slots: 10 },
  { id: 'platina', label: 'Platina', color: 'text-blue-300', minScoreQuest: 300, minScorePower: 400000, slots: 50 },
  { id: 'ouro', label: 'Ouro', color: 'text-yellow-400', minScoreQuest: 250, minScorePower: 250000, slots: 190 },
  { id: 'prata', label: 'Prata', color: 'text-slate-300', minScoreQuest: 200, minScorePower: 150000, slots: 250 },
  { id: 'bronze', label: 'Bronze', color: 'text-amber-600', minScoreQuest: 150, minScorePower: 100000, slots: 300 },
  { id: 'ferro', label: 'Ferro', color: 'text-slate-500', minScoreQuest: 100, minScorePower: 0, slots: 200 },
];

export function getCurrentTier(scoreQuest: number, scorePower: number): TierDef | null {
  for (const tier of TIERS) {
    if (scoreQuest >= tier.minScoreQuest && scorePower >= tier.minScorePower) {
      return tier;
    }
  }
  return null;
}

// Marcos
export type MarcoCategory = 'montaria' | 'evolucao' | 'scoreQuest' | 'quests' | 'honra';

export interface MarcoDef {
  id: string;
  label: string;
  lokiCoins: number;
  honorCoins?: number;
  category: MarcoCategory;
  auto: boolean;
}

export const MARCO_CATEGORIES: { id: MarcoCategory; label: string }[] = [
  { id: 'montaria', label: 'Montaria' },
  { id: 'evolucao', label: 'Evolução' },
  { id: 'scoreQuest', label: 'Score Quest' },
  { id: 'quests', label: 'Quests' },
  { id: 'honra', label: 'Honra' },
];

export const MARCOS: MarcoDef[] = [
  // Montaria
  { id: 'mount_evo2', label: 'Montaria na 2ª Evolução', lokiCoins: 5, category: 'montaria', auto: true },
  { id: 'mount_evo3', label: 'Montaria na 3ª Evolução', lokiCoins: 10, category: 'montaria', auto: true },
  { id: 'mount_evo2_lvl100', label: 'Montaria na 2ª Evolução, level 100', lokiCoins: 15, category: 'montaria', auto: true },
  { id: 'mount_evo3_lvl200', label: 'Montaria na 3ª Evolução, level 200', lokiCoins: 20, category: 'montaria', auto: true },
  { id: 'mount_ql100', label: 'Montaria na qualidade 100', lokiCoins: 25, category: 'montaria', auto: true },
  // Evolução
  { id: 'equip_evo2', label: 'Equipamento na 2ª Evolução', lokiCoins: 5, category: 'evolucao', auto: true },
  { id: 'equip_evo3', label: 'Equipamento na 3ª Evolução', lokiCoins: 10, category: 'evolucao', auto: true },
  { id: 'equip_ref15_evo3', label: 'Refinação +15 em equipamento de 3ª Evolução', lokiCoins: 15, category: 'evolucao', auto: true },
  { id: 'acc_tier15_x1', label: 'Adicional Tier 15 em 1 acessório', lokiCoins: 20, category: 'evolucao', auto: true },
  { id: 'acc_tier15_x2', label: 'Adicional Tier 15 em 2 acessórios', lokiCoins: 25, category: 'evolucao', auto: true },
  // Score Quest
  { id: 'sq_100', label: '100 de Score Quest', lokiCoins: 5, category: 'scoreQuest', auto: true },
  { id: 'sq_150', label: '150 de Score Quest', lokiCoins: 10, category: 'scoreQuest', auto: true },
  { id: 'sq_200', label: '200 de Score Quest', lokiCoins: 15, category: 'scoreQuest', auto: true },
  { id: 'sq_300', label: '300 de Score Quest', lokiCoins: 20, category: 'scoreQuest', auto: true },
  // Quests (manual)
  { id: 'q_boss_rampage', label: 'Derrotar o boss final do Boss Rampage', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_arena_25', label: '25 vitórias em Arena', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_desert_85', label: 'Roubar 85 Desert Coins', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_taron_125', label: 'Roubar 125 Taron Loot Gold', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_immaturity_300', label: '300 falhas de refinação na Immaturity Angel', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_mjolnir_50', label: 'Obter 50 Medalhões Mjolnir', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_headhunters_16', label: 'Derrotar os 16 bosses do Head Hunters', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_titan_20', label: 'Eliminar 20 jogadores na fase final do Ancient Titan', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_muspell_20', label: 'Roubar 20 Muspellheim Artifacts', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_treasure_30', label: 'Abrir 30 baús da Treasure Hunt', lokiCoins: 10, category: 'quests', auto: false },
  { id: 'q_chrono_50', label: 'Alcançar a wave 50 no Chrono Waves', lokiCoins: 10, category: 'quests', auto: false },
  // Honra (manual)
  { id: 'honra_100', label: '100 Pontos de Honra', lokiCoins: 0, honorCoins: 1, category: 'honra', auto: false },
  { id: 'honra_250', label: '250 Pontos de Honra', lokiCoins: 0, honorCoins: 1, category: 'honra', auto: false },
  { id: 'honra_450', label: '450 Pontos de Honra', lokiCoins: 0, honorCoins: 1, category: 'honra', auto: false },
  { id: 'honra_700', label: '700 Pontos de Honra', lokiCoins: 0, honorCoins: 1, category: 'honra', auto: false },
  { id: 'honra_900', label: '900 Pontos de Honra', lokiCoins: 0, honorCoins: 1, category: 'honra', auto: false },
];

const ACCESSORY_IDS = new Set(['brinco', 'colar', 'cinto', 'pedra1', 'pedra2', 'pedra3']);

export function resolveMarcos(
  marcos: Record<string, boolean>,
  scoreQuest: number,
  equipment: EquipmentSlot[],
  mountEvo: 1 | 2 | 3 | null,
  mountLevel: number,
  mountQuality: number,
): Record<string, boolean> {
  const result = { ...marcos };
  const maxEquipEvo = equipment.reduce((max, s) => (s.evo && s.evo > max ? s.evo : max), 0 as number);
  const hasRef15Evo3 = equipment.some((s) => s.evo === 3 && s.refinement >= 15);
  const accTier15Count = equipment.filter((s) => ACCESSORY_IDS.has(s.id) && s.tier >= 15).length;

  result['mount_evo2'] = (mountEvo ?? 0) >= 2;
  result['mount_evo3'] = (mountEvo ?? 0) >= 3;
  result['mount_evo2_lvl100'] = (mountEvo ?? 0) >= 2 && mountLevel >= 100;
  result['mount_evo3_lvl200'] = (mountEvo ?? 0) >= 3 && mountLevel >= 200;
  result['mount_ql100'] = mountQuality >= 100;
  result['equip_evo2'] = maxEquipEvo >= 2;
  result['equip_evo3'] = maxEquipEvo >= 3;
  result['equip_ref15_evo3'] = hasRef15Evo3;
  result['acc_tier15_x1'] = accTier15Count >= 1;
  result['acc_tier15_x2'] = accTier15Count >= 2;
  result['sq_100'] = scoreQuest >= 100;
  result['sq_150'] = scoreQuest >= 150;
  result['sq_200'] = scoreQuest >= 200;
  result['sq_300'] = scoreQuest >= 300;

  return result;
}

// Shop items
export interface ShopItem {
  qty: number;
  item: string;
  coins: number;
  tierMin?: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  { qty: 1, item: '[01] Selo das Almas 425/425 (Imóvel)', coins: 360 },
  { qty: 1, item: '[01] Selo das Almas 415/415 (Imóvel)', coins: 220 },
  { qty: 1, item: '[01] Selo das Almas 400/400 (Imóvel)', coins: 150 },
  { qty: 1, item: '[01] Selo das Almas 380/380 (Imóvel)', coins: 60 },
  { qty: 1, item: '[01] Crimson Sword', coins: 15 },
  { qty: 1, item: '[01] Crimson Axe', coins: 15 },
  { qty: 1, item: '[01] Crimson Wand', coins: 15 },
  { qty: 1, item: '[01] Skin Barbarian Boar', coins: 200 },
  { qty: 1, item: '[01] Skin Bluefire Dragon Puppy', coins: 200 },
  { qty: 1, item: '[01] Skin White Tamed Bear', coins: 200 },
  { qty: 1, item: '[01] Skin AuraPuff', coins: 120 },
  { qty: 1, item: '[01] Skin Eletric Smilidon', coins: 120 },
  { qty: 1, item: '[01] Skin Ice Smilidon', coins: 120 },
  { qty: 1, item: '[01] Skin The Golden Ball', coins: 120 },
  { qty: 1, item: '[01] Black Death Shadow (Imóvel)', coins: 60 },
  { qty: 1, item: '[01] Golden Death Shadow (Imóvel)', coins: 60 },
  { qty: 1, item: 'Traje de Personagem Women Khalintz (Black)', coins: 50 },
  { qty: 1, item: '[01] Crimson Bow', coins: 30 },
  { qty: 1, item: '[01] Crimson Claw', coins: 30 },
  { qty: 1, item: '[01] Crimson Great Axe', coins: 30 },
  { qty: 1, item: '[01] Crimson Great Sword', coins: 30 },
  { qty: 1, item: '[01] Crimson Spear', coins: 30 },
  { qty: 1, item: '[01] Crimson Staff', coins: 30 },
  { qty: 1, item: '[01] Skin Flame Dragon', coins: 30 },
  { qty: 1, item: '[01] Crimson Tomahawk', coins: 15 },
  { qty: 1, item: '[01] Crimson Shield', coins: 15 },
  { qty: 1, item: '[01] Dragão Lendário 180/30 (Móvel)', coins: 20 },
  { qty: 1, item: '[01] Dragao Vermelho 200/30 Qualidade 30 (Móvel)', coins: 20 },
  { qty: 1, item: '[01] Dragão Lendário 150/30 (Móvel)', coins: 10 },
  { qty: 1, item: '[01] Dragon Lich (Temporária) (Imóvel)', coins: 8 },
  { qty: 1, item: '[01] Celestial Core', coins: 4 },
  { qty: 20, item: '[20] RedDragon scale (Imóvel)', coins: 8 },
  { qty: 1, item: '[01] Vault Key', coins: 10 },
  { qty: 1, item: '[01] Ovo Vermelho', coins: 25 },
  { qty: 20, item: '[20] Âmago de Jackal', coins: 25 },
  { qty: 30, item: '[30] Âmago de Dragão Lendário +10', coins: 10 },
  { qty: 30, item: '[30] Âmago de Dragão Vermelho +10', coins: 10 },
  { qty: 30, item: '[30] Âmago de Tigre de Fogo +10', coins: 10 },
  { qty: 1, item: '[01] Bahamut Fury', coins: 4 },
  { qty: 1, item: '[01] Bahamut Horn', coins: 30 },
  { qty: 1, item: '[01] Bahamut Soul', coins: 30 },
  { qty: 60, item: '[60] Bahamut Rune (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Draconic Spear +15', coins: 10 },
  { qty: 1, item: '[01] DragonSoul (Imóvel)', coins: 8 },
  { qty: 1, item: '[01] Mark of Bahamut (Imóvel)', coins: 8 },
  { qty: 1, item: '[01] Draconic Spear +10', coins: 7 },
  { qty: 1, item: '[01] Bahamut Core', coins: 100 },
  { qty: 1, item: '[01] Bahamut Soul Bless: 6', coins: 200 },
  { qty: 1, item: '[01] Pedra Amunra (28% Aumento de HP Máx.) (Imóvel)', coins: 250 },
  { qty: 1, item: '[01] Pedra Amunra (28% Aumento de MP Máx.) (Imóvel)', coins: 250 },
  { qty: 1, item: '[01] Pedra Amunra (14% Crítico) (Imóvel)', coins: 250 },
  { qty: 1, item: '[01] Pedra Amunra (24% Aumento de HP Máx.) (Imóvel)', coins: 120 },
  { qty: 1, item: '[01] Pedra Amunra (24% Aumento de MP Máx.) (Imóvel)', coins: 120 },
  { qty: 1, item: '[01] Pedra Amunra (12% Crítico) (Imóvel)', coins: 120 },
  { qty: 100, item: '[100] Cristal de Loki', coins: 80 },
  { qty: 20, item: '[20] Cristal de Anubis', coins: 20 },
  { qty: 120, item: '[120] Cristal de Bahamut', coins: 8 },
  { qty: 120, item: '[120] Cristal de Amunra', coins: 8 },
  { qty: 1, item: '[01] Absolute Refinement', coins: 75 },
  { qty: 1, item: '[01] Celestial Ascension', coins: 75 },
  { qty: 1, item: '[01] Lágrima Vermelha', coins: 5 },
  { qty: 1, item: '[01] Barra de Prata (1Bi) (Imóvel)', coins: 20 },
  { qty: 5, item: '[05] Lágrima Vermelha', coins: 20 },
  { qty: 8, item: '[01] Essence of the gods +9 x8 (Imóvel)', coins: 4 },
  { qty: 50, item: '[50] Barra Ancestral (Atq.Mágico) (Imóvel)', coins: 25 },
  { qty: 50, item: '[50] Barra Ancestral (Crítico) (Imóvel)', coins: 25 },
  { qty: 50, item: '[50] Barra Ancestral (Dano) (Imóvel)', coins: 25 },
  { qty: 50, item: '[50] Barra Ancestral (Defesa) (Imóvel)', coins: 25 },
  { qty: 3, item: '[03] Ovo Amarelo (Imóvel)', coins: 20 },
  { qty: 24, item: '[24] Ovo Azul (Imóvel)', coins: 20 },
  { qty: 1, item: '[01] Proteção Divina (Imóvel)', coins: 10 },
  { qty: 250, item: '[250] Barra de Mithril (Atq.Mágico) (Imóvel)', coins: 6 },
  { qty: 250, item: '[250] Barra de Mithril (Crítico) (Imóvel)', coins: 6 },
  { qty: 250, item: '[250] Barra de Mithril (Dano) (Imóvel)', coins: 6 },
  { qty: 250, item: '[250] Barra de Mithril (Defesa) (Imóvel)', coins: 6 },
  { qty: 250, item: '[250] Barra de Mithril (Imunidade) (Imóvel)', coins: 6 },
  { qty: 50, item: '[50] Lágrima Vermelha', coins: 150 },
  { qty: 100, item: '[100] Poeira de Fada (Imóvel)', coins: 20 },
  { qty: 20, item: '[20] Portao do Inferno (N/Ind.) (Imóvel)', coins: 10 },
  { qty: 1, item: '[01] Poção Divina (7dias) (Imóvel)', coins: 2 },
  { qty: 1, item: '[01] Master Jewel (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Tigre de Fogo 200/30 Qualidade 50 (Móvel)', coins: 15 },
  { qty: 30, item: '[30] Lactolerium 100 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Forca Espectral (Imóvel)', coins: 4 },
  { qty: 1, item: '[01] Pedra Ideal (Imóvel)', coins: 4 },
  { qty: 1, item: '[01] Concentração (Imóvel)', coins: 2 },
  { qty: 1, item: '[01] Pedra Amunra (10% Crítico) (Imóvel)', coins: 35 },
  { qty: 1, item: '[01] Pedra Amunra (20% Aumento de HP Máx.) (Imóvel)', coins: 35 },
  { qty: 1, item: '[01] Pedra Amunra (20% Aumento de MP Máx.) (Imóvel)', coins: 35 },
  { qty: 1, item: '[01] Pedra Amunra (16% Aumento de HP Máx.) (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Pedra Amunra (16% Aumento de MP Máx.) (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Pedra Amunra (8% Crítico) (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Pedra Amunra (Imóvel)', coins: 2 },
  { qty: 1, item: '[01] Bahamut Guardian belt +11 (Imóvel)', coins: 30 },
  { qty: 1, item: '[01] Bahamut Guardian necklace +11 (Imóvel)', coins: 30 },
  { qty: 1, item: '[01] Bahamut Madness belt +11 (Imóvel)', coins: 30 },
  { qty: 1, item: '[01] Bahamut Madness necklace +11 (Imóvel)', coins: 30 },
  { qty: 1, item: '[01] Bahamut Magical earing +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Dexterity belt +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Dexterity necklace +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Magical belt +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Magical necklace +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Mana\'s belt +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Mana\'s necklace +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Physical Strength belt +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Physical Strength necklace +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Power belt +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Power earing +11 (Imóvel)', coins: 15 },
  { qty: 1, item: '[01] Bahamut Power necklace +11 (Imóvel)', coins: 15 },
];
