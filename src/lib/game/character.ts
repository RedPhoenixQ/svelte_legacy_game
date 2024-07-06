import type { CharactersResponse } from '$lib/schema';
import { get, writable, type Writable } from 'svelte/store';
import type { RecordSubscription, UnsubscribeFunc } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';

export type CharactersMap = Map<string, Character>;

export class CharactersStore implements Writable<CharactersMap> {
	stores!: GameStores;

	subscribe!: Writable<CharactersMap>['subscribe'];
	set!: Writable<CharactersMap>['set'];
	update!: Writable<CharactersMap>['update'];

	get() {
		return get(this);
	}

	constructor(characters: CharactersMap) {
		Object.assign(this, writable(characters));
	}

	static fromResponse(characters: CharactersResponse[] = []): CharactersStore {
		return new CharactersStore(
			new Map(characters.map((character) => [character.id, new Character(character)]))
		);
	}

	#unsub!: UnsubscribeFunc;
	async init() {
		this.#unsub = await pb.from('characters').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', this.stores.game.get().id)
			}
		});
	}

	handleChange({ action, record }: RecordSubscription<CharactersResponse>) {
		console.debug('sub characters', action, record);

		if (action === 'delete') {
			this.update(($characters) => {
				$characters.delete(record.id);
				return $characters;
			});
		} else if (action === 'create') {
			this.update(($characters) => {
				$characters.set(record.id, new Character(record));
				return $characters;
			});
		} else {
			this.update(($characters) => {
				const character = $characters.get(record.id);
				if (character) {
					if (character.updated >= record.updated) return $characters;
					character.assign(record);
				} else {
					$characters.set(record.id, new Character(record));
				}
				return $characters;
			});
		}
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
