import { writable, type Readable, type Unsubscriber, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import type { GameStores } from '.';

export class Store<T> implements Readable<T> {
	protected stores: GameStores;
	/**A reference to the same object that is in the store for direct use. If this is modified the
	 * store must be updated to alert subscribers of changes manually */
	val: T;

	readonly subscribe: Writable<T>['subscribe'];
	readonly #set: Writable<T>['set'];
	syncStore() {
		this.#set(this.val);
	}

	constructor(stores: GameStores, val: T) {
		this.stores = stores;
		this.val = val;

		const { subscribe, set } = writable(this.val);
		this.subscribe = subscribe;
		this.#set = set;
	}

	protected unsub?: Unsubscriber | UnsubscribeFunc = undefined;
	async init() {
		console.warn('Unimplemented init function', this);
	}
	async deinit() {
		if (this.unsub) {
			await this.unsub();
		} else {
			console.warn('Called deinit without an unsub function', this);
		}
	}
}

export interface Synced<T> {
	handleChange(sub: RecordSubscription<T>): void;
	init(): Promise<void>;
	deinit(): Promise<void>;
}
