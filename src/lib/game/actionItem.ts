import type { ActionItemResponse } from '$lib/schema';
import { derived, readable } from 'svelte/store';
import type { RecordSubscription } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import type { Character } from './character';
import type { Token } from './token';

export class ActionItemsStore extends Store<ActionItems> implements Synced<ActionItemResponse> {
	constructor(stores: GameStores, actionItems: ActionItemResponse[] = []) {
		super(stores, ActionItemsStore.fromResponse(actionItems));
	}

	static fromResponse(actionItems: ActionItemResponse[] = []): ActionItems {
		return new ActionItems(actionItems);
	}

	async init() {
		if (!this.stores.board.val) return;

		this.unsub = await pb.from('actionItem').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', this.stores.board.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<ActionItemResponse>) {
		console.debug('sub actionItem', action, record);

		if (action === 'update') {
			this.val.update(record);
		} else if (action === 'create') {
			this.val.add(record);
		} else {
			this.val.remove(record.id);
		}

		this.syncStore();
	}
}

export type CurrentTurn =
	| {
			item: ActionItemResponse;
			token?: Token;
			character?: Character;
	  }
	| undefined;

export function createFirstActionItem(stores: GameStores) {
	let current = stores.actionItems.val.items[0];
	return readable(current, (set) => {
		return stores.actionItems.subscribe(($actionItems) => {
			const first = $actionItems.items[0];
			if (first !== current) {
				current = first;
				set(current);
			}
		});
	});
}

/** MUST be created after firstActionItem */
export function createCurrentTurn(stores: GameStores) {
	return derived(
		[stores.firstActionItem, stores.characters, stores.tokens],
		([$first, $characters, $tokens]) => {
			if (!$first) return;
			const token = $tokens.get($first.token);
			const character = token?.character ? $characters.get(token.character) : undefined;
			return { item: $first, token, character };
		}
	);
}

export class ActionItems {
	items: ActionItemResponse[];
	#ids: Set<string>;

	constructor(actionItems: ActionItemResponse[]) {
		this.#ids = new Set(actionItems.map((item) => item.id));
		this.items = actionItems;
	}

	add(item: ActionItemResponse) {
		if (this.#ids.has(item.id)) {
			this.update(item);
		}
		this.#ids.add(item.id);
		this.items.push(item);
		this.sort();
	}

	remove(id: string) {
		if (!this.#ids.delete(id)) return;
		this.items = this.items.filter((item) => item.id !== id);
	}

	update(item: ActionItemResponse) {
		const index = this.items.findIndex(({ id }) => id === item.id);
		if (index < 0) {
			// Delete because we now know that the id is not the the array. This
			// guarantees that add() works and syncs the set and array again
			this.#ids.delete(item.id);
			this.add(item);
		} else {
			const prev = this.items[index];
			if (prev.updated >= item.updated) {
				// The new record is the same or older and should not be assigned
				return;
			}
			this.items[index] = item;
			if (prev.actionValue !== item.actionValue) {
				// We only need to sort again the the actionValues have changed
				this.sort();
			}
		}
	}

	sort() {
		this.items.sort((a, b) => a.actionValue - b.actionValue);
	}
}
