<script lang="ts">
	import { Box, Circle, ensureVectorPoint, type Vector } from 'detect-collisions';
	import Movable from './Movable.svelte';
	import { onMount } from 'svelte';
	import type { Board } from '$lib/game/board';
	import { throttled } from '$lib/utils';
	import { Sector } from '$lib/helpers/sector';
	import type { AttackShape } from '.';

	export let board: Board;
	export let width: number;
	export let height: number;
	export let angle = 0;

	// TODO: Replace with game targering types when they are implemented
	// export let centeredOnOrigin: boolean;
	export let origin: Vector;
	export let shape: AttackShape;
	export let movableOrigin = false;

	$: movableTarget = shape.type !== 'circle';

	let targetPos = ensureVectorPoint(origin);

	let collider: Box | Circle | Sector;
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	$: shape, createCollider();

	function createCollider() {
		if (collider) board.remove(collider);
		switch (shape.type) {
			case 'box':
				collider = new Box(origin, shape.height, shape.width, {
					isCentered: true,
					isTrigger: true,
					angle
				});
				collider.setOffset(ensureVectorPoint({ x: shape.height / 2, y: 0 }));
				break;
			case 'circle':
				collider = new Circle(origin, shape.radius, {
					isCentered: true,
					isTrigger: true,
					angle
				});
				break;
			case 'sector':
				collider = new Sector(origin, shape.radius, shape.arc, {
					isTrigger: true,
					angle
				});
				break;
		}
		board.insert(collider);
		resetTarget();
		draw();
	}

	$: {
		collider.setAngle(angle);
		draw();
	}
	$: {
		collider.setPosition(origin.x, origin.y);
		resetTarget();
		draw();
	}

	function resetTarget() {
		if (!movableTarget) return;
		targetPos = ensureVectorPoint({ x: shape.type === 'box' ? shape.height : shape.radius, y: 0 })
			.rotate(collider.angle)
			.add(collider.pos);
	}

	function angleTowards(point: Vector) {
		const vec = ensureVectorPoint(point);
		const dir = vec.sub(collider.pos);
		const angle = Math.atan2(dir.y, dir.x);
		collider.setAngle(angle);
	}

	function draw() {
		if (!ctx) return;
		ctx.clearRect(0, 0, width, height);
		ctx.beginPath();
		collider.draw(ctx);
		ctx.stroke();
		testCollisions();
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

	function onTarget(point: Vector) {
		angleTowards(point);
		draw();
	}
	function onMove() {
		resetTarget();
		collider.updateBody();
		draw();
	}
	const onTargetSlow = throttled(onTarget, 32);
	const onMoveSlow = throttled(onMove, 32);

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	onMount(() => {
		ctx = canvas.getContext('2d')!;
		ctx.strokeStyle = '#FFF';
		ctx.lineWidth = 2;

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
		position={targetPos}
		preventRotate
		on:move={({ detail }) => onTargetSlow(detail)}
		on:endMove={({ detail }) => onTarget(detail)}
	/>
{/if}
{#if movableOrigin}
	<Movable
		snapToGrid={false}
		duration={0}
		class="z-40 size-8 rounded-full border-2 border-primary bg-green-700 bg-opacity-75"
		preventRotate
		bind:position={collider.pos}
		on:move={onMoveSlow}
		on:endMove={onMove}
	/>
{/if}
<canvas {width} {height} class="pointer-events-none absolute inset-0 z-30" bind:this={canvas}
></canvas>
