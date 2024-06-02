import { error } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.pb.authStore.isValid) {
		// TODO: reroute to some login page
		error(403, 'You must be logged in to view games');
	}

	const games = await locals.pb.from('games').getFullList();

	return { games };
}
