import { PUBLIC_PB_URL } from '$env/static/public';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import PocketBase from 'pocketbase';
import { createTRPCHandle } from 'trpc-sveltekit';

const trpcHandle: Handle = createTRPCHandle({ router, createContext });

export async function handle({ event, resolve }) {
	event.locals.pb = new PocketBase(PUBLIC_PB_URL);

	const response = await trpcHandle({ event, resolve });
	return response;
}
