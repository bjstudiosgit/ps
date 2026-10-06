export type BatchLink = { label: string; url: string };
export type Batch = { code: string; name: string; details: string; links: BatchLink[]; active: boolean; createdAt: string; updatedAt: string };
export function normalizeCode(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Enter a batch number.');
  const code = value.trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{2,63}$/.test(code)) throw new Error('Use 3–64 letters, numbers or hyphens for the batch number.');
  return code;
}
export function validateBatch(input: unknown) {
  if (!input || typeof input !== 'object') throw new Error('Invalid batch details.');
  const data = input as Record<string, unknown>;
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  const details = typeof data.details === 'string' ? data.details.trim() : '';
  if (!name || name.length > 120) throw new Error('Enter a product name of up to 120 characters.');
  if (details.length > 4000) throw new Error('Details must be under 4,000 characters.');
  if (!Array.isArray(data.links) || data.links.length > 8) throw new Error('Add up to eight links.');
  const links = data.links.map((link: unknown): BatchLink => {
    if (!link || typeof link !== 'object') throw new Error('Invalid link.');
    const item = link as Record<string, unknown>;
    const label = typeof item.label === 'string' ? item.label.trim() : '';
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    if (!label || label.length > 80 || url.length > 2048) throw new Error('Each link needs a short label and a valid web address.');
    let parsed: URL;
    try { parsed = new URL(url); } catch { throw new Error('Links must use a full https:// or http:// address.'); }
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error('Links must use a public web address.');
    return { label, url: parsed.href };
  });
  if (typeof data.active !== 'boolean') throw new Error('Choose whether the batch is active.');
  return { name, details, links, active: data.active };
}
export function parseCodes(value: unknown): string[] {
  if (typeof value !== 'string' || value.length > 6500) throw new Error('Add up to 100 batch numbers.');
  const codes = [...new Set(value.split(/[\s,;]+/).filter(Boolean).map(normalizeCode))];
  if (!codes.length || codes.length > 100) throw new Error('Add between one and 100 batch numbers.');
  return codes;
}
