import { defineConfig } from 'drizzle-kit';

if (!process.env.AUTH_DRIZZLE_URL) throw new Error('DATABASE_URL is not set');

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	dialect: 'sqlite',

	dbCredentials: {
		url: process.env.AUTH_DRIZZLE_URL
	},

	verbose: true,
	strict: true
});
