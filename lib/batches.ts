import 'server-only';
import { neon } from '@neondatabase/serverless';
import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Batch } from './batch-validation';
type Content = Pick<Batch, 'name' | 'details' | 'links' | 'active'>;
function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('Batch storage is not configured.');
  return neon(url);
}
function localMode() { return process.env.BATCH_STORAGE === 'local' && process.env.NODE_ENV !== 'production'; }
const localPath = join(process.cwd(), 'work', 'batches.local.json');
async function readLocal(): Promise<Batch[]> {
  try { return JSON.parse(await readFile(localPath, 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
}
let pending: Promise<unknown> = Promise.resolve();
function changeLocal<T>(change: (batches: Batch[]) => T): Promise<T> {
  const operation = pending.then(async () => {
    const batches = await readLocal();
    const result = change(batches);
    await mkdir(join(process.cwd(), 'work'), { recursive: true });
    const temporary = localPath + '.' + randomUUID() + '.tmp';
    await writeFile(temporary, JSON.stringify(batches, null, 2), 'utf8');
    await rename(temporary, localPath);
    return result;
  });
  pending = operation.catch(() => {});
  return operation;
}
function fromRow(row: Record<string, unknown>): Batch {
  return { code: String(row.code), name: String(row.name), details: String(row.details), links: row.links as Batch['links'], active: Boolean(row.active), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}
export async function findBatch(code: string): Promise<Batch | null> {
  if (localMode()) return (await readLocal()).find(batch => batch.code === code && batch.active) || null;
  const sql = database();
  const rows = await sql`SELECT * FROM batches WHERE code = ${code} AND active = true LIMIT 1`;
  return rows[0] ? fromRow(rows[0]) : null;
}
export async function listBatches(query: string, page: number) {
  const offset = (page - 1) * 50;
  if (localMode()) {
    const all = (await readLocal()).filter(batch => batch.code.includes(query) || batch.name.toUpperCase().includes(query)).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.code.localeCompare(b.code));
    return { batches: all.slice(offset, offset + 50), total: all.length, storage: 'local' };
  }
  const sql = database();
  const [rows, totals] = await Promise.all([
    sql`SELECT * FROM batches WHERE position(${query} in code) > 0 OR position(${query} in upper(name)) > 0 ORDER BY created_at DESC, code LIMIT 50 OFFSET ${offset}`,
    sql`SELECT count(*)::int AS total FROM batches WHERE position(${query} in code) > 0 OR position(${query} in upper(name)) > 0`
  ]);
  return { batches: rows.map(fromRow), total: Number(totals[0].total), storage: 'database' };
}
export async function addBatches(codes: string[], content: Content): Promise<string[]> {
  if (localMode()) return changeLocal(batches => {
    const added: string[] = [];
    const now = new Date().toISOString();
    for (const code of codes) if (!batches.some(batch => batch.code === code)) {
      batches.push({ code, ...content, createdAt: now, updatedAt: now });
      added.push(code);
    }
    return added;
  });
  const sql = database();
  const records = codes.map(code => ({ code, ...content }));
  const rows = await sql`INSERT INTO batches (code, name, details, links, active)
    SELECT code, name, details, links, active FROM jsonb_to_recordset(${JSON.stringify(records)}::jsonb)
    AS records(code text, name text, details text, links jsonb, active boolean)
    ON CONFLICT (code) DO NOTHING RETURNING code`;
  return rows.map(row => String(row.code));
}
export async function updateBatch(code: string, content: Content): Promise<boolean> {
  if (localMode()) return changeLocal(batches => {
    const index = batches.findIndex(batch => batch.code === code);
    if (index === -1) return false;
    batches[index] = { ...batches[index], ...content, updatedAt: new Date().toISOString() };
    return true;
  });
  const sql = database();
  const rows = await sql`UPDATE batches SET name = ${content.name}, details = ${content.details},
    links = ${JSON.stringify(content.links)}::jsonb, active = ${content.active}, updated_at = now()
    WHERE code = ${code} RETURNING code`;
  return rows.length > 0;
}
