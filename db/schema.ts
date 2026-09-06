import { sqliteTable,text } from 'drizzle-orm/sqlite-core';
export const registrations=sqliteTable('registrations',{email:text('email').primaryKey()});
