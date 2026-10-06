import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { normalizeCode } from '@/lib/batch-validation';
import { findBatch } from '@/lib/batches';

export const dynamic = 'force-dynamic';

export default async function VerifiedPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code: input } = await searchParams;
  let code: string;
  try { code = normalizeCode(input); } catch { notFound(); }
  const batch = await findBatch(code);
  if (!batch) notFound();

  return <div className="portal">
    <header className="masthead"><div className="brand">PACK<span>SOCIETY</span></div></header>
    <main><div className="signup-hero"><section className="invitation verify-result" aria-labelledby="title">
      <div className="verify-mark" aria-hidden="true"><Check size={38} strokeWidth={3} /></div>
      <h1 id="title">Item verified</h1>
      <p className="batch-code">Batch {batch.code}</p>
      <p>This batch number is recognised.</p>
      <h2 className="verified-product-name">{batch.name}</h2>
      {batch.code === 'DEMO-001' && <figure className="verified-product">
        <Image src="/products/demo-001.jpg" alt={batch.name + ' — batch ' + batch.code} width={1400} height={1150} priority />
      </figure>}
      <a className="text-button" href="/">Check another batch</a>
    </section></div></main>
    <footer><div className="brand">PACK<span>SOCIETY</span></div><span>© {new Date().getFullYear()} Pack Society</span></footer>
  </div>;
}
