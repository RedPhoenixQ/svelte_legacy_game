import type { BoardResponse } from '$lib/schema';
import { writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { TokensStore } from './token';
import { ActionItemsStore } from './actionItem';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { System } from 'detect-collisions';

export type BoardStoreInner = Board | undefined;

// FIXME: Make into map of all board for the game and a separate store or accesor for activeBoard.
//				Currently this store only represents game.activeBoard
export class BoardStore implements Writable<BoardStoreInner> {
	#stores: GameStores;
	/**A reference to the same object that is in the store for direct use. If this is modified the
	 * store must be updated to alert subscribers of changes manually */
	val: BoardStoreInner;

	subscribe!: Writable<BoardStoreInner>['subscribe'];
	set!: Writable<BoardStoreInner>['set'];
	update!: Writable<BoardStoreInner>['update'];

	constructor(stores: GameStores, board?: BoardResponse) {
		this.#stores = stores;
		this.val = BoardStore.fromResponse(board);
		Object.assign(this, writable(this.val));
	}

	static fromResponse(board?: BoardResponse) {
		return board ? new Board(board) : undefined;
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		if (!this.val) return;
		this.#unsub = await pb.from('board').subscribe(this.val.id, this.handleChange.bind(this));
	}

	handleChange({ action, record }: RecordSubscription<BoardResponse>) {
		console.debug('sub board', action, record);

		if (this.val) {
			if (this.val.updated >= record.updated) return;
			this.val.assign(record);
		} else {
			this.val = new Board(record);
		}

		this.set(this.val);
	}

	async deinit() {
		await this.#unsub?.();
	}

	async change(boardId: string | null) {
		await Promise.all([
			this.deinit(),
			this.#stores.tokens.deinit(),
			this.#stores.actionItems.deinit()
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
			this.#stores.tokens.val = TokensStore.fromResponse(boardResponse.expand?.['token(board)']);
			this.#stores.tokens.set(this.#stores.tokens.val);
			this.#stores.actionItems.val = ActionItemsStore.fromResponse(
				boardResponse.expand?.['actionItem(board)']
			);
			this.#stores.actionItems.set(this.#stores.actionItems.val);
			this.val = new Board(boardResponse);
			this.set(this.val);
			await Promise.all([this.init(), this.#stores.tokens.init(), this.#stores.actionItems.init()]);
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
