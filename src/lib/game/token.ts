import type { TokenResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Box } from 'detect-collisions';

export type TokenMap = Map<string, Token>;

export class TokensStore implements Writable<TokenMap> {
	stores!: GameStores;

	subscribe!: Writable<TokenMap>['subscribe'];
	set!: Writable<TokenMap>['set'];
	update!: Writable<TokenMap>['update'];

	get() {
		return get(this);
	}

	constructor(tokens: TokenMap) {
		Object.assign(this, writable(tokens));
	}

	static fromResponse(tokens: TokenResponse[] = []): TokenMap {
		return new Map(tokens.map((token) => [token.id, new Token(token)]));
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const board = this.stores.board.get();
		if (!board) return;

		for (const token of this.get().values()) {
			board.insert(token.collider);
		}

		this.#unsub = await pb.from('token').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', board.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<TokenResponse>) {
		console.debug('sub token', action, record);
		const board = this.stores.board.get();
		if (!board) return;

		if (action === 'delete') {
			this.update(($tokens) => {
				const token = $tokens.get(record.id);
				if (!token) return $tokens;
				board.remove(token.collider);
				$tokens.delete(record.id);
				return $tokens;
			});
		} else if (action === 'create') {
			this.update(($tokens) => {
				const token = new Token(record);
				$tokens.set(record.id, token);
				board.insert(token.collider);
				return $tokens;
			});
		} else {
			this.update(($tokens) => {
				const token = $tokens.get(record.id);
				if (token) {
					token.assign(record);
				} else {
					$tokens.set(record.id, new Token(record));
				}
				return $tokens;
			});
		}
	}

	async deinit() {
		await this.#unsub?.();
	}
}

export const TOKEN_SIZE = 50 as const;

export class Token implements TokenResponse {
	collectionName = 'token' as const;
	board!: string;
	character!: string;
	x!: number;
	y!: number;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	#collider: Box;
	get collider() {
		return this.#collider;
	}

	constructor(token: TokenResponse) {
		this.#collider = new Box(token, TOKEN_SIZE, TOKEN_SIZE, { isCentered: true });
		this.assign(token);
	}

	assign(token: TokenResponse) {
		Object.assign(this, token);
		this.#collider.setPosition(token.x, token.y, true);
	}
}
