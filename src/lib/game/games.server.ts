import { browser } from '$app/environment';
import { GameStores } from '.';
import EventSource from 'eventsource';

if (!browser) {
	// @ts-expect-error: The polyfill doesn't match 100%
	global.EventSource = EventSource;
}

export const games = new Map<string, GameStores>();

// TODO: Handle removing games at some point (calling deinit())

export function startGame(gameId: string, ...data: ConstructorParameters<typeof GameStores>) {
	if (games.has(gameId)) return;

	const game = new GameStores(...data);
	game.init();
	games.set(gameId, game);
}

export function getGame(gameId: string) {
	const game = games.get(gameId);
	// TODO: Try to start the game serverside before exiting
	if (!game) {
		throw new Error('Game did not exits');
	}
	return game;
}
