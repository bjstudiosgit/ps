'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { document.getElementById('title')?.focus(); }, []);

  async function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Please try again.');
      router.push('/verified?code=' + encodeURIComponent(result.code));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification unavailable. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return <div className="portal">
    <header className="masthead"><div className="brand">PACK<span>SOCIETY</span></div></header>
    <main><div className="signup-hero"><section className="invitation" aria-labelledby="title">
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
    </section></div></main>
    <footer><div className="brand">PACK<span>SOCIETY</span></div><span>© {new Date().getFullYear()} Pack Society</span></footer>
  </div>;
}
