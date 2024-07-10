import type { ModifiersResponse, StatsResponse } from '$lib/schema';
import type { RecordSubscription } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';
import type { ModifiableAttribute, ModifierValues } from './modifier';

export type StatsMap = {
	/**Map from character id to related Stats */
	character: Map<string, Stats>;
	/**Map from token id to related Stats */
	token: Map<string, Stats>;
	/**Map from stats id to its Stats. The same object is referenced in the other maps*/
	stats: Map<string, Stats>;
};

export class StatsStore extends Store<StatsMap> implements Synced<StatsResponse> {
	constructor(stores: GameStores, stats: StatsResponse[] = []) {
		super(stores, StatsStore.fromResponse(stats));
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

	async init() {
		this.unsub = await pb.from('stats').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', this.stores.game.val.id)
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

		this.syncStore();
	}
}

export class Stats implements StatsResponse {
	#inner!: StatsResponse;
	#modifiers: Partial<Record<ModifiableAttribute, Record<'pre' | 'post', ModifierValues>>> = {};

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
		this[attribute] =
			(this.#inner[attribute] * (1 + mod.pre.multiplier) + mod.pre.flat) *
				(1 + mod.post.multiplier) +
			mod.post.flat;
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
		let mod = this.#modifiers[modifier.attribute];
		if (!mod) {
			mod = {
				pre: {
					multiplier: 0,
					flat: 0
				},
				post: {
					multiplier: 0,
					flat: 0
				}
			};
			this.#modifiers[modifier.attribute] = mod;
		}
		const selected = modifier.applyPost ? mod.post : mod.pre;
		selected.multiplier += modifier.multiplier;
		selected.flat += modifier.flat;

		if (update) this.#updateModifier(modifier.attribute);
	}

	removeModifier(modifier: ModifiersResponse) {
		const mod = this.#modifiers[modifier.attribute];
		if (!mod) {
			console.warn('Attempting to remove modifier that does not exist', modifier);
			return;
		}
		const selected = modifier.applyPost ? mod.post : mod.pre;
		selected.multiplier -= modifier.multiplier;
		selected.flat -= modifier.flat;

		this.#updateModifier(modifier.attribute);
	}
}
