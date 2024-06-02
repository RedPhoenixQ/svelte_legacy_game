import type { Context } from '$lib/trpc/context';
import { initTRPC } from '@trpc/server';

export const t = initTRPC.context<Context>().create();

export const authedProcedure = t.procedure.use((opt) => {
	if (!opt.ctx.event.locals.pb.authStore.isValid || !opt.ctx.event.locals.pb.authStore.model) {
		throw new Error('User is not logged in');
	}
	return opt.next({
		ctx: {
			...opt.ctx,
			user: opt.ctx.event.locals.pb.authStore.model
		}
	});
});
