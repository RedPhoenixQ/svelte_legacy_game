import { browser } from '$app/environment';
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
	static getGame(id: string): ServerGame | undefined {
		return ServerGame.#instances.get(id);
	}

	constructor(game: ConstructorParameters<typeof GameStores>[0]) {
		const cached = ServerGame.#instances.get(game.id);
		if (cached) return cached;
		super(game, false);
		this.init()
			.then(() => ServerGame.#instances.set(game.id, this))
			.catch((err) => console.error('ServerGame failed to init:', err));
	}
}
