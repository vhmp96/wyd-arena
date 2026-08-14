// Sincronização das 19:35 (horário de Brasília) = 22:35 UTC.
import type { Config } from '@netlify/functions';
import { syncService } from '../../apps/api/src/app';

export default async () => {
  try {
    const result = await syncService.trigger('cron');
    console.log('[scheduled-sync-2]', result);
  } catch (err) {
    console.error('[scheduled-sync-2] erro:', err);
  }
};

export const config: Config = {
  schedule: '35 22 * * *',
};
