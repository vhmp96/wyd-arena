import type { Context, Next } from 'hono';
import { validateToken } from '../lib/auth';

export async function requireAuth(c: Context, next: Next) {
  const auth = c.req.header('Authorization') ?? '';
  const token = auth.replace('Bearer ', '').trim();
  if (!validateToken(token)) {
    return c.json({ error: 'Não autorizado' }, 401);
  }
  return next();
}
