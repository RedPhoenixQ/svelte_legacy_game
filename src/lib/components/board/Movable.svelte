<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		DEFAULT_GRID_SIZE,
		DEFAULT_GRID_SIZE_HALF,
		getPanZoomCtx,
		ONE_AND_A_HALF_PI,
		pageToBoard,
		ROTATION_SPAN_STEP
	} from '.';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { rad2deg, type Vector, ensureVectorPoint, type SATVector } from 'detect-collisions';

	let className: string = '';
	export { className as class };
	export let position: Vector;
	export let angle = 0;
	export let snapToGrid = true;
	export let disabled = false;
	export let preventRotate = false;
	export let duration = 500;
	/**This callback can modify the positition that the Movable will move to*/
	export let limitMovement: (movingTo: SATVector) => void = (movingTo) => movingTo;

	const panzoom = getPanZoomCtx();

	const dispatch = createEventDispatcher<{
		click: PointerEvent;
		longPress: PointerEvent;
		startMove: Vector;
		move: Vector;
		endMove: Vector;
		rotate: number;
		endRotate: number;
	}>();

	let longPressTimeout: ReturnType<typeof setTimeout>;
	let hasClicked = false;
	let moving = false;
	let rotating = false;
	let canceled = false;
	let prevPos: Vector = { x: 0, y: 0 };
	let rotateCurrentPos: Vector = { x: 0, y: 0 };
	let mousePos: Vector = { x: position.x, y: position.y };
	let limitedPos: SATVector = ensureVectorPoint(position);
	// NOTE: currentPos should never references the position object. This would cause drift when moving and position being changed from the outside
	let currentPos: Vector = { x: position.x, y: position.y };
	let x = tweened(position.x, { easing: cubicInOut, duration: 0 });
	let y = tweened(position.y, { easing: cubicInOut, duration: 0 });
	let deg = rad2deg(angle);

	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	$: position, updatePosition();
	$: if (!rotating) deg = rad2deg(angle);

	function updatePosition() {
		if (!moving) {
			currentPos.x = position.x;
			currentPos.y = position.y;
			x.set(position.x, { duration });
			y.set(position.y, { duration });
		}
	}

	function reset() {
		hasClicked = false;
		moving = false;
		rotating = false;
		canceled = false;
	}

	function handlePointerDown(event: PointerEvent) {
		if (disabled) return;
		event.stopPropagation();
		event.preventDefault();
		console.debug(event);

		hasClicked = true;
		prevPos.x = event.pageX;
		prevPos.y = event.pageY;

		canceled = !dispatch('click', event, { cancelable: true });

		longPressTimeout = setTimeout(() => {
			dispatch('longPress', event);
			reset();
		}, 500);

		console.log('canceled', canceled);
	}
	function handleRotatePointerDown(event: PointerEvent) {
		if (disabled || preventRotate) return;
		event.stopPropagation();
		event.preventDefault();

		hasClicked = true;
		rotating = true;
		prevPos.x = event.pageX;
		prevPos.y = event.pageY;
		rotateCurrentPos = pageToBoard($panzoom, event.pageX, event.pageY);
	}
	function handlePointerUp(event: PointerEvent) {
		if (!hasClicked) return;

		clearTimeout(longPressTimeout);
		if (rotating) {
			if (snapToGrid && event.shiftKey) {
				angle = Math.round(angle / ROTATION_SPAN_STEP) * ROTATION_SPAN_STEP;
				deg = rad2deg(angle);
			}
			dispatch('endRotate', angle);
		} else if (moving) {
			if (snapToGrid && event.shiftKey) {
				// Snap to grid
				currentPos.x =
					DEFAULT_GRID_SIZE_HALF +
					Math.round((currentPos.x - DEFAULT_GRID_SIZE_HALF) / DEFAULT_GRID_SIZE) *
						DEFAULT_GRID_SIZE;
				currentPos.y =
					DEFAULT_GRID_SIZE_HALF +
					Math.round((currentPos.y - DEFAULT_GRID_SIZE_HALF) / DEFAULT_GRID_SIZE) *
						DEFAULT_GRID_SIZE;
			}

			limitedPos.x = currentPos.x;
			limitedPos.y = currentPos.y;
			limitMovement(limitedPos);
			currentPos.x = limitedPos.x;
			currentPos.y = limitedPos.y;

			$x = currentPos.x;
			$y = currentPos.y;

			dispatch('endMove', { ...currentPos });
		}
		reset();
	}
	function handlePointerMove(event: PointerEvent) {
		if (!hasClicked) return;

		const transform = $panzoom.instance.getTransform();

		if (rotating) {
			rotateCurrentPos.x += (event.pageX - prevPos.x) / transform.scale;
			rotateCurrentPos.y += (event.pageY - prevPos.y) / transform.scale;

			angle =
				Math.atan2(currentPos.y - rotateCurrentPos.y, currentPos.x - rotateCurrentPos.x) +
				ONE_AND_A_HALF_PI;
			deg = rad2deg(angle);
			dispatch('rotate', angle);
		} else {
			clearTimeout(longPressTimeout);

			if (!moving) {
				moving = true;
				mousePos.x = currentPos.x;
				mousePos.y = currentPos.y;
				dispatch('startMove', { ...currentPos });
			}

			mousePos.x += (event.pageX - prevPos.x) / transform.scale;
			mousePos.y += (event.pageY - prevPos.y) / transform.scale;
			limitedPos.x = mousePos.x;
			limitedPos.y = mousePos.y;
			limitMovement(limitedPos);
			currentPos.x = limitedPos.x;
			currentPos.y = limitedPos.y;
			$x = currentPos.x;
			$y = currentPos.y;
			dispatch('move', { ...currentPos });
		}

		prevPos.x = event.pageX;
		prevPos.y = event.pageY;
	}
	function handlePointerCancel(event: PointerEvent) {
		if (!hasClicked) return;
		console.debug(event);
		reset();
	}
</script>

<svelte:window
	on:pointerup={handlePointerUp}
	on:pointermove={handlePointerMove}
	on:pointercancel={handlePointerCancel}
/>

<div
	class="absolute {className} -translate-x-1/2 -translate-y-1/2 origin-top-left touch-none"
	style:top="{$y}px"
	style:left="{$x}px"
	style:rotate="{deg}deg"
	style:cursor={disabled ? '' : moving ? 'grabbing' : 'grab'}
	on:pointerdown={handlePointerDown}
	on:touchstart={(event) => event.stopPropagation()}
	{...$$restProps}
>
	{#if !preventRotate}
		<div
			class="absolute -top-8 left-0 right-0 m-auto"
			on:pointerdown={handleRotatePointerDown}
			on:touchstart={(event) => event.stopPropagation()}
		>
			Handle
		</div>
	{/if}
	<slot />
</div>
