'use client';
import { useState } from 'react';
import type { Batch, BatchLink } from '@/lib/batch-validation';
const empty = { codes: '', name: '', details: '', links: [] as BatchLink[], active: true };
export default function Admin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [total, setTotal] = useState(0);
  const [storage, setStorage] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  async function load(secret: string, search = query, currentPage = page) {
    const response = await fetch('/api/admin/batches?q=' + encodeURIComponent(search) + '&page=' + currentPage, { headers: { Authorization: 'Bearer ' + secret }, cache: 'no-store' });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) setToken('');
      throw new Error(result.error || 'Could not load batches.');
    }
    setBatches(result.batches); setTotal(result.total); setStorage(result.storage);
    setPage(currentPage);
  }
  async function action(work: () => Promise<void>) {
    setBusy(true); setError('');
    try { await work(); } catch (error) { setError(error instanceof Error ? error.message : 'Please try again.'); }
    finally { setBusy(false); }
  }
  function edit(batch: Batch) {
    setEditing(batch.code); setNotice('');
    setForm({ codes: batch.code, name: batch.name, details: batch.details, links: batch.links.map(link => ({ ...link })), active: batch.active });
    document.getElementById('batch-editor')?.scrollIntoView({ behavior: 'smooth' });
  }
  function reset() { setEditing(''); setForm({ ...empty, links: [] }); }
  async function save() {
    const response = await fetch('/api/admin/batches', {
      method: editing ? 'PATCH' : 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, code: editing })
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 401) setToken('');
      throw new Error(result.error || 'Could not save batch.');
    }
    setNotice(editing ? 'Batch updated.' : result.added + ' batch(es) added. ' + result.skipped + ' existing batch(es) skipped.');
    reset(); await load(token, query, 1);
  }
  return <div className="portal">
    <header className="masthead"><div className="brand">PACK<span>SOCIETY</span></div><span>Batch management</span></header>
    <main className="admin-main">
      {!token ? <section className="admin-login">
        <h1>Admin sign in</h1>
        <form onSubmit={event => { event.preventDefault(); void action(async () => { const secret = password.trim(); await load(secret, '', 1); setToken(secret); setPassword(''); setShowPassword(false); }); }}>
          <label htmlFor="admin-password">Admin password</label>
          <input id="admin-password" className="email-input" type={showPassword ? "text" : "password"} required autoComplete="current-password" spellCheck={false} autoCapitalize="off" value={password} onChange={event => setPassword(event.target.value)} />
          <button type="button" className="text-button" aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide password' : 'Show password'}</button>
          <p className="field-note">Enter only the value after ADMIN_PASSWORD= in your .env.local file.</p>
          <button className="join-button" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </form>
      </section> : <>
        <div className="admin-heading"><h1>Batch index</h1><button className="text-button" disabled={busy} onClick={() => { setToken(''); setBatches([]); reset(); setNotice(''); }}>Sign out</button></div>
        {storage === 'local' && <p className="admin-note">Local preview storage. Configure the hosted database before publishing.</p>}
        <section id="batch-editor" className="admin-card">
          <h2>{editing ? 'Edit ' + editing : 'Add batches'}</h2>
          <form onSubmit={event => { event.preventDefault(); void action(save); }}>
            <label htmlFor="codes">Batch number{editing ? '' : 's'}</label>
            <textarea id="codes" rows={editing ? 1 : 3} required maxLength={6500} disabled={Boolean(editing) || busy} value={form.codes} placeholder="One number per line, or separate with commas" onChange={event => setForm({ ...form, codes: event.target.value })} />
            {!editing && <p className="field-note">Add up to 100 numbers. Each gets the details and links below. Existing numbers are skipped.</p>}
            <label htmlFor="product-name">Product name</label>
            <input id="product-name" required maxLength={120} value={form.name} disabled={busy} onChange={event => setForm({ ...form, name: event.target.value })} />
            <label htmlFor="details">Final page details</label>
            <textarea id="details" rows={4} maxLength={4000} value={form.details} disabled={busy} onChange={event => setForm({ ...form, details: event.target.value })} />
            <h3>Final page links</h3>
            {form.links.map((link, index) => <div className="admin-link-row" key={index}>
              <input aria-label={'Link ' + (index + 1) + ' label'} required maxLength={80} placeholder="Link label" value={link.label} disabled={busy} onChange={event => setForm({ ...form, links: form.links.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              <input aria-label={'Link ' + (index + 1) + ' address'} required type="url" maxLength={2048} placeholder="https://" value={link.url} disabled={busy} onChange={event => setForm({ ...form, links: form.links.map((item, i) => i === index ? { ...item, url: event.target.value } : item) })} />
              <button type="button" className="text-button" disabled={busy} onClick={() => setForm({ ...form, links: form.links.filter((_, i) => i !== index) })}>Remove</button>
            </div>)}
            <button type="button" className="text-button" disabled={busy || form.links.length >= 8} onClick={() => setForm({ ...form, links: [...form.links, { label: '', url: '' }] })}>+ Add link</button>
            <label className="checkbox-label"><input type="checkbox" checked={form.active} disabled={busy} onChange={event => setForm({ ...form, active: event.target.checked })} />Active — customers can verify this batch</label>
            <div className="admin-actions"><button className="join-button" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add batches'}</button>{editing && <button type="button" className="text-button" disabled={busy} onClick={reset}>Cancel edit</button>}</div>
          </form>
        </section>
        <section className="admin-card">
          <h2>{total} batch{total === 1 ? '' : 'es'}</h2>
          <form className="admin-search" onSubmit={event => { event.preventDefault(); void action(() => load(token, query, 1)); }}>
            <input aria-label="Search batches" placeholder="Search by batch number or product name" maxLength={120} value={query} onChange={event => setQuery(event.target.value)} />
            <button className="join-button" disabled={busy}>Search</button>
          </form>
          <div className="table-wrap"><table><thead><tr><th>Batch</th><th>Product</th><th>Status</th><th>Added</th><th>Action</th></tr></thead><tbody>
            {batches.map(batch => <tr key={batch.code}><td className="batch-code">{batch.code}</td><td>{batch.name}</td><td>{batch.active ? 'Active' : 'Inactive'}</td><td>{new Date(batch.createdAt).toLocaleDateString('en-GB')}</td><td><button className="text-button" disabled={busy} onClick={() => edit(batch)}>Edit</button></td></tr>)}
            {!batches.length && <tr><td colSpan={5}>No batches found.</td></tr>}
          </tbody></table></div>
          <div className="admin-pagination"><button disabled={busy || page <= 1} onClick={() => void action(() => load(token, query, page - 1))}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 50))}</span><button disabled={busy || page * 50 >= total} onClick={() => void action(() => load(token, query, page + 1))}>Next</button></div>
        </section>
      </>}
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}
    </main>
  </div>;
}
