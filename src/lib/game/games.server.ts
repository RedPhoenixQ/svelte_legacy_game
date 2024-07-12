import { browser } from '$app/environment';
import type { TypedPocketBase } from 'typed-pocketbase';
import type { Schema } from '$lib/schema';
import type { SendOptions } from 'pocketbase';
import { AutoclearMap } from '$lib/helpers/autoclearMap';
import { GameStores } from '.';
import EventSource from 'eventsource';

if (!browser) {
	// @ts-expect-error: The polyfill doesn't match 100%
	global.EventSource = EventSource;
}

export class ServerGame extends GameStores {
	static #instances = new AutoclearMap<string, ServerGame>({
		onDelete(_key, value) {
			value.deinit();
		}
	});

	constructor(game: ConstructorParameters<typeof GameStores>[0]) {
		const cached = ServerGame.#instances.get(game.id);
		if (cached) return cached;
		super(game, false);
		ServerGame.#instances.set(game.id, this);
		this.init().catch((err) => {
			ServerGame.#instances.delete(game.id);
			console.error('ServerGame failed to init:', err);
		});
	}

	static getGame(id: string): ServerGame | undefined {
		return ServerGame.#instances.get(id);
	}

	static async fetchGame(gameId: string, client: TypedPocketBase<Schema>, options?: SendOptions) {
		return client.from('games').getOne(gameId, {
			...options,
			select: {
				expand: {
					dms: true,
					players: true,
					activeBoard: {
						expand: {
							'tokens(board)': true,
							'actionItems(board)': true
						}
					},
					'characters(game)': true,
					'stats(game)': {
						expand: {
							'modifiers(stats)': true
						}
					}
				}
			}
		});
	}
}
