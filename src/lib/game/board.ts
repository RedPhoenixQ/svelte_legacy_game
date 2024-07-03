import type { BoardResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { TokensStore } from './token';
import { ActionItemsStore } from './actionItem';
import { CharactersStore } from './character';
import { pb } from '$lib/pb';

export type BoardStoreInner = Board | undefined;

export class BoardStore implements Writable<BoardStoreInner> {
	subscribe!: Writable<BoardStoreInner>['subscribe'];
	set!: Writable<BoardStoreInner>['set'];
	update!: Writable<BoardStoreInner>['update'];

	get() {
		return get(this);
	}

	constructor(board?: Board) {
		Object.assign(this, writable(board));
	}

	static fromResponse(board?: BoardResponse) {
		return new BoardStore(board ? new Board(board) : undefined);
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const board = this.get();
		if (!board) return;
		this.#unsub = await pb.from('board').subscribe(board.id, ({ action, record }) => {
			console.debug('sub board', action, record);

			this.update(($board) => {
				if (!$board) return new Board(record);
				$board.assign(record);
				return $board;
			});
		});
	}

	async deinit() {
		await this.#unsub();
	}
}

export class Board implements BoardResponse {
	collectionName = 'board' as const;
	game!: string;
	background!: string;
	gridSize!: number;
	width!: number;
	height!: number;
	time!: number;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	characters!: CharactersStore;
	tokens!: TokensStore;
	actionItems!: ActionItemsStore;

	constructor(board: BoardResponse) {
		this.assign(board);
	}

	assign(board: BoardResponse) {
		Object.assign(this, board);
	}
}
