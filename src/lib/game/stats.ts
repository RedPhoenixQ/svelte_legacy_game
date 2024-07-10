import type { ModifiersResponse, StatsResponse } from '$lib/schema';
import { writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import type { ModifiableAttribute, ModifierValues } from './modifier';

export type StatsMap = {
	/**Map from character id to related Stats */
	character: Map<string, Stats>;
	/**Map from token id to related Stats */
	token: Map<string, Stats>;
	/**Map from stats id to its Stats. The same object is referenced in the other maps*/
	stats: Map<string, Stats>;
};

export class StatsStore implements Writable<StatsMap> {
	#stores!: GameStores;
	/**A reference to the same object that is in the store for direct use. If this is modified the
	 * store must be updated to alert subscribers of changes manually */
	val: StatsMap;

	subscribe!: Writable<StatsMap>['subscribe'];
	set!: Writable<StatsMap>['set'];
	update!: Writable<StatsMap>['update'];

	constructor(stores: GameStores, stats: StatsResponse[] = []) {
		this.#stores = stores;
		this.val = StatsStore.fromResponse(stats);
		Object.assign(this, writable(this.val));
	}

	static fromResponse(statsList: StatsResponse[] = []): StatsMap {
		const statsMap: StatsMap = {
			character: new Map(),
			token: new Map(),
			stats: new Map()
		};
		for (const stats of statsList) {
			const relatedTo = Stats.relatedTo(stats);
			if (relatedTo) {
				const statsInstance = new Stats(stats);
				statsMap[relatedTo].set(stats[relatedTo], statsInstance);
				statsMap.stats.set(stats.id, statsInstance);
			} else {
				console.error('Stats object was not related to anything', stats);
			}
		}
		return statsMap;
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		this.#unsub = await pb.from('stats').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', this.#stores.game.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<StatsResponse>) {
		console.debug('sub stats', action, record);

		const relatedTo = Stats.relatedTo(record);
		if (!relatedTo) {
			console.error('Stats object was not related to anything', record);
			return;
		}

		if (action === 'update') {
			const stats = this.val.stats.get(record.id);
			if (stats) {
				if (stats.updated >= record.updated) return this.val;
				if (stats[relatedTo] !== record[relatedTo]) {
					console.warn('Stats should not change what they are related to');
					this.val.character.delete(stats.character);
					this.val.token.delete(stats.token);
					this.val[relatedTo].set(record[relatedTo], stats);
				}
				stats.assign(record);
			} else {
				const stats = new Stats(record);
				this.val.stats.set(record.id, stats);
				this.val[relatedTo].set(record[relatedTo], stats);
			}
		} else if (action === 'delete') {
			this.val.stats.delete(record.id);
			this.val[relatedTo].delete(record[relatedTo]);
		} else {
			const stats = new Stats(record);
			this.val.stats.set(record.id, stats);
			this.val[relatedTo].set(record[relatedTo], stats);
		}

		this.set(this.val);
	}

	async deinit() {
		await this.#unsub?.();
	}
}

export class Stats implements StatsResponse {
	#inner!: StatsResponse;
	#modifiers: Partial<Record<ModifiableAttribute, ModifierValues>> = {};

	collectionName = 'stats' as const;
	game!: string;
	character!: string;
	token!: string;
	hp!: number;
	maxHp!: number;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	static relatedTo(stats: StatsResponse) {
		return stats.character !== '' ? 'character' : stats.token !== '' ? 'token' : null;
	}

	constructor(stats: StatsResponse) {
		this.assign(stats);
	}

	assign(stats: StatsResponse) {
		this.#inner = stats;
		this.applyModifiers();
	}

	#updateModifier(attribute: ModifiableAttribute) {
		const mod = this.#modifiers[attribute];
		if (!mod) return;
		this[attribute] = this.#inner[attribute] * (1 + mod.multiplier) + mod.flat;
	}

	applyModifiers() {
		Object.assign(this, this.#inner);
		for (const attribute of Object.keys(this.#modifiers) as ModifiableAttribute[]) {
			this.#updateModifier(attribute);
		}
	}

	clearModifiers() {
		this.#modifiers = {};
	}

	addModifier(modifier: ModifiersResponse, update = true) {
		const mod = this.#modifiers[modifier.attribute];
		if (mod) {
			mod.multiplier += modifier.multiplier;
			mod.flat += modifier.flat;
		} else {
			this.#modifiers[modifier.attribute] = {
				multiplier: modifier.multiplier,
				flat: modifier.flat
			};
		}
		if (update) this.#updateModifier(modifier.attribute);
	}

	removeModifier(modifier: ModifiersResponse) {
		const mod = this.#modifiers[modifier.attribute];
		if (!mod) {
			console.warn('Attempting to remove modifier that does not exist', modifier);
			return;
		}
		mod.multiplier -= modifier.multiplier;
		mod.flat -= modifier.flat;
		this.#updateModifier(modifier.attribute);
	}
}
