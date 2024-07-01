import { z } from 'zod';
import { t } from '../t';

const username = z.string().min(3);
const password = z.string().min(8);

export const authRouter = t.router({
	login: t.procedure.input(z.object({ username, password })).mutation(async ({ ctx, input }) => {
		const auth = await ctx.event.locals.pb
			// TODO: TYPE the users collection
			.collection('users')
			.authWithPassword(input.username, input.password);
		console.log('Logged in as ', ctx.event.locals.pb.authStore.model);

		return auth;
	}),
	logout: t.procedure.mutation(({ ctx }) => {
		ctx.event.locals.pb.authStore.clear();
	}),
	register: t.procedure
		.input(z.object({ username, password, passwordConfirm: password }))
		.mutation(async ({ ctx, input }) => {
			const newUser = await ctx.event.locals.pb.from('users').create({
				username: input.username,
				name: input.username,
				password: input.password,
				passwordConfirm: input.passwordConfirm
			});
			return newUser;
		})
});
