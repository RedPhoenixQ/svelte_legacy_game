import { serverPb } from '$lib/pb.server';
import { authedProcedure, t } from '../t';
import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';
import { getGame } from '$lib/game/games.server';
import { TRPCError } from '@trpc/server';

export const combat = t.router({
	endTurn: authedProcedure
		.input(z.object({ gameId: z.string() }))
		.mutation(async ({ input: { gameId } }) => {
			const stores = getGame(gameId);

			console.debug(stores.actionItems.val);

			const first = stores.actionItems.val.items?.[0];

			// TODO: Handle when it is not the players turn;
			if (!first) throw new Error('No actionItems exists');

			// TODO: Base this on character attributes (speed)
			let delta = 10;

			if (first.modifiers.length) {
				try {
					await serverPb.from('actionItem').delete(first.id);
					stores.actionItems.handleChange({ action: 'delete', record: first });
					const deleteMods = [];
					for (const id of first.modifiers) {
						deleteMods.push(serverPb.from('modifiers').delete(id));
					}
					await Promise.all(deleteMods);
					// for (const id of first.modifiers) {
					// 	stores.modifiers.remove(id);
					// }
				} catch (err) {
					console.error('Error handling modifier action Item', err);
				}
			} else {
				let success = false;
				for (let i = 0; i < 30; i++) {
					try {
						const record = await serverPb
							.from('actionItem')
							.update(first.id, { 'actionValue+': delta });
						stores.actionItems.handleChange({ action: 'update', record });
						success = true;
						break;
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
				if (!success) {
					throw new Error('Could not find available actionValue', {
						cause: { item: first, finalDelta: delta }
					});
				}
			}

			// Move combat time forward
			const newBoard = await serverPb
				.from('board')
				.update(first.board, { time: first.actionValue });
			stores.board.handleChange({ action: 'update', record: newBoard });
			return first.actionValue;
		}),
	testAction: authedProcedure
		.input(z.object({ gameId: z.string() }))
		.mutation(async ({ input: { gameId } }) => {
			const stores = getGame(gameId);

			if (!stores.board.val)
				throw new TRPCError({ code: 'BAD_REQUEST', message: 'There is no active board' });

			const createMods = [];
			for (const stats of stores.stats.val.character.values()) {
				createMods.push(
					serverPb.from('modifiers').create({
						attribute: 'maxHp',
						stats: stats.id,
						multiplier: -0.5,
						applyPost: true
					})
				);
			}
			const newMods = await Promise.all(createMods);
			for (const record of newMods) {
				stores.modifiers.handleChange({ action: 'create', record });
			}

			serverPb.from('actionItem').create({
				board: stores.board.val.id,
				modifiers: newMods.map(({ id }) => id),
				actionValue: stores.board.val.time + 15
			});
		})
});
