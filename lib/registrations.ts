import { env } from 'cloudflare:workers';
export async function saveRegistration(email:string){
 if(!env.DB)throw new Error('Registration storage unavailable');
 await env.DB.prepare('INSERT INTO registrations (email) VALUES (?) ON CONFLICT(email) DO NOTHING').bind(email).run();
}
