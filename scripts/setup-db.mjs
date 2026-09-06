import { readFile } from 'node:fs/promises';
import { neon } from '@neondatabase/serverless';

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes('USER:PASSWORD')) {
  console.error('Set DATABASE_URL in .env.local before running npm run db:setup.');
  process.exitCode = 1;
} else {
  try {
    const sql = neon(connectionString);
    const schema = await readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
    await sql.query(schema);
    console.log('Registration database is ready.');
  } catch {
    console.error('Database setup failed. Check DATABASE_URL and database access.');
    process.exitCode = 1;
  }
}
