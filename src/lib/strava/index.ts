import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { accounts, users } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { Session } from '@auth/sveltekit';

const getAtheleteFromSession = async (session: Session) => {
	const athletes = await db
		.select()
		.from(accounts)
		.where(eq(accounts.userId, session.user.userId))
		.leftJoin(users, eq(users.id, accounts.userId))
		.limit(1);

	if (
		athletes.length === 0 ||
		!athletes[0].user ||
		!athletes[0].account.access_token ||
		!athletes[0].user.athleteId
	) {
		error(401, 'user incomplete');
	}

	//FIXME: For some reason strava add a special . to the profile id..
	const id = athletes[0].user.athleteId.split('.')[0];

	return { token: athletes[0].account.access_token, id };
};

const stravaFetch = async (accessToken: string, path: string) => {
	console.log('accessToken', accessToken);
	console.log('path', path);
	return await fetch(`https://www.strava.com/api/v3/${path}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	}).then((res) => res.json());
};

const getAthleteStats = async (session: Session) => {
	const { token, id } = await getAtheleteFromSession(session);
	return await stravaFetch(token, `athletes/${id}/stats`);
};

export { getAthleteStats };
