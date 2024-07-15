<script lang="ts">
	import { distance, ensureVectorPoint, type Body, type Vector } from 'detect-collisions';
	import Movable from './Movable.svelte';
	import { onMount } from 'svelte';
	import { throttled } from '$lib/utils';
	import { getAimBodiesCtx } from '.';
	import { createBodyFromShape, type AttackShape } from '$lib/helpers/targeting';

	// TODO: Replace with game targering types when they are implemented
	// export let centeredOnOrigin: boolean;
	export let originX: number;
	export let originY: number;
	export let position: Vector;
	export let angle = 0;
	export let shape: AttackShape;
	export let range = Infinity;
	export let movableOrigin = false;

	const bodies = getAimBodiesCtx();

	$: movableTarget = shape.type !== 'circle';

	const origin = ensureVectorPoint({ x: originX, y: originY });
	$: {
		origin.x = originX;
		origin.y = originY;
	}

	let targetPos = ensureVectorPoint(position);

	let collider: Body;
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	$: shape, createCollider();

	function createCollider() {
		if (collider) bodies.remove(collider);
		collider = createBodyFromShape(shape, position, { angle });
		bodies.add(collider);
		resetTarget();
	}

	$: {
		collider.setAngle(angle);
		bodies.update();
	}
	$: {
		collider.setPosition(position.x, position.y);
		collider = collider;
		resetTarget();
		bodies.update();
	}

	function resetTarget() {
		if (!movableTarget) return;
		targetPos = ensureVectorPoint({ x: 100, y: 0 }).rotate(collider.angle).add(collider.pos);
	}

	function angleTowards(point: Vector) {
		const vec = ensureVectorPoint(point);
		const dir = vec.sub(collider.pos);
		const angle = Math.atan2(dir.y, dir.x);
		collider.setAngle(angle);
	}

	function onTarget(point: Vector) {
		angleTowards(point);
		bodies.update();
	}
	function onMove(point: Vector) {
		collider.setPosition(point.x, point.y);
		resetTarget();
		bodies.update();
	}
	const onTargetSlow = throttled(onTarget, 32);
	const onMoveSlow = throttled(onMove, 32);

	onMount(() => {
		resetTarget();
		return () => {
			bodies.remove(collider);
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
		limitMovement={(movingTo) => {
			if (distance(origin, movingTo) < range) {
				return movingTo;
			} else {
				movingTo.sub(origin);
				const radians = Math.atan2(movingTo.y, movingTo.x);
				movingTo.x = Math.cos(radians);
				movingTo.y = Math.sin(radians);
				movingTo.scale(range);
				movingTo.add(origin);
				return movingTo;
			}
		}}
		bind:position
		on:move={({ detail }) => onMoveSlow(detail)}
		on:endMove={({ detail }) => onMove(detail)}
	/>
{/if}
