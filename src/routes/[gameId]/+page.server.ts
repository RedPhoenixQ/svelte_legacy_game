import { authError } from '$lib/error.js';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (!locals.pb.authStore.isValid) {
		authError('You must be logged in to play a game');
	}

	let game;
	try {
		game = await locals.pb.from('games').getOne(params.gameId, {
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
		activeBoard: game.expand?.activeBoard,
		tokens: game.expand?.activeBoard?.expand?.['token(board)'],
		actionItems: game.expand?.activeBoard?.expand?.['actionItem(board)'],
		characters: game.expand!['characters(game)'] ?? []
	};
	delete game.expand;
	return data;
}
