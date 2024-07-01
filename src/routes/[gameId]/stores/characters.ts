import { browser } from '$app/environment';
import { pb } from '$lib/pb';
import type { CharactersResponse } from '$lib/schema';
import type { UnsubscribeFunc, RecordSubscription } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { eq } from 'typed-pocketbase';

export const characters: Writable<Map<string, CharactersResponse>> = writable(new Map());
characters.subscribe(($characters) => console.debug('store characters', $characters));

let unsubs: UnsubscribeFunc[] = [];
let ignoreSub = false;

export async function initCharacters(
	gameId: string,
	charactersOrId: string | CharactersResponse[]
) {
	ignoreSub = true;

	if (typeof charactersOrId === 'string') {
		const newCharacters = await pb.from('characters').getFullList({
			filter: eq('game.id', gameId)
		});
		characters.set(new Map(newCharacters.map((token) => [token.id, token])));
	} else if (!charactersOrId.length) {
		characters.update(($characters) => {
			$characters.clear();
			return $characters;
		});
	} else {
		characters.set(new Map(charactersOrId.map((token) => [token.id, token])));
	}

	Promise.allSettled(unsubs.map((unsub) => unsub?.()));
	ignoreSub = false;
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
	if (ignoreSub) return;
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
