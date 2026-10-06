import { createHash, timingSafeEqual } from 'node:crypto';
export function checkAdmin(request: Request, password = process.env.ADMIN_PASSWORD): 'ok' | 'unconfigured' | 'unauthorized' {
  if (!password || password.length < 24) return 'unconfigured';
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.startsWith('Bearer ') || authorization.length > 1024) return 'unauthorized';
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(authorization.slice(7)), digest(password)) ? 'ok' : 'unauthorized';
}
export function sameOrigin(request: Request): boolean {
  return request.headers.get('origin') === new URL(request.url).origin;
}
