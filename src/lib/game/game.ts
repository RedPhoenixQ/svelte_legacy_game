import type { GamesResponse } from '$lib/schema';
import { derived } from 'svelte/store';
import { pb, user } from '$lib/pb';
import type { RecordSubscription } from 'pocketbase';
import type { GameStores } from '.';
import { Store, type Synced } from './store';

export class GameStore extends Store<Game> implements Synced<GamesResponse> {
	constructor(stores: GameStores, game: GamesResponse) {
		super(stores, GameStore.fromResponse(game));
	}

	static fromResponse(game: GamesResponse): Game {
		return new Game(game);
	}

	async init() {
		this.unsub = await pb.from('games').subscribe(this.val.id, this.handleChange.bind(this));
	}

	handleChange({ action, record }: RecordSubscription<GamesResponse>) {
		console.debug('sub game', action, record);
		if (action === 'update') {
			if (this.val.updated >= record.updated) return;

			if (this.val.activeBoard !== record.activeBoard) {
				this.stores.board.change(record.activeBoard);
			}
			// TODO: Handle adding/removing players and dms
			this.val.assign(record);
		} else {
			throw new Error(`Game cannot handle action ${action}`, {
				cause: {
					action,
					record
				}
			});
		}

		this.syncStore();
	}
}

export function createIsDm(stores: GameStores) {
	return derived([stores.game, user], ([$game, $user]) => {
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
