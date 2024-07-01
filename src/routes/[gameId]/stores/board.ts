import { browser } from '$app/environment';
import { pb } from '$lib/pb';
import type { ActionItemResponse, BoardResponse, TokenResponse } from '$lib/schema';
import type { UnsubscribeFunc, RecordSubscription } from 'pocketbase';
import { writable, type Writable } from 'svelte/store';
import { eq } from 'typed-pocketbase';

export const board: Writable<BoardResponse | undefined> = writable();
board.subscribe(($board) => console.debug('store board', $board));
export const tokens: Writable<Map<string, TokenResponse>> = writable(new Map());
tokens.subscribe(($tokens) => console.debug('store tokens', $tokens));
export const actionItems: Writable<ActionItemResponse[]> = writable([]);
actionItems.subscribe(($actionItems) => console.debug('store actionItems', $actionItems));

let unsubs: UnsubscribeFunc[] = [];
let ignoreSub = false;
export async function initBoard(
	boardOrId:
		| undefined
		| string
		| (BoardResponse & {
				expand?: {
					'token(board)'?: TokenResponse[];
					'actionItem(board)'?: ActionItemResponse[];
				};
		  })
) {
	ignoreSub = true;

	if (!boardOrId) {
		board.set(undefined);
		initTokens([]);
	} else if (typeof boardOrId === 'string') {
		const newBoard = await pb.from('board').getOne(boardOrId, {
			select: {
				expand: {
					'token(board)': true,
					'actionItem(board)': true
				}
			}
		});
		board.set(newBoard);
		initTokens(newBoard.expand?.['token(board)'] ?? []);
		initActionItems(newBoard.expand?.['actionItem(board)'] ?? []);
	} else {
		board.set(boardOrId);
		initTokens(boardOrId.expand?.['token(board)'] ?? boardOrId.id);
		initActionItems(boardOrId.expand?.['actionItem(board)'] ?? boardOrId.id);
	}

	await Promise.allSettled(unsubs.map((unsub) => unsub?.()));
	ignoreSub = false;
	const boardId = typeof boardOrId === 'string' ? boardOrId : boardOrId?.id;
	if (!browser || !boardId) return;

	unsubs = await Promise.all([
		pb.from('board').subscribe(boardId, handleBoard),
		pb.from('token').subscribe('*', handleTokens, {
			query: {
				filter: eq('board.id', boardId)
			}
		}),
		pb.from('actionItem').subscribe('*', handleActionItem, {
			query: {
				filter: eq('board.id', boardId)
			}
		})
	]);
}

export async function initTokens(tokensOrBoardId: string | TokenResponse[]) {
	if (typeof tokensOrBoardId === 'string') {
		const newTokens = await pb.from('token').getFullList({
			filter: eq('board.id', tokensOrBoardId)
		});
		tokens.set(new Map(newTokens.map((token) => [token.id, token])));
	} else if (!tokensOrBoardId.length) {
		tokens.update(($tokens) => {
			$tokens.clear();
			return $tokens;
		});
	} else {
		tokens.set(new Map(tokensOrBoardId.map((token) => [token.id, token])));
	}
}

export async function initActionItems(actionItemsOrBoardId: string | ActionItemResponse[]) {
	if (typeof actionItemsOrBoardId === 'string') {
		const newActionItems = await pb.from('actionItem').getFullList({
			filter: eq('board.id', actionItemsOrBoardId),
			sort: '+actionValue'
		});
		actionItems.set(newActionItems);
	} else if (!actionItemsOrBoardId.length) {
		actionItems.set([]);
	} else {
		actionItemsOrBoardId.sort(sortActionItems);
		actionItems.set(actionItemsOrBoardId);
	}
}

export function sortActionItems(a: ActionItemResponse, b: ActionItemResponse): number {
	return a.actionValue - b.actionValue;
}

export async function deinitBoard() {
	await Promise.all(unsubs.map((unsub) => unsub?.()));
}

function handleBoard({ action, record }: RecordSubscription<BoardResponse>) {
	if (ignoreSub) return;
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
	if (ignoreSub) return;
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

function handleActionItem({ action, record }: RecordSubscription<ActionItemResponse>) {
	if (ignoreSub) return;
	console.debug('sub actionItem', action, record);

	if (action === 'delete') {
		actionItems.update(($actionItems) => {
			return $actionItems.filter((item) => item.id !== record.id);
		});
	} else {
		actionItems.update(($actionItems) => {
			const index = $actionItems.findIndex((item) => item.id === record.id);
			if (index < 0) {
				$actionItems.push(record);
			} else {
				$actionItems[index] = record;
			}
			$actionItems.sort(sortActionItems);
			return $actionItems;
		});
	}
}
