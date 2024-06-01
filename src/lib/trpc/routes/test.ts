import { t } from '../t';

export const test = t.procedure
	.input((value: unknown) => value)
	.query(({ ctx, input }) => {
		console.log(ctx, input);
		return input;
	});
