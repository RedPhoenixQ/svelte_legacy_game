<script lang="ts">
	import { Box, ensureVectorPoint } from 'detect-collisions';
	import { getPanZoomCtx, pageToBoard } from '.';
	import Movable from './Movable.svelte';
	import { onMount } from 'svelte';
	import type { Board } from '$lib/game/board';

	export let board: Board;
	export let width: number;
	export let height: number;

	let targetPos = { x: 10, y: 10 };

	const panzoom = getPanZoomCtx();

	const box = new Box(targetPos, 100, 10);
	box.setOffset(ensureVectorPoint({ x: 0, y: -5 }));
	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 1) return;
		event.preventDefault();
		event.stopPropagation();

		const point = pageToBoard($panzoom, event.pageX, event.pageY);
		box.setPosition(point.x, point.y, true);
		resetTarget();
		draw();
	}

	function resetTarget() {
		if (!box) return;
		targetPos = box.getCentroid().add(box.pos);
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		box.draw(ctx);
		ctx.stroke();
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		ctx.strokeStyle = '#FFF';

		board.insert(box);
		return () => {
			board.remove(box);
		};
	});
</script>

<Movable
	snapToGrid={false}
	class="border-red z-40 size-12 rounded-full border-2 bg-red-700"
	bind:position={targetPos}
	on:move={({ detail }) => {
		if (!box) return;
		const vec = ensureVectorPoint(detail);
		const dir = vec.sub(box.pos);
		const angle = Math.atan2(dir.y, dir.x);
		box.setAngle(angle, true);
		draw();
	}}
	on:endMove={({ detail }) => {
		if (!box) return;
		const vec = ensureVectorPoint(detail);
		const dir = vec.sub(box.pos);
		const angle = Math.atan2(dir.y, dir.x);
		box.setAngle(angle, true);
		draw();
		console.log('HIT TEST', board.checkOne(box), board.response);
	}}
/>
<canvas
	{width}
	{height}
	class="absolute inset-0 z-30"
	bind:this={canvas}
	on:pointerdown={handlePointerDown}
></canvas>
