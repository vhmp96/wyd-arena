// Sincronização das 21:05 (horário de Brasília) = 00:05 UTC do dia seguinte.
import type { Config } from '@netlify/functions';
import { syncService } from '../../apps/api/src/app';

export default async () => {
  try {
    const result = await syncService.trigger('cron');
    console.log('[scheduled-sync-3]', result);
  } catch (err) {
    console.error('[scheduled-sync-3] erro:', err);
  }
};

export const config: Config = {
  schedule: '5 0 * * *',
};
