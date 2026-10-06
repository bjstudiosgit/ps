import 'server-only';
import { neon } from '@neondatabase/serverless';

export async function saveRegistration(email: string) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('Registration storage unavailable');
  const sql = neon(connectionString);
  await sql`INSERT INTO registrations (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
}
