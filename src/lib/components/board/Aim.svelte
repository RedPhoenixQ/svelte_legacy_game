<script lang="ts">
	import {
		Box,
		Circle,
		ensureVectorPoint,
		type BodyOptions,
		type PotentialVector,
		type Vector
	} from 'detect-collisions';
	import Movable from './Movable.svelte';
	import { onMount } from 'svelte';
	import type { Board } from '$lib/game/board';
	import { throttled } from '$lib/utils';
	import { Sector } from '$lib/helpers/sector';

	export let board: Board;
	export let width: number;
	export let height: number;
	export let angle = 0;

	// TODO: Replace with game targering types when they are implemented
	// export let centeredOnOrigin: boolean;
	export let origin: PotentialVector;
	export let shape:
		| { type: 'box'; width: number; height: number }
		| { type: 'circle'; radius: number }
		| { type: 'cone'; radius: number; angle: number };
	export let movableOrigin = false;

	$: movableTarget = shape.type !== 'circle';

	let originPos = ensureVectorPoint(origin);
	let targetPos = originPos;

	const opts: BodyOptions = {
		isCentered: true,
		isTrigger: true
	};
	const collider =
		shape.type === 'box'
			? // Width and height is revesed to that box follows the x-axis for angle calculations
				new Box(originPos, shape.height, shape.width, opts)
			: shape.type === 'circle'
				? new Circle(originPos, shape.radius, opts)
				: new Sector(originPos, shape.radius, shape.angle, { ...opts, isCentered: false });
	if (shape.type === 'box') {
		collider.setOffset(ensureVectorPoint({ x: shape.height / 2, y: 0 }));
	}

	$: collider.setAngle(angle);

	function resetTarget() {
		if (!movableTarget) return;
		targetPos = ensureVectorPoint({ x: shape.type === 'box' ? shape.height : shape.radius, y: 0 })
			.rotate(collider.angle)
			.add(collider.pos);
	}

	function moveTo(point: Vector) {
		collider.setPosition(point.x, point.y, true);
		resetTarget();
	}

	function angleTowards(point: Vector) {
		const vec = ensureVectorPoint(point);
		const dir = vec.sub(collider.pos);
		const angle = Math.atan2(dir.y, dir.x);
		collider.setAngle(angle, true);
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		collider.draw(ctx);
		ctx.stroke();
	}

	function testCollisions() {
		console.group('HIT TEST', collider);
		ctx.save();
		ctx.strokeStyle = 'Red';
		ctx.beginPath();
		board.checkOne(collider, (res) => {
			if (res.a.isTrigger && res.b.isTrigger) return;
			if (res.overlap > 0) {
				console.log('Collision', res);
				res.b.draw(ctx);
			}
		});
		ctx.stroke();
		ctx.restore();
		console.groupEnd();
	}

	const slowAngle = throttled((point: Vector) => {
		angleTowards(point);
		draw();
		testCollisions();
	}, 32);
	const slowMove = throttled((point: Vector) => {
		moveTo(ensureVectorPoint(point));
		draw();
		testCollisions();
	}, 32);

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		ctx.strokeStyle = '#FFF';
		ctx.lineWidth = 2;

		board.insert(collider);

		resetTarget();
		draw();

		return () => {
			board.remove(collider);
		};
	});
</script>

{#if movableTarget}
	<Movable
		snapToGrid={false}
		duration={0}
		class="z-40 size-8 rounded-full border-2 border-primary bg-red-700 bg-opacity-75"
		bind:position={targetPos}
		on:move={({ detail }) => {
			slowAngle(detail);
		}}
		on:endMove={({ detail }) => {
			angleTowards(detail);
			draw();
			testCollisions();
		}}
	/>
{/if}
{#if movableOrigin}
	<Movable
		snapToGrid={false}
		duration={0}
		class="z-40 size-8 rounded-full border-2 border-primary bg-green-700 bg-opacity-75"
		bind:position={originPos}
		on:move={({ detail }) => {
			slowMove(detail);
		}}
		on:endMove={({ detail }) => {
			moveTo(detail);
			draw();
			testCollisions();
		}}
	/>
{/if}
<canvas {width} {height} class="pointer-events-none absolute inset-0 z-30" bind:this={canvas}
></canvas>
