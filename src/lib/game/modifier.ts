import type { ModifiersResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

/** Map from stats.id to map of modifier ids to modifiers */
export type ModifierMap = Map<string, Map<string, Modifier>>;

export type ModifierValues = Pick<ModifiersResponse, 'multiplier' | 'flat'>;
export type ModifiableAttribute = ModifiersResponse['attribute'];

export class ModifiersStore implements Writable<ModifierMap> {
	stores!: GameStores;

	subscribe!: Writable<ModifierMap>['subscribe'];
	set!: Writable<ModifierMap>['set'];
	update!: Writable<ModifierMap>['update'];

	get() {
		return get(this);
	}

	constructor(modifiers: ModifierMap) {
		Object.assign(this, writable(modifiers));
	}

	static fromResponse(modifiers: ModifiersResponse[] = []): ModifierMap {
		const modifierMap: ModifierMap = new Map();
		for (const modifier of modifiers) {
			const modifiers = modifierMap.get(modifier.stats);
			if (modifiers) {
				modifiers.set(modifier.id, new Modifier(modifier));
			} else {
				modifierMap.set(modifier.stats, new Map([[modifier.id, new Modifier(modifier)]]));
			}
		}
		return modifierMap;
	}

	updateStats() {
		const statsMap = this.stores.stats.get();
		const modifiersMap = this.get();
		for (const stats of statsMap.stats.values()) {
			stats.clearModifiers();
			const modifiers = modifiersMap.get(stats.id);
			if (!modifiers) continue;
			for (const modifier of modifiers.values()) {
				stats.addModifier(modifier);
			}
		}
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

	handleChange({ action, record }: RecordSubscription<ModifiersResponse>) {
		console.debug('sub modifier', action, record);
		const statsMap = this.stores.stats.get();
		if (!statsMap) return console.error('No stats store present');
		const stats = statsMap.stats.get(record.stats);

		console.log(stats);

		if (action === 'delete') {
			this.update(($modifierMap) => {
				const modifiers = $modifierMap.get(record.stats);
				if (!modifiers) {
					console.warn('Recived delete for record that does not exist');
					return $modifierMap;
				}
				if (modifiers.delete(record.id)) {
					// Only remove the modifier if it existed before
					stats?.removeModifier(record);
				}
				return $modifierMap;
			});
		} else if (action === 'create') {
			this.update(($modifierMap) => {
				const modifiers = $modifierMap.get(record.stats);
				const modifier = new Modifier(record);
				if (modifiers) {
					modifiers.set(record.id, modifier);
				} else {
					$modifierMap.set(record.stats, new Map([[record.id, modifier]]));
				}
				stats?.addModifier(record);
				return $modifierMap;
			});
		} else {
			this.update(($modifierMap) => {
				const modifiers = $modifierMap.get(record.stats);
				if (modifiers) {
					const modifier = modifiers.get(record.id);
					if (modifier) {
						if (modifier.updated >= record.updated) return $modifierMap;
						stats?.removeModifier(modifier);
						modifier.assign(record);
					} else {
						console.warn('Recived update for unknown modifier');
						modifiers.set(record.id, new Modifier(record));
					}
				} else {
					console.warn('Recived update for unknown modifier');
					$modifierMap.set(record.stats, new Map([[record.id, new Modifier(record)]]));
				}
				stats?.addModifier(record);

				return $modifierMap;
			});
		}
		this.stores.stats.set(statsMap);
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
