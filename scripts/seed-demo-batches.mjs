import { demoProducts } from '../lib/demo-products.ts';

const secret = process.env.ADMIN_PASSWORD;
if (process.env.NODE_ENV === 'production' || process.env.BATCH_STORAGE !== 'local' || !secret) {
  console.error('Sample batches require local development storage and an admin password.');
  process.exit(1);
}
const base = process.env.DEMO_BASE_URL || 'http://localhost:3000';
for (const product of demoProducts) {
  const response = await fetch(base + '/api/admin/batches', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + secret, Origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify({ codes: product.code, name: product.name, details: product.details, links: [], active: true })
  });
  if (!response.ok) throw new Error('Failed to add ' + product.code + ': ' + response.status);
}
console.log('Neutral sample batches DEMO-001 through DEMO-010 are ready.');
