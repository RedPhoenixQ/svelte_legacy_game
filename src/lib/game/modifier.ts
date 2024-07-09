import type { ModifiersResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

export type ModifierValues = Pick<ModifiersResponse, 'multiplier' | 'flat'>;
export type ModifiableAttribute = ModifiersResponse['attribute'];

export type ModifierMap = {
	/** Map from modifier ids to modifiers */
	modifiers: Map<string, Modifier>;
	/** Map from stats ids to modifiers */
	stats: Map<string, Map<string, Modifier>>;
};

export class ModifiersStore implements Writable<ModifierMap> {
	stores!: GameStores;
	val: ModifierMap;

	subscribe!: Writable<ModifierMap>['subscribe'];
	set!: Writable<ModifierMap>['set'];
	update!: Writable<ModifierMap>['update'];

	get() {
		return get(this);
	}

	constructor(modifiers: ModifierMap) {
		this.val = modifiers;
		Object.assign(this, writable(this.val));
	}

	static fromResponse(modifiers: ModifiersResponse[] = []): ModifierMap {
		const modifierMap: ModifierMap = {
			modifiers: new Map(),
			stats: new Map()
		};
		for (const record of modifiers) {
			const modifier = new Modifier(record);
			modifierMap.modifiers.set(modifier.id, modifier);
			const stats = modifierMap.stats.get(modifier.stats);
			if (stats) {
				stats.set(modifier.id, modifier);
			} else {
				modifierMap.stats.set(modifier.stats, new Map([[modifier.id, modifier]]));
			}
		}
		return modifierMap;
	}

	updateStats() {
		for (const [id, modifiers] of this.val.stats.entries()) {
			const stats = this.stores.stats.val.stats.get(id);
			if (!stats) {
				console.warn('No stats object for modifiers', modifiers);
				continue;
			}
			stats.clearModifiers();
			for (const modifier of modifiers.values()) {
				stats.addModifier(modifier, false);
			}
			stats.applyModifiers();
		}
		this.stores.stats.update((val) => val);
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const game = this.stores.game.get();
		if (!game) return;

		this.#unsub = await pb.from('modifiers').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('stats.game.id', game.id)
			}
		});
	}

	/** NOTE: On action === 'delete' record may contain only id */
	handleChange({ action, record }: RecordSubscription<ModifiersResponse>) {
		console.debug('sub modifier', action, record);
		const stats = this.stores.stats.val.stats.get(record.stats);

		if (action === 'update') {
			const modifier = this.val.modifiers.get(record.id);
			if (modifier) {
				if (modifier.updated >= record.updated) return;
				stats?.removeModifier(modifier);
				modifier.assign(record);
			} else {
				console.warn('Recived update for unknown modifier');
				this.handleChange({ action: 'create', record });
				return;
			}
			stats?.addModifier(record);
		} else if (action === 'create') {
			const modifier = new Modifier(record);
			this.val.modifiers.set(record.id, modifier);
			const statsMap = this.val.stats.get(record.stats);
			if (statsMap) {
				statsMap.set(record.id, modifier);
			} else {
				this.val.stats.set(record.stats, new Map([[record.id, modifier]]));
			}
			stats?.addModifier(record);
		} else {
			this.val.stats.get(record.stats)?.delete(record.id);
			if (this.val.modifiers.delete(record.id)) {
				// Only remove the modifier if it existed before
				stats?.removeModifier(record);
			} else {
				console.warn('Recived delete for record that does not exist', record);
			}
		}
		this.update((val) => val);
		if (stats) this.stores.stats.update((val) => val);
	}

	async deinit() {
		await this.#unsub?.();
	}
}

export const TOKEN_SIZE = 50 as const;

export class Modifier implements ModifiersResponse {
	collectionName = 'modifiers' as const;
	stats!: string;
	attribute!: 'hp' | 'maxHp';
	multiplier!: number;
	flat!: number;
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	constructor(modifier: ModifiersResponse) {
		this.assign(modifier);
	}

	assign(modifier: ModifiersResponse) {
		Object.assign(this, modifier);
	}
}
