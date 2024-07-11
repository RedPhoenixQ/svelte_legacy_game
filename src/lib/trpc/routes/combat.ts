import { serverPb } from '$lib/pb.server';
import { gameProcedure, t } from '../t';
import { TRPCError } from '@trpc/server';

export const combat = t.router({
	endTurn: gameProcedure.mutation(async ({ ctx: { stores } }) => {
		console.debug(stores.actionItems.val);

		const first = stores.actionItems.val.items?.[0];

		// TODO: Handle when it is not the players turn;
		if (!first) throw new Error('No actionItems exists');

		// TODO: Base this on character attributes (speed)
		const delta = 10;

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
			const actionValue = stores.actionItems.val.findFirstSafeActionValue(
				first.actionValue + delta
			);
			const record = await serverPb.from('actionItem').update(first.id, { actionValue });
			stores.actionItems.handleChange({ action: 'update', record });
		}

		// Move combat time forward
		const newBoard = await serverPb.from('board').update(first.board, { time: first.actionValue });
		stores.board.handleChange({ action: 'update', record: newBoard });
		return first.actionValue;
	}),
	testAction: gameProcedure.mutation(async ({ ctx: { stores } }) => {
		if (!stores.board.val) {
			throw new TRPCError({ code: 'BAD_REQUEST', message: 'There is no active board' });
		}

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

		const record = await serverPb.from('actionItem').create({
			board: stores.board.val.id,
			modifiers: newMods.map(({ id }) => id),
			actionValue: stores.actionItems.val.findFirstSafeActionValue(stores.board.val.time + 15)
		});
		stores.actionItems.handleChange({ action: 'create', record });
	})
});
