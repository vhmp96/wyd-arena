import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb(url?: string) {
  if (_db) return _db;
  const connectionString = url ?? process.env.DATABASE_URL!;
  // "require" criptografa a conexão sem exigir o certificado específico do
  // provedor (a AWS, por exemplo, sugere um modo mais estrito chamado
  // "verify-full", que pediria baixar e referenciar um arquivo de certificado
  // à parte — desnecessário aqui, já que a criptografia em trânsito já
  // protege contra o que mais importa nesse cenário).
  const client = postgres(connectionString, { ssl: 'require' });
  _db = drizzle(client, { schema });
  return _db;
}

export type Db = ReturnType<typeof getDb>;
