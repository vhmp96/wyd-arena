// Sincronização das 13:35 (horário de Brasília) = 16:35 UTC.
// Netlify roda Scheduled Functions sempre em UTC — por isso o horário aqui é
// diferente do que aparece pro jogador. Ajuste os dois juntos se mudar o horário
// oficial da arena no jogo.
import type { Config } from '@netlify/functions';
import { syncService } from '../../apps/api/src/app';

export default async () => {
  try {
    const result = await syncService.trigger('cron');
    console.log('[scheduled-sync-1]', result);
  } catch (err) {
    console.error('[scheduled-sync-1] erro:', err);
  }
};

export const config: Config = {
  schedule: '35 16 * * *',
};
