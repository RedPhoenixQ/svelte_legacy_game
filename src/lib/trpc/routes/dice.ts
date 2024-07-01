import { z } from 'zod';
import { authedProcedure, t } from '../t';
import { serverPb } from '$lib/pb.server';

export const dice = t.router({
	roll: authedProcedure
		.input(
			z.object({
				game: z.string(),
				sides: z.number().int()
			})
		)
		.mutation(async ({ ctx, input }) => {
			const roll = Math.floor(Math.random() * input.sides) + 1;

			const diceRoll = await serverPb.from('diceRoll').create({
				game: input.game,
				rolledBy: ctx.user.id,
				sides: input.sides,
				roll
			});

			return diceRoll;
		})
});
