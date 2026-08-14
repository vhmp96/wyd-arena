import { Hono } from 'hono';
import { timingSafeEqual } from 'crypto';
import { generateToken } from '../lib/auth';

export function createAuthRoutes() {
  const app = new Hono();

  app.post('/login', async (c) => {
    const body = await c.req.json<{ password?: string }>().catch(() => ({ password: undefined }));
    const { password } = body;
    const expected = process.env.ADMIN_PASSWORD;

    if (!expected || !password) {
      return c.json({ error: 'Senha incorreta' }, 401);
    }

    const a = Buffer.from(password);
    const b = Buffer.from(expected);
    const valid = a.length === b.length && timingSafeEqual(a, b);

    if (!valid) {
      return c.json({ error: 'Senha incorreta' }, 401);
    }

    return c.json({ token: generateToken() });
  });

  return app;
}
