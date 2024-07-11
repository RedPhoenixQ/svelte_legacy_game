import { ServerGame } from '$lib/game/games.server';
import type { Context } from '$lib/trpc/context';
import { initTRPC, TRPCError } from '@trpc/server';
import { GAME_ID_HEADER } from './client';

export const t = initTRPC.context<Context>().create();

export const authedProcedure = t.procedure.use((opt) => {
	if (!opt.ctx.event.locals.pb.authStore.isValid || !opt.ctx.event.locals.pb.authStore.model) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User is not logged in' });
	}
	return opt.next({
		ctx: {
			...opt.ctx,
			user: opt.ctx.event.locals.pb.authStore.model
		}
	});
});

export const gameProcedure = authedProcedure.use(async ({ ctx, next }) => {
	const game_id = ctx.event.request.headers.get(GAME_ID_HEADER);
	if (!game_id) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Missing header ${GAME_ID_HEADER} for game prodecure`
		});
	}
	const stores = ServerGame.getGame(game_id);
	if (!stores) {
		throw new TRPCError({
			code: 'INTERNAL_SERVER_ERROR',
			message: `Game was not active or could not be started on the server`
		});
	}
	return next({
		ctx: {
			...ctx,
			stores
		}
	});
});
