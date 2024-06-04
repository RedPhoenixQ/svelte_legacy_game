import { browser } from '$app/environment';
import { pb } from '$lib/pb';
import type { CharactersResponse } from '$lib/schema';
import type { UnsubscribeFunc, RecordSubscription } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { eq } from 'typed-pocketbase';

export const characters: Writable<Map<string, CharactersResponse>> = writable(new Map());
characters.subscribe(($characters) => console.debug('store characters', $characters));

let unsubs: UnsubscribeFunc[] = [];
let ignore_sub = false;

export async function initCharacters(
	gameId: string,
	charactersOrId: string | CharactersResponse[]
) {
	ignore_sub = true;

	if (typeof charactersOrId === 'string') {
		const new_characters = await pb.from('characters').getFullList({
			filter: eq('game.id', gameId)
		});
		characters.set(new Map(new_characters.map((token) => [token.id, token])));
	} else if (!charactersOrId.length) {
		characters.update(($characters) => {
			$characters.clear();
			return $characters;
		});
	} else {
		characters.set(new Map(charactersOrId.map((token) => [token.id, token])));
	}

	Promise.allSettled(unsubs.map((unsub) => unsub?.()));
	ignore_sub = false;
	if (!browser) return;

	unsubs = await Promise.all([
		pb.from('characters').subscribe('*', handleCharacters, {
			query: {
				filter: eq('game.id', gameId)
			}
		})
	]);
}

export async function deinitCharacters() {
	await Promise.all(unsubs.map((unsub) => unsub?.()));
}

function handleCharacters({ action, record }: RecordSubscription<CharactersResponse>) {
	if (ignore_sub) return;
	console.debug('sub characters', action, record);

	if (action === 'delete') {
		characters.update(($characters) => {
			$characters.delete(record.id);
			return $characters;
		});
	} else {
		characters.update(($characters) => {
			$characters.set(record.id, record);
			return $characters;
		});
	}
}
