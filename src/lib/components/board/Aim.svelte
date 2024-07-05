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
			{ ...opts, isCentered: movableOrigin }
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

	function angleTowards(point: PotentialVector) {
		const vec = ensureVectorPoint(point);
		const dir = vec.sub(mainCollider.pos);
		const angle = Math.atan2(dir.y, dir.x);
		mainCollider.setAngle(angle, true);
		secondayCollider?.setAngle(angle, true);
	}

	function draw() {
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		if (shape.type === 'cone') {
			const halfAngle = shape.angle / 2;
			ctx.moveTo(mainCollider.x, mainCollider.y);
			ctx.arc(
				mainCollider.x,
				mainCollider.y,
				shape.radius,
				mainCollider.angle - halfAngle,
				mainCollider.angle + halfAngle
			);
			ctx.lineTo(mainCollider.x, mainCollider.y);
		} else {
			mainCollider.draw(ctx);
			if (secondayCollider) secondayCollider.draw(ctx);
		}
		ctx.stroke();
	}

	function testCollisions() {
		console.log(
			'HIT TEST',
			board.checkOne(mainCollider, (res) => {
				if (res.a.isTrigger && res.b.isTrigger) return;
				if (res.overlap > 0) {
					if (secondayCollider && !board.checkCollision(secondayCollider, res.b)) {
						// Collision is not inside secondary collider
						return;
					}
					console.log('Collision', res);
				}
			})
		);
	}

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		ctx.strokeStyle = '#FFF';

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
		class="border-red z-40 size-8 rounded-full border-2 bg-red-700"
		bind:position={targetPos}
		on:move={({ detail }) => {
			angleTowards(detail);
			draw();
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
		class="border-red z-40 size-8 rounded-full border-2 bg-green-700"
		bind:position={originPos}
		on:move={({ detail }) => {
			moveTo(detail);
			draw();
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
