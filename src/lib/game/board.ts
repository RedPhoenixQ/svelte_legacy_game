import type { BoardResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { TokensStore } from './token';
import { ActionItemsStore } from './actionItem';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { System } from 'detect-collisions';

export type BoardStoreInner = Board | undefined;

export class BoardStore implements Writable<BoardStoreInner> {
	stores!: GameStores;

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
		await this.#unsub?.();
	}

	async change(boardId: string | null) {
		await Promise.all([
			this.deinit(),
			this.stores.tokens.deinit(),
			this.stores.actionItems.deinit()
		]);
		if (!boardId) return this.set(undefined);

		try {
			const boardResponse = await pb.from('board').getOne(boardId, {
				select: {
					expand: {
						'token(board)': true,
						'actionItem(board)': true
					}
				}
			});
			this.stores.tokens.set(TokensStore.fromResponse(boardResponse.expand?.['token(board)']));
			this.stores.actionItems.set(
				ActionItemsStore.fromResponse(boardResponse.expand?.['actionItem(board)'])
			);
			const board = new Board(boardResponse);
			this.set(board);
			await Promise.all([this.init(), this.stores.tokens.init(), this.stores.actionItems.init()]);
		} catch (err) {
			console.error(err);
			this.set(undefined);
		}
	}
}

export class Board extends System implements BoardResponse {
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

	constructor(board: BoardResponse) {
		// TODO: Handle adding eventual walls and other static objects on the board to the collision system
		super();
		this.assign(board);
	}

	assign(board: BoardResponse) {
		Object.assign(this, board);
	}
}
