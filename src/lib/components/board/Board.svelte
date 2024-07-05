<script lang="ts">
	import { Movable, PanZoom, DEFAULT_GRID_SIZE } from '$lib/components/board';
	import { pb, user } from '$lib/pb';
	import TokenImg from '$lib/components/board/TokenImg.svelte';
	import type { TokenMap } from '$lib/game/token';
	import type { CharactersMap } from '$lib/game/character';
	import type { Board } from '$lib/game/board';

	export let board: Board;
	export let tokens: TokenMap;
	export let characters: CharactersMap;
	export let moveAll = false;

	$: gridScaleFactor = DEFAULT_GRID_SIZE / board.gridSize;

	let isGrabbing = false;
</script>

<div class="size-full bg-background" style={isGrabbing ? 'cursor : grabbing;' : ''}>
	<PanZoom class="size-max" bounds={true} autocenter={true}>
		<img
			src={pb.getFileUrl(board, board.background)}
			alt="Game Board Background"
			width={board.width * gridScaleFactor}
			height={board.height * gridScaleFactor}
			class="opacity-50"
		/>
		<!-- <div
			class="absolute inset-0"
			style="background-size: 50px 50px;
  background-image:
    linear-gradient(to right, white 1px, transparent 1px),
    linear-gradient(to bottom, white 1px, transparent 1px);"
		></div> -->
		{#each tokens as [id, token] (id)}
			{@const character = characters.get(token.character)}
			<Movable
				position={token}
				disabled={!moveAll && character?.owner !== $user?.id}
				class="size-[50px] bg-red-500"
				on:startMove={() => (isGrabbing = true)}
				on:endMove={(event) => {
					isGrabbing = false;
					pb.from('token').update(token.id, event.detail);
				}}
			>
				{#if character}
					<TokenImg {character} />
				{/if}
			</Movable>
		{/each}
	</PanZoom>
</div>
