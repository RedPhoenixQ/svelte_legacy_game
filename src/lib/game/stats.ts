import type { StatsResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

export type StatsMap = {
	/**Map from character id to related Stats */
	character: Map<string, Stats>;
	/**Map from token id to related Stats */
	token: Map<string, Stats>;
};

export class StatsStore implements Writable<StatsMap> {
	stores!: GameStores;

	subscribe!: Writable<StatsMap>['subscribe'];
	set!: Writable<StatsMap>['set'];
	update!: Writable<StatsMap>['update'];

	get() {
		return get(this);
	}

	constructor(statsMap: StatsMap) {
		Object.assign(this, writable(statsMap));
	}

	static fromResponse(statsList: StatsResponse[] = []): StatsMap {
		const statsMap: StatsMap = {
			character: new Map(),
			token: new Map()
		};
		for (const stats of statsList) {
			switch (Stats.relatedTo(stats)) {
				case 'character':
					statsMap.character.set(stats.character, new Stats(stats));
					break;
				case 'token':
					statsMap.token.set(stats.token, new Stats(stats));
					break;
				default:
					console.error('Stats object was not related to anything', stats);
					break;
			}
		}
		return statsMap;
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		const game = this.stores.game.get();
		if (!game) throw new Error('No game present in init');

		this.#unsub = await pb.from('stats').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', game.id)
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

		if (action === 'delete') {
			this.update(($statsMap) => {
				$statsMap[relatedTo].delete(record[relatedTo]);
				return $statsMap;
			});
		} else if (action === 'create') {
			this.update(($statsMap) => {
				$statsMap[relatedTo].set(record[relatedTo], new Stats(record));
				return $statsMap;
			});
		} else {
			this.update(($statsMap) => {
				const stats = $statsMap[relatedTo].get(record[relatedTo]);
				if (stats) {
					if (stats.updated >= record.updated) return $statsMap;
					stats.assign(record);
				} else {
					$statsMap[relatedTo].set(record[relatedTo], new Stats(record));
				}
				return $statsMap;
			});
		}
	}

	async deinit() {
		await this.#unsub?.();
	}
}

export class Stats implements StatsResponse {
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
		Object.assign(this, stats);
	}
}
