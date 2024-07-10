import type { TokenResponse } from '$lib/schema';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import { Box } from 'detect-collisions';
import type { RecordSubscription } from 'pocketbase';

export type TokenMap = Map<string, Token>;

export class TokensStore extends Store<TokenMap> implements Synced<TokenResponse> {
	constructor(stores: GameStores, tokens: TokenResponse[] = []) {
		super(stores, TokensStore.fromResponse(tokens));
	}

	static fromResponse(tokens: TokenResponse[] = []): TokenMap {
		return new Map(tokens.map((token) => [token.id, new Token(token)]));
	}

	async init() {
		if (!this.stores.board.val) return;

		for (const token of this.val.values()) {
			this.stores.board.val.insert(token.collider);
		}

		this.unsub = await pb.from('token').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', this.stores.board.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<TokenResponse>) {
		console.debug('sub token', action, record);
		if (!this.stores.board.val) return;

		if (action === 'update') {
			const token = this.val.get(record.id);
			if (token) {
				if (token.updated >= record.updated) return;
				token.assign(record);
			} else {
				this.val.set(record.id, new Token(record));
			}
		} else if (action === 'delete') {
			const token = this.val.get(record.id);
			if (!token) return this.val;
			this.stores.board.val.remove(token.collider);
			this.val.delete(record.id);
		} else {
			const token = new Token(record);
			this.val.set(record.id, token);
			this.stores.board.val.insert(token.collider);
		}

		this.syncStore();
	}
}

export const TOKEN_SIZE = 50 as const;

export class Token implements TokenResponse {
	collectionName = 'token' as const;
	board!: string;
	character!: string;
	x!: number;
	y!: number;
	angle!: number;
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
