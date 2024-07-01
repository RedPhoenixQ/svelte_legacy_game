import { browser } from '$app/environment';
import { pb, user } from '$lib/pb';
import type { BoardResponse, CharactersResponse, GamesResponse, UsersResponse } from '$lib/schema';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { derived, writable } from 'svelte/store';
import { board, tokens, initBoard, deinitBoard } from './board';
import { characters, initCharacters, deinitCharacters } from './characters';

export { board, tokens, characters };
export const game = writable<GamesResponse>();
game.subscribe(($game) => console.debug('store game', $game));
export const dms = writable(new Map<string, UsersResponse>());
dms.subscribe(($dms) => console.debug('store dms', $dms));
export const isDm = derived([dms, user], ([$dms, $user]) => $user && $dms.has($user?.id));
isDm.subscribe(($isDm) => console.debug('store isDm', $isDm));
export const players = writable(new Map<string, UsersResponse>());
players.subscribe(($players) => console.debug('store players', $players));

let unsubs: UnsubscribeFunc[] = [];
let ignoreSub = false;
export async function initStores(data: {
	game: GamesResponse;
	dms: UsersResponse[];
	players: UsersResponse[];
	characters: CharactersResponse[];
	activeBoard?: BoardResponse;
}) {
	ignoreSub = true;
	game.set(data.game);
	if (data.dms !== undefined) {
		dms.set(new Map(data.dms.map((r) => [r.id, r])));
	}
	if (data.players !== undefined) {
		players.set(new Map(data.players.map((r) => [r.id, r])));
	}
	initCharacters(data.game.id, data.characters ?? []);
	initBoard(data.activeBoard);

	await Promise.allSettled(unsubs.map((unsub) => unsub?.()));
	ignoreSub = false;
	if (!browser) return;
	unsubs = await Promise.all([
		pb.from('games').subscribe(data.game.id, handleGame),
		deinitBoard,
		deinitCharacters
	]);
}

export async function deinitStores() {
	await Promise.all(unsubs.map((unsub) => unsub?.()));
}

async function handleGame({ action, record }: RecordSubscription<GamesResponse>) {
	if (ignoreSub) return;
	console.debug('sub game', action, record);

	switch (action) {
		case 'update':
			game.update(($game) => {
				if ($game.activeBoard !== record.activeBoard) {
					initBoard(record.activeBoard);
				}
				// TODO: Handle adding/removing players and dms
				return record;
			});
			break;
		default:
			throw new Error(`Game cannot handle action ${action}`, {
				cause: {
					action,
					record
				}
			});
	}
}
