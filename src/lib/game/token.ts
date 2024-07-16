import type { TokensResponse } from '$lib/schema';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import { Box } from 'detect-collisions';
import type { RecordSubscription } from 'pocketbase';

export type TokenMap = Map<string, Token>;

export class TokensStore extends Store<TokenMap> implements Synced<TokensResponse> {
	constructor(stores: GameStores, tokens: TokensResponse[] = []) {
		super(stores, TokensStore.fromResponse(tokens));
	}

	static fromResponse(tokens: TokensResponse[] = []): TokenMap {
		return new Map(tokens.map((token) => [token.id, new Token(token)]));
	}

	async init() {
		if (!this.stores.board.val) return;

		for (const token of this.val.values()) {
			this.stores.board.val.insert(token);
		}

		this.unsub = await pb.from('tokens').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', this.stores.board.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<TokensResponse>) {
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
			this.stores.board.val.remove(token);
			this.val.delete(record.id);
		} else {
			const token = new Token(record);
			this.val.set(record.id, token);
			this.stores.board.val.insert(token);
		}

		this.syncStore();
	}
}

export const TOKEN_SIZE = 50 as const;

export class Token extends Box implements TokensResponse {
	// x, y and angle is handled by Box
	collectionName = 'tokens' as const;
	board!: string;
	character!: string;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	constructor(token: TokensResponse) {
		super(token, TOKEN_SIZE, TOKEN_SIZE, { isCentered: true, angle: token.angle });
		Object.assign(this, token);
	}

	assign(token: TokensResponse) {
		Object.assign(this, token);
		this.setPosition(token.x, token.y, false);
		this.setAngle(token.angle, false);
		// NOTE: This will also handle angle which is assigned to above
		this.updateBody();
	}
}
