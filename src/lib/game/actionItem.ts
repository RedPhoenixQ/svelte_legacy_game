import type { ActionItemResponse, Schema } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { eq, type TypedPocketBase } from 'typed-pocketbase';

export class ActionItems implements Readable<ActionItemResponse[]> {
	subscribe: Writable<ActionItemResponse[]>['subscribe'];
	// eslint-disable-next-line no-unused-private-class-members
	#set: Writable<ActionItemResponse[]>['set'];
	#update: Writable<ActionItemResponse[]>['update'];

	#unsub: UnsubscribeFunc | undefined = undefined;

	#boardId: string;

	get() {
		return get(this);
	}

	constructor(boardId: string, actionItems: ActionItemResponse[]) {
		this.#boardId = boardId;
		const { subscribe, set, update } = writable(actionItems);
		subscribe(($actionItems) => console.debug('ActionItem', $actionItems));
		this.subscribe = subscribe;
		this.#set = set;
		this.#update = update;
	}

	async init(pb: TypedPocketBase<Schema>) {
		this.#unsub = await pb.from('actionItem').subscribe(
			'*',
			({ action, record }) => {
				console.debug('sub actionItem', action, record);

				if (action === 'delete') {
					this.#update(($actionItems) => {
						return $actionItems.filter((item) => item.id !== record.id);
					});
				} else if (action === 'create') {
					this.#update(($actionItems) => {
						$actionItems.push(record);
						$actionItems.sort(ActionItems.sort);
						return $actionItems;
					});
				} else {
					this.#update(($actionItems) => {
						const index = $actionItems.findIndex((item) => item.id === record.id);
						if (index < 0) {
							$actionItems.push(record);
							$actionItems.sort(ActionItems.sort);
						} else {
							const prev = $actionItems[index];
							$actionItems[index] = record;
							if (prev.actionValue !== record.actionValue) {
								$actionItems.sort(ActionItems.sort);
							}
						}
						return $actionItems;
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

	static sort(a: ActionItemResponse, b: ActionItemResponse): number {
		return a.actionValue - b.actionValue;
	}
}
