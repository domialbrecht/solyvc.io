import { SvelteKitAuth } from '@auth/sveltekit';
import Strava from '@auth/sveltekit/providers/strava';

export const { handle, signIn, signOut } = SvelteKitAuth({
	providers: [Strava]
});
