import { SvelteKitAuth } from '@auth/sveltekit';
import type { DefaultSession } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './server/db';
import { eq } from 'drizzle-orm';
import Strava from '@auth/sveltekit/providers/strava';
import { accounts, sessions, users, verificationTokens } from './server/db/schema';
import { env } from '$env/dynamic/private';

declare module '@auth/sveltekit' {
	interface Session {
		user: {
			userId: string;
		} & DefaultSession['user'];
		error?: 'RefreshAccessTokenError';
	}
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db, {
		// @ts-expect-error Custom user table has no email with strava
		usersTable: users,
		accountsTable: accounts,
		sessionsTable: sessions,
		verificationTokensTable: verificationTokens
	}),
	providers: [
		Strava({
			async profile(profile) {
				return { ...profile, athleteId: profile.id };
			}
		})
	],
	callbacks: {
		async session({ session, user }) {
			session.user.userId = user.id;
			const userAccounts = await db
				.select()
				.from(accounts)
				.where(eq(accounts.userId, user.id))
				.limit(1);

			if (userAccounts.length <= 0) {
				return session;
			}

			const account = userAccounts[0];
			if (
				account.refresh_token &&
				(!account.expires_at || account.expires_at * 1000 < Date.now())
			) {
				try {
					const response = await fetch('https://www.strava.com/oauth/token', {
						headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
						body: new URLSearchParams({
							client_id: env.AUTH_STRAVA_ID,
							client_secret: env.AUTH_STRAVA_SECRET,
							grant_type: 'refresh_token',
							refresh_token: account.refresh_token
						}),
						method: 'POST'
					});

					const responseTokens = await response.json();

					if (!response.ok) throw responseTokens;

					db.update(accounts)
						.set({
							access_token: responseTokens.access_token,
							expires_at: Math.floor(Date.now() / 1000 + responseTokens.expires_in),
							refresh_token: responseTokens.refresh_token ?? account.refresh_token
						})
						.where(eq(accounts.userId, user.id));
				} catch (error) {
					console.error('Error refreshing access token', error);
					// The error property can be used client-side to handle the refresh token error
					session.error = 'RefreshAccessTokenError';
				}
			}

			return session;
		}
	}
});
