import type { CharactersResponse, Schema } from '$lib/schema';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import type { UnsubscribeFunc } from 'pocketbase';
import { eq, type TypedPocketBase } from 'typed-pocketbase';

export type CharactersMap = Map<string, Character>;

export class Characters implements Readable<CharactersMap> {
	subscribe: Writable<CharactersMap>['subscribe'];
	// eslint-disable-next-line no-unused-private-class-members
	#set: Writable<CharactersMap>['set'];
	#update: Writable<CharactersMap>['update'];

	#unsub: UnsubscribeFunc | undefined = undefined;

	#gameId: string;

	get() {
		return get(this);
	}

	constructor(gameId: string, characters: CharactersMap) {
		this.#gameId = gameId;
		const { subscribe, set, update } = writable(characters);
		subscribe(($characters) => console.debug('Characters', $characters));
		this.subscribe = subscribe;
		this.#set = set;
		this.#update = update;
	}

	static fromCharacters(gameId: string, characters: CharactersResponse[] = []) {
		return new Characters(
			gameId,
			new Map(characters.map((character) => [character.id, new Character(character)]))
		);
	}

	async init(pb: TypedPocketBase<Schema>) {
		this.#unsub = await pb.from('characters').subscribe(
			'*',
			({ action, record }) => {
				console.debug('sub characters', action, record);

				if (action === 'delete') {
					this.#update(($characters) => {
						$characters.delete(record.id);
						return $characters;
					});
				} else if (action === 'create') {
					this.#update(($characters) => {
						$characters.set(record.id, new Character(record));
						return $characters;
					});
				} else {
					this.#update(($characters) => {
						const character = $characters.get(record.id);
						if (character) {
							character.assign(record);
						} else {
							$characters.set(record.id, new Character(record));
						}
						return $characters;
					});
				}
			},
			{
				query: {
					filter: eq('game.id', this.#gameId)
				}
			}
		);
	}

	async cleanup() {
		if (this.#unsub) {
			await this.#unsub();
		}
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
