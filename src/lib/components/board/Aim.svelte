<script lang="ts">
	import {
		Box,
		Circle,
		ensureVectorPoint,
		Polygon,
		type BodyOptions,
		type PotentialVector,
		type Vector
	} from 'detect-collisions';
	import Movable from './Movable.svelte';
	import { onMount } from 'svelte';
	import type { Board } from '$lib/game/board';
	import { throttled } from '$lib/utils';

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
	const mainCollider =
		shape.type === 'box'
			? // Width and height is revesed to that box follows the x-axis for angle calculations
				new Box(originPos, shape.height, shape.width, opts)
			: new Circle(originPos, shape.radius, opts);
	if (shape.type === 'box') {
		mainCollider.setOffset(ensureVectorPoint({ x: shape.height / 2, y: 0 }));
	}
	let secondayCollider: Polygon | undefined = undefined;
	if (shape.type === 'cone') {
		const extendedRadius = shape.radius * 1.2;
		const halfAngle = shape.angle / 2;
		const pi2HalfAngle = Math.PI * 2 - halfAngle;
		const left = {
			x: extendedRadius * Math.cos(halfAngle),
			y: extendedRadius * Math.sin(halfAngle)
		};
		const right = {
			x: extendedRadius * Math.cos(pi2HalfAngle),
			y: extendedRadius * Math.sin(pi2HalfAngle)
		};
		secondayCollider = new Polygon(
			originPos,
			[
				{ x: 0, y: 0 },
				left,
				{ x: extendedRadius, y: left.y },
				{ x: extendedRadius, y: right.y },
				right
			],
			{ ...opts, isCentered: false }
		);
	}

	$: {
		mainCollider.setAngle(angle);
		secondayCollider?.setAngle?.(angle);
	}

	function resetTarget() {
		if (!movableTarget) return;
		targetPos = ensureVectorPoint({ x: shape.type === 'box' ? shape.height : shape.radius, y: 0 })
			.rotate(mainCollider.angle)
			.add(mainCollider.pos);
	}

	function moveTo(point: Vector) {
		mainCollider.setPosition(point.x, point.y, true);
		secondayCollider?.setPosition(point.x, point.y, true);
		resetTarget();
	}

	function angleTowards(point: Vector) {
		const vec = ensureVectorPoint(point);
		const dir = vec.sub(mainCollider.pos);
		const angle = Math.atan2(dir.y, dir.x);
		mainCollider.setAngle(angle, true);
		secondayCollider?.setAngle(angle, true);
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		if (shape.type === 'cone') {
			const halfAngle = shape.angle / 2;
			ctx.save();
			ctx.setLineDash([2, 4]);
			ctx.beginPath();

			ctx.moveTo(mainCollider.x, mainCollider.y);
			ctx.arc(
				mainCollider.x,
				mainCollider.y,
				shape.radius,
				mainCollider.angle - halfAngle,
				mainCollider.angle + halfAngle
			);
			ctx.lineTo(mainCollider.x, mainCollider.y);

			ctx.stroke();
			ctx.restore();
		} else {
			ctx.beginPath();
			mainCollider.draw(ctx);
			if (secondayCollider) secondayCollider.draw(ctx);
			ctx.stroke();
		}
	}

	function testCollisions() {
		console.group('HIT TEST', mainCollider, secondayCollider);
		ctx.save();
		ctx.strokeStyle = 'Red';
		ctx.beginPath();
		board.checkOne(mainCollider, (res) => {
			if (res.a.isTrigger && res.b.isTrigger) return;
			if (res.overlap > 0) {
				if (secondayCollider && !board.checkCollision(secondayCollider, res.b)) {
					// Collision is not inside secondary collider
					return;
				}
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

		board.insert(mainCollider);
		if (secondayCollider) board.insert(secondayCollider);

		resetTarget();
		draw();

		return () => {
			board.remove(mainCollider);
			if (secondayCollider) board.remove(secondayCollider);
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
