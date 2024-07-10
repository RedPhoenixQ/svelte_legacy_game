import type { CharactersResponse } from '$lib/schema';
import type { RecordSubscription } from 'pocketbase';
import { eq } from 'typed-pocketbase';
import { pb } from '$lib/pb';
import type { GameStores } from '.';
import { Store, type Synced } from './store';

export type CharactersMap = Map<string, Character>;

export class CharactersStore extends Store<CharactersMap> implements Synced<CharactersResponse> {
	constructor(stores: GameStores, characters: CharactersResponse[] = []) {
		super(stores, CharactersStore.fromResponse(characters));
	}

	static fromResponse(characters: CharactersResponse[] = []): CharactersMap {
		return new Map(characters.map((character) => [character.id, new Character(character)]));
	}

	async init() {
		this.unsub = await pb.from('characters').subscribe('*', this.handleChange.bind(this), {
			query: {
				filter: eq('game.id', this.stores.game.val.id)
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

		this.syncStore();
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
