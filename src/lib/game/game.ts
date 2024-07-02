import type {
	GamesResponse,
	CharactersResponse,
	BoardResponse,
	TokenResponse,
	Schema,
	ActionItemResponse,
	UsersResponse
} from '$lib/schema';
import { derived, get, writable, type Readable, type Writable } from 'svelte/store';
import { Characters } from './character';
import type { UnsubscribeFunc } from 'pocketbase';
import type { TypedPocketBase } from 'typed-pocketbase';
import { Board } from './board';

export class Game implements Readable<GamesResponse> {
	subscribe: Writable<GamesResponse>['subscribe'];
	// eslint-disable-next-line no-unused-private-class-members
	#set: Writable<GamesResponse>['set'];
	#update: Writable<GamesResponse>['update'];

	#unsub: UnsubscribeFunc | undefined = undefined;

	id: string;

	user: Writable<UsersResponse | null>;
	isDm: Readable<boolean>;

	characters: Characters;
	activeBoard: Board | undefined;

	get() {
		return get(this);
	}

	constructor(
		game: GamesResponse,
		user: Writable<UsersResponse | null>,
		others?: {
			characters?: CharactersResponse[];
			activeBoard?: BoardResponse;
			tokens?: TokenResponse[];
			actionItems?: ActionItemResponse[];
		}
	) {
		this.id = game.id;
		this.user = user;

		const { subscribe, set, update } = writable(game);
		subscribe(($game) => console.debug('Game', $game));
		this.subscribe = subscribe;
		this.#set = set;
		this.#update = update;

		this.isDm = derived([this, user], ([$game, $user]) => {
			if (!$user) return false;
			return $game.dms.has($user.id);
		});

		this.characters = Characters.fromCharacters(game.id, others?.characters);
		if (others?.activeBoard) {
			this.activeBoard = new Board(
				others?.activeBoard,
				this.characters,
				others?.tokens ?? [],
				others?.actionItems ?? []
			);
		}
	}

	async init(pb: TypedPocketBase<Schema>) {
		this.#unsub = await pb.from('games').subscribe(this.get().id, ({ action, record }) => {
			console.debug('sub game', action, record);
			switch (action) {
				case 'update':
					this.#update(() => {
						// if ($game.activeBoard !== record.activeBoard) {
						// 	initBoard(record.activeBoard);
						// }
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
		});
		this.characters.init(pb);
		this.activeBoard?.init?.(pb);
	}

	async cleanup() {
		await Promise.all([this.#unsub?.(), this.characters.cleanup(), this.activeBoard?.cleanup?.()]);
	}
}
