// Sincronização das 23:35 (horário de Brasília) = 02:35 UTC do dia seguinte.
import type { Config } from '@netlify/functions';
import { syncService } from '../../apps/api/src/app';

export default async () => {
  try {
    const result = await syncService.trigger('cron');
    console.log('[scheduled-sync-4]', result);
  } catch (err) {
    console.error('[scheduled-sync-4] erro:', err);
  }
};

export const config: Config = {
  schedule: '35 2 * * *',
};
