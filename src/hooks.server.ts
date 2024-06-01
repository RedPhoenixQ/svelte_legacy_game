import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';

const trpcHandle: Handle = createTRPCHandle({ router, createContext });

export async function handle({ event, resolve }) {
	return await trpcHandle({ event, resolve });
}
