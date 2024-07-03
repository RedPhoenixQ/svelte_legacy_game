import type { GamesResponse } from '$lib/schema';
import { derived, get, writable, type Writable } from 'svelte/store';
import { pb, user } from '$lib/pb';
import type { UnsubscribeFunc } from 'pocketbase';

export class GameStore implements Writable<Game> {
	subscribe!: Writable<Game>['subscribe'];
	set!: Writable<Game>['set'];
	update!: Writable<Game>['update'];

	get() {
		return get(this);
	}

	constructor(game?: Game) {
		Object.assign(this, writable(game));
	}

	static fromResponse(game: GamesResponse): GameStore {
		return new GameStore(new Game(game));
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		this.#unsub = await pb.from('games').subscribe(this.get().id, ({ action, record }) => {
			console.debug('sub game', action, record);
			switch (action) {
				case 'update':
					this.update(($game) => {
						// if ($game.activeBoard !== record.activeBoard) {
						// 	initBoard(record.activeBoard);
						// }
						// TODO: Handle adding/removing players and dms
						$game.assign(record);
						return $game;
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
		});
	}

	async deinit() {
		await this.#unsub();
	}
}

export function createIsDm(game: GameStore) {
	return derived([game, user], ([$game, $user]) => {
		if (!$user) return false;
		return $game.dms.includes($user.id);
	});
}

export class Game implements GamesResponse {
	collectionName = 'games' as const;
	dms!: string[];
	players!: string[];
	name!: string;
	activeBoard!: string;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	constructor(game: GamesResponse) {
		this.assign(game);
	}

	assign(game: GamesResponse) {
		Object.assign(this, game);
	}
}
