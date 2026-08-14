import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { getDb } from './client';
import { player, arena, arenaPlayerResult } from './schema';
import { WINNERS_PER_ARENA } from '@wyd/shared';

const PLAYER_NAMES = [
  'Qtpie', 'AstroniS', 'MeninoBom', 'xPedro', 'HellKnight', 'NoWaay', 'Mild', 'Jamelllao',
  'JogoRuim', 'Parkmann', 'xGandalf', 'zVoid', 'TuniCAO', 'S0uryuu', 'Faakri', 'oPola',
  'DogZZ', 'Zyrk', 'AgroMan', 'Faakrizera', 'MINEIRINHO', 'NOEL', 'Brawler', 'Warrior',
  'ShadowX', 'LightX', 'DarkArrow', 'StormBlade', 'IceFang', 'FireClaw',
  'ThunderPaw', 'GhostStep', 'IronWill', 'NightRider', 'DawnBreaker',
  'StarForge', 'MoonShard', 'SunBlade', 'EarthShaker', 'WindRunner',
  'VoidWalker', 'SoulReaper', 'BoneBreaker', 'SkullCrush', 'FlameHeart',
  'FrostBite', 'ToxicRush', 'AcidDrop', 'BoltStrike', 'ChainLock',
  'DeathMark', 'EtherSlip', 'FuryPath', 'GrimReach', 'HolyBolt',
  'InkStain', 'JoltEdge', 'KillSwitch', 'LavaRun', 'MindSweep',
  'NullZone', 'OmegaFist', 'PoisonTip', 'QuickSlash', 'RazorEdge',
  'SilverTear', 'TwilightArc', 'UltraForce', 'VenomCoil', 'WrathPath',
  'XenonBlast', 'YieldBreak', 'ZeroPoint', 'AlphaHunt', 'BetaStrike',
  'GammaRay', 'DeltaForce', 'EpsilonWave', 'ZetaFlow', 'EtaSlice',
  'ThetaCut', 'IotaBolt', 'KappaRun', 'LambdaDash', 'MuForce',
  'NuStrike', 'XiWave', 'OmicronBlast', 'PiCut', 'RhoSlash',
  'SigmaEdge', 'TauBolt', 'UpsilonRun', 'PhiForce', 'ChiStrike',
  'PsiWave', 'OmegaBlast', 'AlphaEdge', 'BetaCut', 'GammaSlash',
];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

async function main() {
  const db = getDb();

  console.log('Seeding players...');
  const players = await db
    .insert(player)
    .values(
      PLAYER_NAMES.slice(0, 100).map((name) => ({
        name,
        class: rand(0, 3),
        subClass: rand(0, 3),
      })),
    )
    .returning();
  console.log(`Inserted ${players.length} players.`);

  console.log('Seeding arenas...');
  const DAYS = 30;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = addDays(today, -(DAYS - 1));
  const arenaRecords: typeof arena.$inferInsert[] = [];

  const divisions = ['champion', 'aspirant'] as const;

  for (let day = 0; day < DAYS; day++) {
    const date = addDays(startDate, day);
    const arenasThisDay = date.getTime() === today.getTime() ? 2 : 4;
    for (const division of divisions) {
      for (let num = 1; num <= arenasThisDay; num++) {
        arenaRecords.push({
          arenaDate: toDateStr(date),
          arenaNumber: num,
          division,
          winnerCount: WINNERS_PER_ARENA,
          status: 'VALID',
        });
      }
    }
  }

  const arenas = await db.insert(arena).values(arenaRecords).returning();
  console.log(`Inserted ${arenas.length} arenas.`);

  console.log('Seeding arena player results...');
  const resultRows: typeof arenaPlayerResult.$inferInsert[] = [];

  for (const a of arenas) {
    const shuffled = shuffle(players);
    const winners = shuffled.slice(0, WINNERS_PER_ARENA);
    const participants = shuffled.slice(0, rand(20, 40));

    for (const p of participants) {
      const isWinner = winners.some((w) => w.id === p.id);
      resultRows.push({
        arenaId: a.id,
        playerId: p.id,
        winner: isWinner,
        winsDelta: isWinner ? 1 : 0,
        killsDelta: rand(0, 20),
        deathsDelta: rand(0, 15),
        pointsDelta: isWinner ? rand(3, 8) : rand(0, 2),
      });
    }
  }

  await db.insert(arenaPlayerResult).values(resultRows);
  console.log(`Inserted ${resultRows.length} arena player results.`);

  console.log('Seed complete!');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
