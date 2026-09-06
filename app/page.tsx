'use client';
import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DinoGame from '@/components/dino-game';
export default function Home(){
 const [showSignup,setShowSignup]=useState(false);
 const [email,setEmail]=useState(''),[status,setStatus]=useState('idle'),[error,setError]=useState('');
 useEffect(()=>{if(!showSignup)return;document.getElementById('title')?.focus();const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options:unknown)=>void|Promise<void>}}).modelContext;if(!context)return;const lifecycle=new AbortController();try{Promise.resolve(context.registerTool({name:'prepare_membership_email',description:'Fill the membership email field for review. Does not submit or save registration.',inputSchema:{type:'object',properties:{email:{type:'string'}},required:['email'],additionalProperties:false},annotations:{readOnlyHint:false},execute:(input:unknown)=>{const value=(input as {email?:unknown})?.email;if(typeof value!=='string'||value.length>254||!/^\S+@\S+\.\S+$/.test(value))return {prepared:false,error:'A valid email is required.'};setEmail(value);return {prepared:true};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}return ()=>lifecycle.abort();},[showSignup]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const website=String(new FormData(e.currentTarget).get('website')||'');setStatus('sending');setError('');try{const r=await fetch('/api/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,website})});if(!r.ok)throw new Error(r.status===400?'Please enter a valid email address.':'We couldn’t save your registration. Please try again.');setStatus('success');setEmail('');}catch(e){setError(e instanceof Error?e.message:'Please try again.');setStatus('idle');}}
 if(!showSignup)return <DinoGame onGameOver={()=>setShowSignup(true)}/>;
 return <div className="portal">
   <header className="masthead">
     <div className="brand">PACK<span>SOCIETY</span></div>
   </header>
   <main>
     <div className="signup-hero">
       <section className="invitation" aria-labelledby="title">
         <h1 id="title" tabIndex={-1}>{status==='success'?'You’re registered':'Join Pack Society'}</h1>
         {status==='success' ? <div className="success" role="status"><Check size={22}/> Your registration has been received.</div> :
         <form onSubmit={submit}>
           <label htmlFor="email">Your email address<span className="required" aria-hidden="true">*</span></label>
           <div className="signup-row">
             <Input id="email" name="email" type="email" autoComplete="email" placeholder="Enter your email address" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={status==='sending'} aria-describedby={error?'form-error':'email-note'} className="email-input"/>
             <Button type="submit" disabled={status==='sending'} className="join-button">{status==='sending'?'Registering…':'Join the Society'}</Button>
           </div>
           <div className="honey" aria-hidden="true"><input name="website" tabIndex={-1} autoComplete="off" aria-label="Website"/></div>
           {error&&<p id="form-error" role="alert" className="error">{error}</p>}
           <p id="email-note" className="disclosure">Your email will be stored for membership registration.</p>
         </form>}
       </section>
     </div>
   </main>
   <footer><div className="brand">PACK<span>SOCIETY</span></div><span>© {new Date().getFullYear()} Pack Society</span></footer>
 </div>;
}
