import type { TokenResponse, Schema } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { eq, type TypedPocketBase } from 'typed-pocketbase';

export type TokenMap = Map<string, Token>;

export class Tokens implements Readable<TokenMap> {
	subscribe: Writable<TokenMap>['subscribe'];
	// eslint-disable-next-line no-unused-private-class-members
	#set: Writable<TokenMap>['set'];
	#update: Writable<TokenMap>['update'];

	#unsub: UnsubscribeFunc | undefined = undefined;

	#boardId: string;

	get() {
		return get(this);
	}

	constructor(boardId: string, tokens: TokenMap) {
		this.#boardId = boardId;
		const { subscribe, set, update } = writable(tokens);
		subscribe(($tokens) => console.debug('Tokens', $tokens));
		this.subscribe = subscribe;
		this.#set = set;
		this.#update = update;
	}

	static fromTokens(boardId: string, tokens: TokenResponse[] = []) {
		return new Tokens(boardId, new Map(tokens.map((token) => [token.id, new Token(token)])));
	}

	async init(pb: TypedPocketBase<Schema>) {
		this.#unsub = await pb.from('token').subscribe(
			'*',
			({ action, record }) => {
				console.debug('sub token', action, record);

				if (action === 'delete') {
					this.#update(($tokens) => {
						$tokens.delete(record.id);
						return $tokens;
					});
				} else if (action === 'create') {
					this.#update(($tokens) => {
						$tokens.set(record.id, new Token(record));
						return $tokens;
					});
				} else {
					this.#update(($tokens) => {
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
					filter: eq('board.id', this.#boardId)
				}
			}
		);
	}

	async cleanup() {
		await Promise.all([this.#unsub?.()]);
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
