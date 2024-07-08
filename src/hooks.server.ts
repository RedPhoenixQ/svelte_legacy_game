import { PUBLIC_PB_URL } from '$env/static/public';
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';
import type { Handle } from '@sveltejs/kit';
import { createTRPCHandle } from 'trpc-sveltekit';
import { TypedPocketBase } from 'typed-pocketbase';
import type { Schema } from '$lib/schema';
import { dev } from '$app/environment';

const trpcHandle: Handle = createTRPCHandle({ router, createContext });

export async function handle({ event, resolve }) {
	event.locals.pb = new TypedPocketBase<Schema>(PUBLIC_PB_URL);
	event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') ?? '');
	console.debug('HAS AUTH', event.locals.pb.authStore.isValid);

	const response = await trpcHandle({ event, resolve });

	response.headers.append(
		'Set-Cookie',
		event.locals.pb.authStore.exportToCookie({
			path: '/',
			// This enables local hosting in dev
			secure: !dev,
			httpOnly: true
		})
	);

	return response;
}
