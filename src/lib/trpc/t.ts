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
	const gameId = ctx.event.request.headers.get(GAME_ID_HEADER);
	if (!gameId) {
		throw new TRPCError({
			code: 'BAD_REQUEST',
			message: `Missing header ${GAME_ID_HEADER} for game prodecure`
		});
	}
	let stores = ServerGame.getGame(gameId);
	if (stores) {
		if (!stores.hasAccessToGame(ctx.user.id) && !ctx.user.isAdmin) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: `You do not have access to this game`
			});
		}
	} else {
		try {
			stores = new ServerGame(await ServerGame.fetchGame(gameId, ctx.event.locals.pb));
		} catch (err) {
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: `Game could not be started`,
				cause: err
			});
		}
	}
	return next({
		ctx: {
			...ctx,
			stores
		}
	});
});
