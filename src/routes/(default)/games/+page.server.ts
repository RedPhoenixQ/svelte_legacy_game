import { authError } from '$lib/error.js';

export async function load({ locals }) {
	if (!locals.pb.authStore.isValid) {
		authError('You must be logged in to view games');
	}

	const games = await locals.pb.from('games').getFullList();

	return { games };
}
