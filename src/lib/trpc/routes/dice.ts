import { z } from 'zod';
import { authedProcedure, t } from '../t';
import { server_pb } from '$lib/pb.server';

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

			const dice_roll = await server_pb.from('dice_roll').create({
				game: input.game,
				rolled_by: ctx.user.id,
				sides: input.sides,
				roll
			});

			return dice_roll;
		})
});
