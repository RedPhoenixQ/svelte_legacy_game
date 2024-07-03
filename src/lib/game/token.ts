import type { TokenResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

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

		this.#unsub = await pb.from('token').subscribe(
			'*',
			({ action, record }) => {
				console.debug('sub token', action, record);

				if (action === 'delete') {
					this.update(($tokens) => {
						$tokens.delete(record.id);
						return $tokens;
					});
				} else if (action === 'create') {
					this.update(($tokens) => {
						$tokens.set(record.id, new Token(record));
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
			},
			{
				query: {
					filter: eq('board.id', board.id)
				}
			}
		);
	}

	async deinit() {
		await this.#unsub?.();
	}
}

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

	constructor(token: TokenResponse) {
		this.assign(token);
	}

	assign(token: TokenResponse) {
		Object.assign(this, token);
	}
}
