import { createHmac, timingSafeEqual } from 'crypto';

function secret(): string {
  const s = process.env.ADMIN_PASSWORD;
  if (!s) throw new Error('ADMIN_PASSWORD não definido');
  return s;
}

export function generateToken(): string {
  return createHmac('sha256', secret()).update('admin-access').digest('hex');
}

export function validateToken(token: string): boolean {
  try {
    const expected = generateToken();
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
