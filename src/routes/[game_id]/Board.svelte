<script lang="ts">
	import { browser } from '$app/environment';
	import Movable from '$lib/components/board/Movable.svelte';
	import PanZoom from '$lib/components/board/PanZoom.svelte';
	import { pb, user } from '$lib/pb';
	import type {
		BoardResponse,
		CharactersResponse,
		GamesResponse,
		TokenResponse
	} from '$lib/schema';
	import type { UnsubscribeFunc } from 'pocketbase';

	export let game: GamesResponse;
	export let characters: CharactersResponse[];
	export let isDm: boolean;

	let board: BoardResponse | undefined;
	let tokens: TokenResponse[] = [];

	let unsubs: UnsubscribeFunc[] = [];
	async function attachBoard(board_id: string) {
		if (game.active_board === board?.id) return;
		for (const unsub of unsubs) {
			unsub();
		}
		unsubs = [];
		if (!game.active_board) {
			board = undefined;
			tokens = [];
			return;
		}

		const new_board = await pb.from('board').getOne(board_id, {
			select: {
				expand: {
					'token(board)': true
				}
			}
		});
		tokens = new_board.expand?.['token(board)'] ?? [];
		delete new_board.expand;
		board = new_board;

		const board_unsub = pb.from('board').subscribe(board_id, ({ action, record }) => {
			console.debug('Board sub', action, record);
			switch (action) {
				case 'update':
					board = record;
					break;
				default:
					throw new Error(`Board cannot handle action ${action}`, {
						cause: {
							action,
							record
						}
					});
			}
		});
		const token_unsub = pb.from('token').subscribe(
			'*',
			({ action, record }) => {
				console.debug('Token sub', action, record);
				switch (action) {
					case 'update': {
						const index = tokens.findIndex((t) => t.id === record.id);
						if (index >= 0) {
							tokens[index] = record;
						} else {
							tokens = [...tokens, record];
						}
						break;
					}
					case 'create':
						tokens = [...tokens, record];
						break;
					case 'delete':
						tokens = tokens.filter((t) => t.id !== record.id);
						break;
				}
			},
			{
				query: {
					filter: `board.game.id = '${game.id}'`
				}
			}
		);

		unsubs = await Promise.all([board_unsub, token_unsub]);
	}

	$: if (browser) attachBoard(game.active_board);

	let isGrabbing = false;
</script>

<div class="h-screen overflow-hidden bg-blue-400" style={isGrabbing ? 'cursor : grabbing;' : ''}>
	<PanZoom class="size-64 bg-gray-400" bounds={true} autocenter={true}>
		{#each tokens as token}
			{@const character =
				!isDm && token.character
					? characters.find((char) => char.id === token.character)
					: undefined}
			<Movable
				x={token.x}
				y={token.y}
				disabled={!isDm && character?.owner !== $user?.id}
				class="size-10 bg-red-500"
				on:startMove={() => (isGrabbing = true)}
				on:endMove={(event) => {
					isGrabbing = false;
					pb.from('token').update(token.id, event.detail);
				}}>{token.id}</Movable
			>
		{/each}
	</PanZoom>
</div>
