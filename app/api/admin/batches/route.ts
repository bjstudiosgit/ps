import { checkAdmin, sameOrigin } from '@/lib/admin-auth';
import { validateBatch, parseCodes, normalizeCode } from '@/lib/batch-validation';
import { addBatches, listBatches, updateBatch } from '@/lib/batches';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
function authorize(request: Request) {
  const result = checkAdmin(request);
  if (result === 'unconfigured') return Response.json({ error: 'Admin access is not configured.' }, { status: 503, headers });
  if (result !== 'ok') return Response.json({ error: 'Incorrect admin password.' }, { status: 401, headers });
  return null;
}
export async function GET(request: Request) {
  const denied = authorize(request);
  if (denied) return denied;
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim().toUpperCase().slice(0, 120);
  const page = Math.max(1, Math.min(100000, Number(url.searchParams.get('page')) || 1));
  if (!Number.isInteger(page)) return Response.json({ error: 'Invalid page.' }, { status: 400, headers });
  try { return Response.json(await listBatches(query, page), { headers }); }
  catch { return Response.json({ error: 'Batch storage is unavailable. Configure storage and initialize the schema.' }, { status: 503, headers }); }
}
async function mutate(request: Request, update: boolean) {
  const denied = authorize(request);
  if (denied) return denied;
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid origin.' }, { status: 403, headers });
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ error: 'JSON required.' }, { status: 415, headers });
  let content: ReturnType<typeof validateBatch>, codes: string[];
  try {
    const body = await request.text();
    if (body.length > 40000) throw new Error('Request too large.');
    const data = JSON.parse(body);
    content = validateBatch(data);
    codes = update ? [normalizeCode(data.code)] : parseCodes(data.codes);
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : 'Invalid request.' }, { status: 400, headers }); }
  try {
    if (update) {
      if (!await updateBatch(codes[0], content)) return Response.json({ error: 'Batch not found.' }, { status: 404, headers });
      return Response.json({ updated: true }, { headers });
    }
    const added = await addBatches(codes, content);
    return Response.json({ added: added.length, skipped: codes.length - added.length }, { status: added.length ? 201 : 200, headers });
  } catch { return Response.json({ error: 'Could not save batches. Please try again.' }, { status: 503, headers }); }
}
export function POST(request: Request) { return mutate(request, false); }
export function PATCH(request: Request) { return mutate(request, true); }
