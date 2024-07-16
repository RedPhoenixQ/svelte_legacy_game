import type { BoardsResponse } from '$lib/schema';
import type { RecordSubscription } from 'pocketbase';
import { Token, TokensStore } from './token';
import { ActionItemsStore } from './actionItem';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import { Response, System } from 'detect-collisions';
import type { AttackBody } from '$lib/helpers/targeting';

export type BoardStoreInner = Board | undefined;

// FIXME: Make into map of all board for the game and a separate store or accesor for activeBoard.
//				Currently this store only represents game.activeBoard
export class BoardStore extends Store<BoardStoreInner> implements Synced<BoardsResponse> {
	constructor(stores: GameStores, board?: BoardsResponse) {
		super(stores, BoardStore.fromResponse(board));
	}

	static fromResponse(board?: BoardsResponse) {
		return board ? new Board(board) : undefined;
	}

	async init() {
		if (!this.val) return;
		this.unsub = await pb.from('boards').subscribe(this.val.id, this.handleChange.bind(this));
	}

	handleChange({ action, record }: RecordSubscription<BoardsResponse>) {
		console.debug('sub boards', action, record);

		if (this.val) {
			if (this.val.updated >= record.updated) return;
			this.val.assign(record);
		} else {
			this.val = new Board(record);
		}

		this.syncStore();
	}

	async change(boardId: string | null) {
		await Promise.all([
			this.deinit(),
			this.stores.tokens.deinit(),
			this.stores.actionItems.deinit()
		]);
		if (!boardId) {
			this.val = undefined;
			this.syncStore();
			return;
		}

		try {
			const boardResponse = await pb.from('boards').getOne(boardId, {
				select: {
					expand: {
						'tokens(board)': true,
						'actionItems(board)': true
					}
				}
			});
			this.stores.tokens.val = TokensStore.fromResponse(boardResponse.expand?.['tokens(board)']);
			this.stores.tokens.syncStore();
			this.stores.actionItems.val = ActionItemsStore.fromResponse(
				boardResponse.expand?.['actionItems(board)']
			);
			this.stores.actionItems.syncStore();
			this.val = new Board(boardResponse);
			this.syncStore();
			await Promise.all([this.init(), this.stores.tokens.init(), this.stores.actionItems.init()]);
		} catch (err) {
			console.error(err);
			this.val = undefined;
			this.syncStore();
		}
	}
}

type SystemBody = AttackBody | Token;

export class Board extends System<SystemBody> implements BoardsResponse {
	collectionName = 'boards' as const;
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

	constructor(board: BoardsResponse) {
		// TODO: Handle adding eventual walls and other static objects on the board to the collision system
		super();
		this.assign(board);
	}

	assign(board: BoardsResponse) {
		Object.assign(this, board);
	}

	checkHitTokens(collider: AttackBody, callback: (token: Token, res: Response) => void) {
		this.checkOne(collider, (res) => {
			if (res.b instanceof Token && res.overlap > 0) {
				callback(res.b, res);
			}
		});
	}
}
