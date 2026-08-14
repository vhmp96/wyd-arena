// Consolidação de temporada: roda TODO DIA às 23:55 (horário de Brasília) = 02:55
// UTC do dia seguinte, mas só faz alguma coisa de verdade quando shouldRunCron()
// confirma que hoje é o último dia do mês (a checagem já existia no código
// original, só movida pra cá).
import type { Config } from '@netlify/functions';
import { seasonService } from '../../apps/api/src/app';

export default async () => {
  if (!seasonService.shouldRunCron()) return;
  try {
    const result = await seasonService.consolidate();
    console.log('[scheduled-season-consolidate]', result);
  } catch (err) {
    console.error('[scheduled-season-consolidate] erro:', err);
  }
};

export const config: Config = {
  schedule: '55 2 * * *',
};
