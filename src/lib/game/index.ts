import type {
	ActionItemResponse,
	BoardResponse,
	CharactersResponse,
	GamesResponse,
	TokenResponse,
	UsersResponse
} from '$lib/schema';
import { ActionItemsStore } from './actionItem';
import { BoardStore } from './board';
import { CharactersStore } from './character';
import { GameStore, createIsDm } from './game';
import { TokensStore } from './token';
// import type { UnsubscribeFunc } from 'pocketbase';
// import { writable, type Writable } from 'svelte/store';

export class GameStores {
	game: GameStore;
	board: BoardStore;
	characters: CharactersStore;
	tokens: TokensStore;
	actionItems: ActionItemsStore;
	isDm: ReturnType<typeof createIsDm>;

	constructor(args: {
		game: GamesResponse;
		dms: UsersResponse[];
		players: UsersResponse[];
		activeBoard?: BoardResponse;
		tokens?: TokenResponse[];
		actionItems?: ActionItemResponse[];
		characters: CharactersResponse[];
	}) {
		this.game = GameStore.fromResponse(args.game);
		this.board = BoardStore.fromResponse(args.activeBoard);
		this.characters = CharactersStore.fromResponse(args.characters);
		this.tokens = new TokensStore(TokensStore.fromResponse(args.tokens));
		this.actionItems = new ActionItemsStore(ActionItemsStore.fromResponse(args.actionItems));
		this.isDm = createIsDm(this.game);

		this.game.stores = this;
		this.board.stores = this;
		this.characters.stores = this;
		this.tokens.stores = this;
		this.actionItems.stores = this;
	}

	async init() {
		await Promise.all([
			this.game.init(),
			this.board.init(),
			this.characters.init(),
			this.tokens.init(),
			this.actionItems.init()
		]);
	}

	async deinit() {
		await Promise.all([
			this.game.deinit(),
			this.board.deinit(),
			this.characters.deinit(),
			this.tokens.deinit(),
			this.actionItems.deinit()
		]);
	}
}
