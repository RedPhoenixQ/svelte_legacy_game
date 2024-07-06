import { serverPb } from '$lib/pb.server';
import { authedProcedure, t } from '../t';
import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';
import { getGame } from '$lib/game/games.server';

export const combat = t.router({
	endTurn: authedProcedure
		.input(z.object({ gameId: z.string() }))
		.mutation(async ({ input: { gameId } }) => {
			const stores = getGame(gameId);

			const actionItems = stores.actionItems.get();

			console.debug(actionItems);

			const first = actionItems.items?.[0];

			// TODO: Handle when it is not the players turn;
			if (!first) throw new Error('No actionItems exists');

			// TODO: Base this on character attributes (speed)
			let delta = 10;

			for (let i = 0; i < 30; i++) {
				try {
					const record = await serverPb
						.from('actionItem')
						.update(first.id, { 'actionValue+': delta });
					stores.actionItems.handleChange({ action: 'update', record });
					// Move combat time forward
					const newBoard = await serverPb
						.from('board')
						.update(first.board, { time: first.actionValue });
					stores.board.handleChange({ action: 'update', record: newBoard });

					return record.actionValue;
				} catch (err) {
					// Retry the next action value until a unique value is found
					// Unique value are required to guarrantee that sorting is the same on all clients
					if (err instanceof ClientResponseError) {
						if (err.response.data.actionValue.code !== 'validation_not_unique') {
							console.debug('update error', err);
							throw err;
						}
						delta += 0.0001;
					}
				}
			}
			throw new Error('Could not find available actionValue', {
				cause: { item: first, finalDelta: delta }
			});
		})
});
