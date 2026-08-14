import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

async function main() {
  const client = postgres(process.env.DATABASE_URL!, { max: 1, ssl: 'require' });
  const db = drizzle(client);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  console.log('Migrations complete.');

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
