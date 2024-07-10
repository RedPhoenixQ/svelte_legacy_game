import type { CharactersResponse } from '$lib/schema';
import { writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

export type CharactersMap = Map<string, Character>;

export class CharactersStore implements Writable<CharactersMap> {
	#stores: GameStores;
	/**A reference to the same object that is in the store for direct use. If this is modified the
	 * store must be updated to alert subscribers of changes manually */
	val: CharactersMap;

	subscribe!: Writable<CharactersMap>['subscribe'];
	set!: Writable<CharactersMap>['set'];
	update!: Writable<CharactersMap>['update'];

	constructor(stores: GameStores, characters: CharactersResponse[] = []) {
		this.#stores = stores;
		this.val = CharactersStore.fromResponse(characters);
		Object.assign(this, writable(this.val));
	}

	static fromResponse(characters: CharactersResponse[] = []): CharactersMap {
		return new Map(characters.map((character) => [character.id, new Character(character)]));
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		this.#unsub = await pb.from('characters').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', this.#stores.game.val.id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<CharactersResponse>) {
		console.debug('sub characters', action, record);

		if (action === 'update') {
			const character = this.val.get(record.id);
			if (character) {
				if (character.updated >= record.updated) return;
				character.assign(record);
			} else {
				this.val.set(record.id, new Character(record));
			}
		} else if (action === 'delete') {
			this.val.delete(record.id);
		} else {
			this.val.set(record.id, new Character(record));
		}

		this.set(this.val);
	}

	async deinit() {
		await this.#unsub();
	}
}

export class Character implements CharactersResponse {
	collectionName = 'characters' as const;
	game!: string;
	owner!: string;
	name!: string;
	token!: string;
	art!: string;
	race!: 'khaviri' | 'dwarf' | 'elf' | 'half-elf' | 'moon-elf' | 'sun-elf' | 'sea-elf' | 'human';
	actions!: string[];
	id!: string;
	created!: string;
	updated!: string;
	collectionId!: string;

	constructor(character: CharactersResponse) {
		this.assign(character);
	}

	assign(character: CharactersResponse) {
		Object.assign(this, character);
	}
}
