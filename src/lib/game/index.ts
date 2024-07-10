import { type Readable } from 'svelte/store';
import { ActionItemsStore, createCurrentTurn, createFirstActionItem } from './actionItem';
import { BoardStore } from './board';
import { CharactersStore } from './character';
import { GameStore, createIsDm } from './game';
import { ModifiersStore } from './modifier';
import { StatsStore } from './stats';
import { TokensStore } from './token';
import { Store } from './store';
import type { SelectExpanded } from '$lib/helpers/pocketbase';
import type { GamesCollection } from '$lib/schema';

export class GameStores {
	game: GameStore;
	board: BoardStore;
	characters: CharactersStore;
	tokens: TokensStore;
	actionItems: ActionItemsStore;
	stats: StatsStore;
	modifiers: ModifiersStore;
	isDm: ReturnType<typeof createIsDm>;
	firstActionItem: ReturnType<typeof createFirstActionItem>;
	currentTurn: ReturnType<typeof createCurrentTurn>;

	constructor(
		game: SelectExpanded<
			GamesCollection,
			{
				expand: {
					dms: true;
					players: true;
					activeBoard: {
						expand: {
							'token(board)': true;
							'actionItem(board)': true;
						};
					};
					'characters(game)': true;
					'stats(game)': {
						expand: {
							'modifiers(stats)': true;
						};
					};
				};
			}
		>,
		debug?: boolean
	) {
		this.game = new GameStore(this, game);
		this.board = new BoardStore(this, game?.expand?.activeBoard);
		this.characters = new CharactersStore(this, game?.expand?.['characters(game)']);
		this.tokens = new TokensStore(this, game?.expand?.activeBoard?.expand?.['token(board)']);
		this.actionItems = new ActionItemsStore(
			this,
			game?.expand?.activeBoard?.expand?.['actionItem(board)']
		);
		this.stats = new StatsStore(this, game?.expand?.['stats(game)']);
		// Must appear after StatsStore construction
		this.modifiers = new ModifiersStore(
			this,
			game?.expand?.['stats(game)']?.flatMap((stats) => stats?.expand?.['modifiers(stats)'] ?? [])
		);
		this.isDm = createIsDm(this);
		this.firstActionItem = createFirstActionItem(this);
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
