import type { BoardResponse, TokenResponse, Schema, ActionItemResponse } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { type TypedPocketBase } from 'typed-pocketbase';
import { Tokens } from './token';
import { ActionItems } from './actionItem';
import { Characters } from './character';

export class Board implements Readable<BoardResponse> {
	subscribe: Writable<BoardResponse>['subscribe'];
	#set: Writable<BoardResponse>['set'];
	// eslint-disable-next-line no-unused-private-class-members
	#update: Writable<BoardResponse>['update'];

	#unsub: UnsubscribeFunc | undefined = undefined;

	id: string;
	tokens: Tokens;
	characters: Characters;
	actionItems: ActionItems;

	get() {
		return get(this);
	}

	constructor(
		board: BoardResponse,
		characters: Characters,
		tokens: TokenResponse[],
		actionItems: ActionItemResponse[]
	) {
		this.id = board.id;
		const { subscribe, set, update } = writable(board);
		subscribe(($board) => console.debug('Board', $board));
		this.subscribe = subscribe;
		this.#set = set;
		this.#update = update;

		this.characters = characters;
		this.tokens = Tokens.fromTokens(this.id, tokens);
		this.actionItems = new ActionItems(this.id, actionItems);
	}

	async init(pb: TypedPocketBase<Schema>) {
		this.#unsub = await pb.from('board').subscribe(this.id, ({ action, record }) => {
			console.debug('sub board', action, record);

			this.#set(record);
		});
		await this.tokens.init(pb);
		await this.actionItems.init(pb);
	}

	async cleanup() {
		await Promise.all([this.#unsub?.(), this.tokens.cleanup(), this.actionItems.cleanup()]);
	}
}
