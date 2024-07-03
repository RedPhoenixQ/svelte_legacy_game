import type { ActionItemResponse } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import type { BoardStore } from './board';
import { pb } from '$lib/pb';

export class ActionItemsStore implements Readable<ActionItems> {
	subscribe!: Writable<ActionItems>['subscribe'];
	set!: Writable<ActionItems>['set'];
	update!: Writable<ActionItems>['update'];

	#board!: BoardStore;
	stores(board: BoardStore) {
		this.#board = board;
	}

	get() {
		return get(this);
	}

	constructor(actionItems: ActionItems) {
		Object.assign(this, writable(actionItems));
	}

	static fromResponse(actionItems: ActionItemResponse[] = []): ActionItemsStore {
		return new ActionItemsStore(new ActionItems(actionItems));
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const board = this.#board.get();
		if (!board) return;

		this.#unsub = await pb.from('actionItem').subscribe(
			'*',
			({ action, record }) => {
				console.debug('sub actionItem', action, record);

				if (action === 'delete') {
					this.update(($actionItems) => {
						$actionItems.remove(record.id);
						return $actionItems;
					});
				} else if (action === 'create') {
					this.update(($actionItems) => {
						$actionItems.add(record);
						return $actionItems;
					});
				} else {
					this.update(($actionItems) => {
						const index = $actionItems.items.findIndex((item) => item.id === record.id);
						if (index < 0) {
							$actionItems.add(record);
						} else {
							const prev = $actionItems.items[index];
							$actionItems.items[index] = record;
							if (prev.actionValue !== record.actionValue) {
								$actionItems.sort();
							}
						}
						return $actionItems;
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
		await this.#unsub();
	}
}

export class ActionItems {
	items: ActionItemResponse[];

	constructor(actionItems: ActionItemResponse[]) {
		this.items = actionItems;
	}

	add(item: ActionItemResponse) {
		this.items.push(item);
		this.sort();
	}

	remove(id: string) {
		this.items = this.items.filter((item) => item.id !== id);
	}

	sort() {
		this.items.sort((a, b) => a.actionValue - b.actionValue);
	}
}
