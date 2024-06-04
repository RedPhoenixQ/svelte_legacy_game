import { authError } from '$lib/error.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (!locals.pb.authStore.isValid) {
		authError('You must be logged in to play a game');
	}

	let game;
	try {
		game = await locals.pb.from('games').getOne(params.game_id, {
			select: {
				expand: {
					dms: true,
					players: true,
					active_board: {
						expand: {
							'token(board)': true
						}
					},
					'characters(game)': true
				}
			}
		});
	} catch (err) {
		console.error(err);
		error(403, 'The game does not exist or you do not have access to it');
	}

	const data = {
		game,
		dms: game.expand!.dms ?? [],
		players: game.expand!.players ?? [],
		active_board: game.expand?.active_board,
		characters: game.expand!['characters(game)'] ?? []
	};
	delete game.expand;
	return data;
}
