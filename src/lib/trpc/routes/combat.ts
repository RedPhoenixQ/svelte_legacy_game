import { serverPb } from '$lib/pb.server';
import { eq } from 'typed-pocketbase';
import { authedProcedure, t } from '../t';
import { z } from 'zod';
import { ClientResponseError } from 'pocketbase';

export const combat = t.router({
	endTurn: authedProcedure.input(z.string()).mutation(async ({ input: boardId }) => {
		const first = await serverPb.collection('actionItem').getFirstListItem(eq('board', boardId), {
			sort: '+actionValue',
			expand: 'characters'
		});

		// TODO: Base this on character attributes (speed)
		let delta = 10;

		for (let i = 0; i < 30; i++) {
			try {
				const record = await serverPb
					.collection('actionItem')
					.update(first.id, { 'actionValue+': delta });
				// Move combat time forward
				await serverPb.collection('board').update(boardId, { time: first.actionValue });
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
