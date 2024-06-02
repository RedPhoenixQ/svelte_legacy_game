import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	let game;
	try {
		game = await locals.pb.from('games').getOne(params.game_id, {
			select: {
				expand: {
					dms: true,
					players: true
				}
			}
		});
	} catch (err) {
		console.error(err);
		error(403, {
			message: 'The game does not exist or you do not have access to it'
		});
	}
	return {
		game
	};
}
