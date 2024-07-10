import type {
	ActionItemResponse,
	BoardResponse,
	CharactersResponse,
	GamesResponse,
	ModifiersResponse,
	StatsResponse,
	TokenResponse,
	UsersResponse
} from '$lib/schema';
import type { Readable } from 'svelte/store';
import { ActionItemsStore, createCurrentTurn } from './actionItem';
import { BoardStore } from './board';
import { CharactersStore } from './character';
import { GameStore, createIsDm } from './game';
import { ModifiersStore } from './modifier';
import { StatsStore } from './stats';
import { TokensStore } from './token';
import { Store } from './store';

export class GameStores {
	game: GameStore;
	board: BoardStore;
	characters: CharactersStore;
	tokens: TokensStore;
	actionItems: ActionItemsStore;
	stats: StatsStore;
	modifiers: ModifiersStore;
	isDm: ReturnType<typeof createIsDm>;
	currentTurn: ReturnType<typeof createCurrentTurn>;

	constructor(
		args: {
			game: GamesResponse;
			dms: UsersResponse[];
			players: UsersResponse[];
			activeBoard?: BoardResponse;
			tokens?: TokenResponse[];
			actionItems?: ActionItemResponse[];
			characters: CharactersResponse[];
			stats?: StatsResponse[];
			modifiers?: ModifiersResponse[];
		},
		debug?: boolean
	) {
		this.game = new GameStore(this, args.game);
		this.board = new BoardStore(this, args.activeBoard);
		this.characters = new CharactersStore(this, args.characters);
		this.tokens = new TokensStore(this, args.tokens);
		this.actionItems = new ActionItemsStore(this, args.actionItems);
		this.stats = new StatsStore(this, args.stats);
		// Must appear after StatsStore construction
		this.modifiers = new ModifiersStore(this, args.modifiers);
		this.isDm = createIsDm(this);
		this.currentTurn = createCurrentTurn(this);

		if (debug) {
			this.forEach((key) => this[key].subscribe((value) => console.debug(key, value)));
		}
	}

	forEach(fn: (key: KeyOfType<GameStores, Readable<unknown>>) => void) {
		for (const key of Object.keys(this)) {
			fn(key as KeyOfType<GameStores, Readable<unknown>>);
		}
	}

	async init() {
		const promises: Promise<unknown>[] = [];
		this.forEach((key) => {
			if (this[key] instanceof Store) {
				promises.push(this[key].init());
			}
		});
		await Promise.all(promises);
	}

	async deinit() {
		const promises: Promise<unknown>[] = [];
		this.forEach((key) => {
			if (this[key] instanceof Store) {
				promises.push(this[key].deinit());
			}
		});
		await Promise.all(promises);
	}
}

export type KeyOfType<Type, ValueType> = keyof {
	[Key in keyof Type as Type[Key] extends ValueType ? Key : never]: unknown;
};
