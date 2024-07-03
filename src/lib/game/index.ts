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

export function createGameStores(args: {
	game: GamesResponse;
	dms: UsersResponse[];
	players: UsersResponse[];
	activeBoard?: BoardResponse;
	tokens?: TokenResponse[];
	actionItems?: ActionItemResponse[];
	characters: CharactersResponse[];
}) {
	const game = GameStore.fromResponse(args.game);
	const board = BoardStore.fromResponse(args.activeBoard);
	const characters = CharactersStore.fromResponse(args.characters);
	const tokens = TokensStore.fromResponse(args.tokens);
	const actionItems = ActionItemsStore.fromResponse(args.actionItems);

	characters.stores(game);
	tokens.stores(board);
	actionItems.stores(board);

	return {
		game,
		board,
		characters,
		tokens,
		actionItems,
		isDm: createIsDm(game),
		init: async () => {
			await Promise.all([
				game.init(),
				board.init(),
				characters.init(),
				tokens.init(),
				actionItems.init()
			]);
		},
		deinit: async () => {
			await Promise.all([
				game.deinit(),
				board.deinit(),
				characters.deinit(),
				tokens.deinit(),
				actionItems.deinit()
			]);
		}
	};
}
