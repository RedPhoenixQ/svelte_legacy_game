import { createBodyFromShape } from '$lib/helpers/targeting';
import { serverPb } from '$lib/pb.server';
import { distance, ensureVectorPoint } from 'detect-collisions';
import { gameProcedure, t } from '../t';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Token } from '$lib/game/token';

export const combat = t.router({
	endTurn: gameProcedure.mutation(async ({ ctx: { stores } }) => {
		const first = stores.actionItems.val.items?.[0];

		// TODO: Handle when it is not the players turn;
		if (!first) throw new Error('No actionItems exists');

		// TODO: Base this on character attributes (speed)
		const delta = 10;

		if (first.modifiers.length) {
			try {
				await serverPb.from('actionItems').delete(first.id);
				stores.actionItems.handleChange({ action: 'delete', record: first });
				await Promise.all(first.modifiers.map((id) => serverPb.from('modifiers').delete(id)));
			} catch (err) {
				console.error('Error handling modifier action Item', err);
			}
		} else {
			const actionValue = stores.actionItems.val.findFirstSafeActionValue(
				first.actionValue + delta
			);
			const record = await serverPb.from('actionItems').update(first.id, { actionValue });
			stores.actionItems.handleChange({ action: 'update', record });
		}

		// Move combat time forward
		const newBoard = await serverPb.from('boards').update(first.board, { time: first.actionValue });
		stores.board.handleChange({ action: 'update', record: newBoard });
		return first.actionValue;
	}),
	testTakeActionMovableBox: gameProcedure
		.input(
			z.discriminatedUnion('type', [
				z.object({
					type: z.literal('aimed'),
					actionId: z.string(),
					position: z.object({ x: z.number(), y: z.number() }),
					angle: z.number()
				}),
				z.object({
					type: z.literal('selected'),
					actionId: z.string(),
					selectedTokenIds: z.string().array()
				})
			])
		)
		.mutation(async ({ ctx: { stores }, input }) => {
			if (!stores.board.val) {
				throw new Error('No active board');
			}

			const first = stores.actionItems.val.items[0];
			if (!first || !first.token) {
				throw new Error('No token/player is currently taking a turn');
			}

			const attackingToken = stores.tokens.val.get(first.token);
			const attack = {
				centered: false,
				range: 400,
				shape: {
					type: 'box',
					width: 200,
					height: 100
				}
			} as const;
			console.debug('takeAction input', input);
			if (input.type === 'selected') {
				throw new Error('Does not handle selected targeting');
			}

			// Check range
			if (
				attack.range &&
				distance(ensureVectorPoint(attackingToken), ensureVectorPoint(input.position)) >
					attack.range
			) {
				throw new Error('The choosen point is out of range');
			}
			// TODO: Use common method to check action result for server/client parity

			const collider = createBodyFromShape(attack.shape, input.position, { angle: input.angle });

			stores.board.val.insert(collider);
			try {
				const hits: Token[] = [];
				stores.board.val.checkHitTokens(collider, (token) => {
					console.log('hit token', token.id, token.pos);
					hits.push(token);
				});
				console.log('Targets hit', hits);
			} catch (err) {
				throw new Error('Something whent wrong', { cause: err });
			} finally {
				stores.board.val.remove(collider);
			}
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

		const record = await serverPb.from('actionItems').create({
			board: stores.board.val.id,
			modifiers: newMods.map(({ id }) => id),
			actionValue: stores.actionItems.val.findFirstSafeActionValue(stores.board.val.time + 15)
		});
		stores.actionItems.handleChange({ action: 'create', record });
	})
});
