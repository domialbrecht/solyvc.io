import { getAthleteStats } from '$lib/strava';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	if (!session || !session.user) {
		error(401, 'not logged in session');
	}

	const stats = await getAthleteStats(session);

	return {
		stats: stats
	};
};
