import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { env } from '$env/dynamic/private';

if (!env.AUTH_DRIZZLE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.AUTH_DRIZZLE_URL);
export const db = drizzle(client);
