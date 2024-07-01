<script lang="ts">
	import { Movable, PanZoom, DEFAULT_GRID_SIZE } from '$lib/components/board';
	import { pb, user } from '$lib/pb';
	import { characters, isDm } from './stores';
	import type { BoardResponse, TokenResponse } from '$lib/schema';

	export let board: BoardResponse;
	export let tokens: Map<string, TokenResponse>;

	$: gridScaleFactor = DEFAULT_GRID_SIZE / board.gridSize;

	let isGrabbing = false;
</script>

<div class="h-screen overflow-hidden bg-background" style={isGrabbing ? 'cursor : grabbing;' : ''}>
	<PanZoom class="size-max" bounds={true} autocenter={true}>
		<img
			src={pb.getFileUrl(board, board.background)}
			alt="Game Board Background"
			width={board.width * gridScaleFactor}
			height={board.height * gridScaleFactor}
			class="opacity-50"
		/>
		{#each tokens as [id, token] (id)}
			{@const character = $characters.get(token.character)}
			<Movable
				x={token.x}
				y={token.y}
				disabled={!$isDm && character?.owner !== $user?.id}
				class="size-[50px] bg-red-500"
				on:startMove={() => (isGrabbing = true)}
				on:endMove={(event) => {
					isGrabbing = false;
					pb.from('token').update(token.id, event.detail);
				}}
			>
				{token.id}
			</Movable>
		{/each}
	</PanZoom>
</div>
