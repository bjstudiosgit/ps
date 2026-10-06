'use client';
import { useEffect, useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import DinoGame from '@/components/dino-game';
import DemoProductArt from '@/components/demo-product-art';
import { getDemoProduct } from '@/lib/demo-products';
import type { BatchLink } from '@/lib/batch-validation';
type VerifiedBatch = { code: string; name: string; details: string; links: BatchLink[] };
export default function Home() {
  const [showPortal, setShowPortal] = useState(false);
  const [code, setCode] = useState('');
  const [batch, setBatch] = useState<VerifiedBatch | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (showPortal) document.getElementById('title')?.focus();
  }, [showPortal, batch]);
  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      setBatch(result.batch);
    } catch (error) { setError(error instanceof Error ? error.message : 'Verification unavailable. Please try again.'); }
    finally { setBusy(false); }
  }
  if (!showPortal) return <DinoGame onGameOver={() => setShowPortal(true)} />;
  return <div className="portal">
    <header className="masthead"><div className="brand">PACK<span>SOCIETY</span></div></header>
    <main><div className="signup-hero"><section className="invitation" aria-labelledby="title">
      {batch ? <>
        <div className="success"><Check size={22} /> Batch verified</div>
        <h1 id="title" tabIndex={-1}>{batch.name}</h1>
        <p className="batch-code">Batch {batch.code}</p>
        {getDemoProduct(batch.code) && <DemoProductArt product={getDemoProduct(batch.code)!} />}
        {batch.details && <p className="batch-details">{batch.details}</p>}
        {getDemoProduct(batch.code) && <a className="demo-back" href={'/demo/' + batch.code}>View sample product page</a>}
        <div className="batch-links">{batch.links.map(link => <a key={link.url + link.label} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight size={20} /></a>)}</div>
        <button className="text-button" onClick={() => { setBatch(null); setCode(''); setError(''); }}>Check another batch</button>
      </> : <>
        <h1 id="title" tabIndex={-1}>Check your batch</h1>
        <p className="batch-intro">Enter the batch number printed beside the barcode on your pack.</p>
        <form onSubmit={verify}>
          <label htmlFor="batch">Batch number</label>
          <div className="signup-row">
            <input id="batch" className="email-input" required maxLength={64} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="Enter your batch number" value={code} onChange={event => setCode(event.target.value)} disabled={busy} aria-describedby={error ? 'batch-error' : undefined} />
            <button className="join-button" disabled={busy}>{busy ? 'Checking…' : 'Verify batch'}</button>
          </div>
          {error && <p id="batch-error" className="error" role="alert">{error}</p>}
        </form>
      </>}
    </section></div></main>
    <footer><div className="brand">PACK<span>SOCIETY</span></div><span>© {new Date().getFullYear()} Pack Society</span></footer>
  </div>;
}
