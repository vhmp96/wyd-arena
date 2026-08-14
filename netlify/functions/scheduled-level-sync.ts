// Sincronização do ranking de level: 3:00 (horário de Brasília) = 6:00 UTC.
import type { Config } from '@netlify/functions';
import { levelService } from '../../apps/api/src/app';

export default async () => {
  try {
    await levelService.sync();
    console.log('[scheduled-level-sync] ok');
  } catch (err) {
    console.error('[scheduled-level-sync] erro:', err);
  }
};

export const config: Config = {
  schedule: '0 6 * * *',
};
