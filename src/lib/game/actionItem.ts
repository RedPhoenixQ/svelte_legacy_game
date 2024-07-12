import type { ActionItemsResponse } from '$lib/schema';
import type { RecordSubscription } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import type { Character } from './character';
import type { Token } from './token';

export class ActionItemsStore extends Store<ActionItems> implements Synced<ActionItemsResponse> {
	constructor(stores: GameStores, actionItems: ActionItemsResponse[] = []) {
		super(stores, ActionItemsStore.fromResponse(actionItems));
	}

	static fromResponse(actionItems: ActionItemsResponse[] = []): ActionItems {
		return new ActionItems(actionItems);
	}

	async init() {
		if (!this.stores.board.val) return;

		this.unsub = await pb.from('actionItems').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', this.stores.board.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<ActionItemsResponse>) {
		console.debug('sub actionItems', action, record);

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
export type CurrentTurnInner =
	| {
			item: ActionItemsResponse;
			token?: Token;
			character?: Character;
	  }
	| undefined;

/** MUST be created after actionItems */
export class FirstActionItemStore extends Store<ActionItemsResponse | undefined> {
	constructor(stores: GameStores) {
		super(stores, undefined);
		this.#onChange();
	}

	#onChange() {
		const first = this.stores.actionItems.val.items[0];
		if (
			// One of them is undefined
			typeof first !== typeof this.val ||
			// First is still the same id
			(first?.id === this.val?.id &&
				// First has been updated
				first.updated !== this.val.updated)
		) {
			this.val = first;
			this.syncStore();
		}
	}

	async init() {
		this.unsub = this.stores.actionItems.subscribe(this.#onChange.bind(this));
	}
}

export class ActionItems {
	items: ActionItemsResponse[];
	#ids: Set<string>;

	constructor(actionItems: ActionItemsResponse[]) {
		this.#ids = new Set(actionItems.map((item) => item.id));
		this.items = actionItems;
	}

	add(item: ActionItemsResponse) {
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

	update(item: ActionItemsResponse) {
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

	findFirstSafeActionValue(after: number) {
		let newValue = after;
		for (let i = 0; i < 100; i++) {
			// NOTE: This is slow but should rarely be called more than once
			const item = this.items.findLast((item) => item.actionValue <= newValue);
			if (!item || item.actionValue !== newValue) {
				// The values are not the same, it's safe
				return newValue;
			}
			// Add a small offset to try again
			newValue = after + Math.random() * 0.001;
		}
		throw new Error('Failed to find a safe action value');
	}
}
