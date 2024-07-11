import { ServerGame } from '$lib/game/games.server.js';
import { authError } from '$lib/error.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals, fetch }) {
	if (!locals.pb.authStore.isValid) {
		authError('You must be logged in to play a game');
	}

	try {
		const game = await locals.pb.from('games').getOne(params.gameId, {
			fetch,
			select: {
				expand: {
					dms: true,
					players: true,
					activeBoard: {
						expand: {
							'token(board)': true,
							'actionItem(board)': true
						}
					},
					'characters(game)': true,
					'stats(game)': {
						expand: {
							'modifiers(stats)': true
						}
					}
				}
			}
		});

		new ServerGame(game);

		return game;
	} catch (err) {
		console.error(err);
		error(403, 'The game does not exist or you do not have access to it');
	}
}
