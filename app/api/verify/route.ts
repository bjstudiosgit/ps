import { findBatch } from '@/lib/batches';
import { normalizeCode } from '@/lib/batch-validation';
import { sameOrigin } from '@/lib/admin-auth';
export const runtime = 'nodejs';
const headers = { 'Cache-Control': 'no-store' };
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: 'Invalid origin.' }, { status: 403, headers });
  if (!request.headers.get('content-type')?.includes('application/json')) return Response.json({ error: 'JSON required.' }, { status: 415, headers });
  let code: string;
  try {
    const body = await request.text();
    if (body.length > 1024) throw new Error('Request too large.');
    code = normalizeCode(JSON.parse(body)?.code);
  } catch { return Response.json({ error: 'Enter a valid batch number from your pack.' }, { status: 400, headers }); }
  try {
    const batch = await findBatch(code);
    if (!batch) return Response.json({ error: 'That batch number could not be verified. Check your pack and try again.' }, { status: 404, headers });
    return Response.json({ verified: true, code: batch.code }, { headers });
  } catch { return Response.json({ error: 'Verification is temporarily unavailable. Please try again later.' }, { status: 503, headers }); }
}
