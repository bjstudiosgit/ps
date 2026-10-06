import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode, parseCodes, validateBatch } from '../lib/batch-validation.ts';
import { checkAdmin, sameOrigin } from '../lib/admin-auth.ts';
test('batch codes are normalized without removing meaningful characters', () => {
  assert.equal(normalizeCode(' ps-001 '), 'PS-001');
  assert.equal(normalizeCode('000123'), '000123');
  assert.deepEqual(parseCodes('ps-001, PS-001\nPS-002'), ['PS-001', 'PS-002']);
  for (const code of ['', 'x', 'ABC/123', 'ABC 123', '<script>', 'a'.repeat(65)]) assert.throws(() => normalizeCode(code));
  assert.throws(() => parseCodes(Array.from({length: 101}, (_, i) => 'B-' + i).join('\n')));
});
test('final page content rejects unsafe links and invalid sizes', () => {
  const content = { name: 'Product', details: 'Details', active: true, links: [{ label: 'Website', url: 'https://example.com' }] };
  assert.equal(validateBatch(content).links[0].url, 'https://example.com/');
  for (const url of ['javascript:alert(1)', 'data:text/html,hi', '/relative', 'https://user:pass@example.com']) {
    assert.throws(() => validateBatch({ ...content, links: [{ label: 'Website', url }] }));
  }
  assert.throws(() => validateBatch({ ...content, name: '' }));
  assert.throws(() => validateBatch({ ...content, active: 'true' }));
  assert.throws(() => validateBatch({ ...content, links: Array(9).fill(content.links[0]) }));
});
test('admin access fails closed without a strong configured password', () => {
  const secret = 'a-test-only-password-at-least-24-characters';
  const request = token => new Request('http://localhost:3000/api/admin/batches', { headers: { Authorization: token } });
  assert.equal(checkAdmin(request('Bearer ' + secret), ''), 'unconfigured');
  assert.equal(checkAdmin(request('Bearer short'), 'short'), 'unconfigured');
  assert.equal(checkAdmin(request('Bearer ' + secret), secret), 'ok');
  assert.equal(checkAdmin(request('Bearer wrong'), secret), 'unauthorized');
  assert.equal(checkAdmin(request('Basic ' + secret), secret), 'unauthorized');
});
test('mutations require the exact site origin', () => {
  const request = origin => new Request('https://example.com/api/admin/batches', { headers: origin ? { origin } : {} });
  assert.equal(sameOrigin(request('https://example.com')), true);
  assert.equal(sameOrigin(request('https://evil.example')), false);
  assert.equal(sameOrigin(request()), false);
});
