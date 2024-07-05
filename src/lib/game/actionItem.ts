import type { ActionItemResponse } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

export class ActionItemsStore implements Readable<ActionItems> {
	stores!: GameStores;

	subscribe!: Writable<ActionItems>['subscribe'];
	set!: Writable<ActionItems>['set'];
	update!: Writable<ActionItems>['update'];

	get() {
		return get(this);
	}

	constructor(actionItems: ActionItems) {
		Object.assign(this, writable(actionItems));
	}

	static fromResponse(actionItems: ActionItemResponse[] = []): ActionItems {
		return new ActionItems(actionItems);
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const board = this.stores.board.get();
		if (!board) return;

		this.#unsub = await pb.from('actionItem').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('board.id', board.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<ActionItemResponse>) {
		console.debug('sub actionItem', action, record);

		this.update(($actionItems) => {
			if (action === 'delete') {
				$actionItems.remove(record.id);
			} else if (action === 'create') {
				$actionItems.add(record);
			} else {
				$actionItems.update(record);
			}
			return $actionItems;
		});
	}

	async deinit() {
		await this.#unsub?.();
	}
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
