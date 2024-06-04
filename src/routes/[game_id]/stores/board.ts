import { browser } from '$app/environment';
import { pb } from '$lib/pb';
import type { BoardResponse, TokenResponse } from '$lib/schema';
import type { UnsubscribeFunc, RecordSubscription } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { eq } from 'typed-pocketbase';

export const board: Writable<BoardResponse | undefined> = writable();
board.subscribe(($board) => console.debug('store board', $board));
export const tokens: Writable<Map<string, TokenResponse>> = writable(new Map());
tokens.subscribe(($tokens) => console.debug('store tokens', $tokens));

let unsubs: UnsubscribeFunc[] = [];
let ignore_sub = false;
export async function initBoard(
	boardOrId:
		| undefined
		| string
		| (BoardResponse & {
				expand?: {
					'token(board)': TokenResponse[];
				};
		  })
) {
	ignore_sub = true;

	if (!boardOrId) {
		board.set(undefined);
		initTokens([]);
	} else if (typeof boardOrId === 'string') {
		const new_board = await pb.from('board').getOne(boardOrId, {
			select: {
				expand: {
					'token(board)': true
				}
			}
		});
		board.set(new_board);
		initTokens(new_board.expand?.['token(board)'] ?? []);
	} else {
		board.set(boardOrId);
		initTokens(boardOrId.expand?.['token(board)'] ?? boardOrId.id);
	}

	await Promise.allSettled(unsubs.map((unsub) => unsub?.()));
	ignore_sub = false;
	const boardId = typeof boardOrId === 'string' ? boardOrId : boardOrId?.id;
	if (!browser || !boardId) return;

	unsubs = await Promise.all([
		pb.from('board').subscribe(boardId, handleBoard),
		pb.from('token').subscribe('*', handleTokens, {
			query: {
				filter: eq('board.id', boardId)
			}
		})
	]);
}

export async function initTokens(tokensOrBoardId: string | TokenResponse[]) {
	if (typeof tokensOrBoardId === 'string') {
		const new_tokens = await pb.from('token').getFullList({
			filter: eq('board.id', tokensOrBoardId)
		});
		tokens.set(new Map(new_tokens.map((token) => [token.id, token])));
	} else if (!tokensOrBoardId.length) {
		tokens.update(($tokens) => {
			$tokens.clear();
			return $tokens;
		});
	} else {
		tokens.set(new Map(tokensOrBoardId.map((token) => [token.id, token])));
	}
}

export async function deinitBoard() {
	await Promise.all(unsubs.map((unsub) => unsub?.()));
}

function handleBoard({ action, record }: RecordSubscription<BoardResponse>) {
	if (ignore_sub) return;
	console.debug('sub board', action, record);

	switch (action) {
		case 'update':
			board.set(record);
			break;
		case 'delete':
			initBoard(undefined);
			break;
	}
}

function handleTokens({ action, record }: RecordSubscription<TokenResponse>) {
	if (ignore_sub) return;
	console.debug('sub tokens', action, record);

	if (action === 'delete') {
		tokens.update(($tokens) => {
			$tokens.delete(record.id);
			return $tokens;
		});
	} else {
		tokens.update(($tokens) => {
			$tokens.set(record.id, record);
			return $tokens;
		});
	}
}
