<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import {
		DEFAULT_GRID_SIZE,
		DEFAULT_GRID_SIZE_HALF,
		getPanZoomCtx,
		ONE_AND_A_HALF_PI,
		pageToBoard,
		ROTATION_SPAN_STEP,
		type XYPos
	} from '.';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { rad2deg } from 'detect-collisions';

	let className: string = '';
	export { className as class };
	export let position: XYPos;
	export let angle = 0;
	export let snapToGrid = true;
	export let disabled = false;
	export let preventRotate = false;
	export let duration = 500;

	const panzoom = getPanZoomCtx();

	const dispatch = createEventDispatcher<{
		click: PointerEvent;
		longPress: PointerEvent;
		startMove: XYPos;
		move: XYPos;
		endMove: XYPos;
		rotate: number;
		endRotate: number;
	}>();

	let longPressTimeout: ReturnType<typeof setTimeout>;
	let hasClicked = false;
	let moving = false;
	let rotating = false;
	let canceled = false;
	let prevPos: XYPos = { x: 0, y: 0 };
	let rotateCurrentPos: XYPos = { x: 0, y: 0 };
	let currentPos: XYPos = { ...position };
	let x = tweened(position.x, { easing: cubicInOut, duration: 0 });
	let y = tweened(position.y, { easing: cubicInOut, duration: 0 });
	let deg = rad2deg(angle);

	$: if (!moving) {
		currentPos = position;
		x.set(position.x, { duration });
		y.set(position.y, { duration });
	}
	$: if (!rotating) deg = rad2deg(angle);

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
		console.debug(event);

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

			$x = currentPos.x;
			$y = currentPos.y;

			dispatch('endMove', { ...currentPos });
		}
		reset();
	}
	function handlePointerMove(event: PointerEvent) {
		if (!hasClicked) return;
		console.debug(event);

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

			currentPos.x += (event.pageX - prevPos.x) / transform.scale;
			currentPos.y += (event.pageY - prevPos.y) / transform.scale;

			$x = currentPos.x;
			$y = currentPos.y;

			if (!moving) {
				moving = true;
				dispatch('startMove', { ...currentPos });
			}
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
