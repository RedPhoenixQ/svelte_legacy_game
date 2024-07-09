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
import { ActionItemsStore, createCurrentTurn } from './actionItem';
import { BoardStore } from './board';
import { CharactersStore } from './character';
import { GameStore, createIsDm } from './game';
import { ModifiersStore } from './modifier';
import { StatsStore } from './stats';
import { TokensStore } from './token';
// import type { UnsubscribeFunc } from 'pocketbase';
// import { writable, type Writable } from 'svelte/store';

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
		this.game = GameStore.fromResponse(args.game);
		this.board = BoardStore.fromResponse(args.activeBoard);
		this.characters = CharactersStore.fromResponse(args.characters);
		this.tokens = new TokensStore(TokensStore.fromResponse(args.tokens));
		this.actionItems = new ActionItemsStore(ActionItemsStore.fromResponse(args.actionItems));
		this.stats = new StatsStore(StatsStore.fromResponse(args.stats));
		this.modifiers = new ModifiersStore(ModifiersStore.fromResponse(args.modifiers));
		this.isDm = createIsDm(this);
		this.currentTurn = createCurrentTurn(this);

		this.game.stores = this;
		this.board.stores = this;
		this.characters.stores = this;
		this.tokens.stores = this;
		this.actionItems.stores = this;
		this.stats.stores = this;
		this.modifiers.stores = this;

		this.modifiers.updateStats();

		if (debug) {
			this.game.subscribe(($game) => console.debug('game', $game));
			this.board.subscribe(($board) => console.debug('board', $board));
			this.characters.subscribe(($characters) => console.debug('characters', $characters));
			this.tokens.subscribe(($tokens) => console.debug('tokens', $tokens));
			this.actionItems.subscribe(($actionItems) => console.debug('actionItems', $actionItems));
			this.stats.subscribe(($stats) => console.debug('stats', $stats));
			this.modifiers.subscribe(($modifiers) => console.debug('modifiers', $modifiers));
			this.isDm.subscribe(($isDm) => console.debug('isDm', $isDm));
			this.currentTurn.subscribe(($currentTurn) => console.debug('currentTurn', $currentTurn));
		}
	}

	async init() {
		await Promise.all([
			this.game.init(),
			this.board.init(),
			this.characters.init(),
			this.tokens.init(),
			this.actionItems.init(),
			this.stats.init(),
			this.modifiers.init()
		]);
	}

	async deinit() {
		await Promise.all([
			this.game.deinit(),
			this.board.deinit(),
			this.characters.deinit(),
			this.tokens.deinit(),
			this.actionItems.deinit(),
			this.stats.deinit(),
			this.modifiers.deinit()
		]);
	}
}
