import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	let game;
	try {
		game = await locals.pb.from('games').getOne(params.game_id, {
			select: {
				expand: {
					dms: true,
					players: true,
					active_board: true
				}
			}
		});
	} catch (err) {
		console.error(err);
		error(403, {
			message: 'The game does not exist or you do not have access to it'
		});
	}

	const data = {
		game,
		dms: game.expand!.dms,
		players: game.expand!.players,
		active_board: game.expand!['active_board']
	};
	delete game.expand;
	return data;
}
