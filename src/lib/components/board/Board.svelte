<script lang="ts">
	import { Movable, PanZoom, DEFAULT_GRID_SIZE } from '$lib/components/board';
	import { pb, user } from '$lib/pb';
	import TokenImg from '$lib/components/board/TokenImg.svelte';
	import type { Token, TokenMap } from '$lib/game/token';
	import type { CharactersMap } from '$lib/game/character';
	import type { Board } from '$lib/game/board';
	import { Button } from '$lib/components/ui/button';
	import type { Vector } from 'detect-collisions';
	import { throttled } from '$lib/utils';

	export let board: Board;
	export let tokens: TokenMap;
	export let characters: CharactersMap;
	export let moveAll = false;

	$: gridScaleFactor = DEFAULT_GRID_SIZE / board.gridSize;
	$: width = board.width * gridScaleFactor;
	$: height = board.height * gridScaleFactor;

	let canvas: HTMLCanvasElement;

	let isGrabbing = false;

	const updatePos = throttled((token: Token, pos: Vector) => {
		token.setPosition(pos.x, pos.y, true);
		pb.from('tokens').update(token.id, pos);
	});
	const updateRotation = throttled((token: Token, angle: number) => {
		token.setAngle(angle, true);
		pb.from('tokens').update(token.id, { angle });
	});
</script>

<div class="relative size-full bg-background" style={isGrabbing ? 'cursor : grabbing;' : ''}>
	<Button
		class="absolute left-4 top-4"
		on:click={() => {
			const ctx = canvas.getContext('2d');
			if (!ctx) return console.error('No context');
			ctx.strokeStyle = '#FF2020';
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();
			board.draw(ctx);
			ctx.stroke();
			console.log(board.data);
		}}>Draw</Button
	>
	<PanZoom class="size-max" bounds={true} autocenter={true}>
		<img
			style="-webkit-touch-callout: none;"
			src={pb.getFileUrl(board, board.background)}
			alt="Game Board Background"
			{width}
			{height}
			class="opacity-50"
		/>
		<canvas {width} {height} class="pointer-events-none absolute inset-0 z-30" bind:this={canvas}
		></canvas>
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
				limitMovement={(movingTo) => {
					movingTo.x = Math.max(0, Math.min(movingTo.x, width));
					movingTo.y = Math.max(0, Math.min(movingTo.y, height));
					return movingTo;
				}}
				position={token}
				angle={token.angle}
				disabled={!moveAll && character?.owner !== $user?.id}
				class="size-[50px] bg-red-500"
				on:startMove={() => (isGrabbing = true)}
				on:move={({ detail }) => updatePos(token, detail)}
				on:endMove={({ detail }) => {
					isGrabbing = false;
					updatePos(token, detail);
				}}
				on:rotate={({ detail }) => updateRotation(token, detail)}
				on:endRotate={({ detail }) => updateRotation(token, detail)}
			>
				{#if character}
					<TokenImg {character} />
				{/if}
				<slot name="token" {token} {character} />
			</Movable>
		{/each}

		<slot {width} {height} />
	</PanZoom>
</div>
