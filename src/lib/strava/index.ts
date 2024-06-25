import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { accounts, users } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { Session } from '@auth/sveltekit';

const CLUB = 'solyvc';
const BALMBERGSEGMENT = 12482665;

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

const stravaFetch = async (session: Session, path: string) => {
	const { token } = await getAtheleteFromSession(session);
	return await fetch(`https://www.strava.com/api/v3/${path}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	}).then((res) => res.json());
};

const getAthleteStats = async (session: Session) => {
	const { id } = await getAtheleteFromSession(session);
	return await stravaFetch(session, `athletes/${id}/stats`);
};

const getClubActivities = async (session: Session) => {
	return await stravaFetch(session, `clubs/${CLUB}/activities`);
};

const getClubMembers = async (session: Session) => {
	return await stravaFetch(session, `clubs/${CLUB}/members`);
};

export { getAthleteStats, getClubActivities, getClubMembers };
