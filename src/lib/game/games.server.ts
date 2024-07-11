import { browser } from '$app/environment';
import { GameStores } from '.';
import EventSource from 'eventsource';

if (!browser) {
	// @ts-expect-error: The polyfill doesn't match 100%
	global.EventSource = EventSource;
}

export class ServerGame extends GameStores {
	// TODO: Handle removing games at some point (calling deinit())
	static #instances = new Map<string, ServerGame>();
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
