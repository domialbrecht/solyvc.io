import { redirect, type Handle } from '@sveltejs/kit';
import { handle as authenticationHandle } from '$lib/auth';
import { sequence } from '@sveltejs/kit/hooks';

const authorizationHandle: Handle = async ({ event, resolve }) => {
	if (!event.url.pathname.startsWith('/auth')) {
		const session = await event.locals.auth();
		if (!session || session.error === 'RefreshAccessTokenError') {
			throw redirect(303, '/auth/signin');
		}
	}
	return await resolve(event);
};

export const handle: Handle = sequence(authenticationHandle, authorizationHandle);
