import { page } from '$app/stores';
import type { Router } from '$lib/trpc/router';
import { get } from 'svelte/store';
import { createTRPCClient, type TRPCClientInit } from 'trpc-sveltekit';

export const GAME_ID_HEADER = 'x-game-id' as const;

let browserClient: ReturnType<typeof createTRPCClient<Router>>;

export function trpc(init?: TRPCClientInit) {
	const isBrowser = typeof window !== 'undefined';
	if (isBrowser && browserClient) return browserClient;
	const client = createTRPCClient<Router>({
		init,
		headers() {
			const headers: Record<string, string> = {};
			if (page) {
				const $page = get(page);
				if ($page.params.gameId) {
					headers[GAME_ID_HEADER] = $page.params.gameId;
				}
			}
			return headers;
		}
	});
	if (isBrowser) browserClient = client;
	return client;
}
