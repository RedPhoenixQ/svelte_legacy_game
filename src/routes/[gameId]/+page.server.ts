import { ServerGame } from '$lib/game/games.server.js';
import { authError } from '$lib/error.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals, fetch }) {
	if (!locals.pb.authStore.isValid) {
		authError('You must be logged in to play a game');
	}

	try {
		const game = await ServerGame.fetchGame(params.gameId, locals.pb, { fetch });
		new ServerGame(game);
		return game;
	} catch (err) {
		console.error(err);
		error(403, 'The game does not exist or you do not have access to it');
	}
}
