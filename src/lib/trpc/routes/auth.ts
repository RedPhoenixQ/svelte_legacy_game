import { z } from 'zod';
import { t } from '../t';

const loginCredentials = z.object({
	username: z.string().min(3),
	password: z.string().min(8)
});

export const authRouter = t.router({
	login: t.procedure.input(loginCredentials).mutation(async ({ ctx, input }) => {
		const auth = await ctx.event.locals.pb
			// TODO: TYPE the users collection
			.collection('users')
			.authWithPassword(input.username, input.password);
		console.log('Logged in as ', ctx.event.locals.pb.authStore.model);

		return auth;
	}),
	logout: t.procedure.mutation(({ ctx }) => {
		ctx.event.locals.pb.authStore.clear();
	})
});
