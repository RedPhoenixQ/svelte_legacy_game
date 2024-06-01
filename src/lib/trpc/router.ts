import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { test } from './routes/test';
import { t } from './t';
import { authRouter } from './routes/auth';

export const router = t.router({
	auth: authRouter,
	test,
	greeting: t.procedure.query(async () => {
		return `Hello tRPC v11 @ ${new Date().toLocaleTimeString()}`;
	})
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

export type RouterInputs = inferRouterInputs<Router>;
export type RouterOutputs = inferRouterOutputs<Router>;
