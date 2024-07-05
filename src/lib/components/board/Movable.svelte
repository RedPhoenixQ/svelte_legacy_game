<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { DEFAULT_GRID_SIZE, DEFAULT_GRID_SIZE_HALF, getPanZoomCtx, type XYPos } from '.';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	let className: string = '';
	export { className as class };
	export let position: XYPos;
	export let snapToGrid = true;
	export let disabled = false;
	export let duration = 500;

	const panzoom = getPanZoomCtx();

	const dispatch = createEventDispatcher<{
		click: PointerEvent;
		longPress: PointerEvent;
		startMove: XYPos;
		move: XYPos;
		endMove: XYPos;
	}>();

	let longPressTimeout: number;
	let hasClicked = false;
	let moving = false;
	let canceled = false;
	let prevPos: XYPos = { x: 0, y: 0 };
	let currentPos: XYPos = { ...position };
	let x = tweened(position.x, { easing: cubicInOut, duration: 0 });
	let y = tweened(position.y, { easing: cubicInOut, duration: 0 });

	$: {
		currentPos = position;
		x.set(position.x, { duration });
		y.set(position.y, { duration });
	}

	function reset() {
		hasClicked = false;
		moving = false;
		canceled = false;
	}

	function handlePointerDown(event: PointerEvent) {
		if (disabled) return;
		event.preventDefault();
		console.debug(event);

		hasClicked = true;
		prevPos.x = event.pageX;
		prevPos.y = event.pageY;

		canceled = !dispatch('click', event, { cancelable: true });

		longPressTimeout = setTimeout(() => {
			dispatch('longPress', event);
			reset();
		}, 500) as unknown as number;

		console.log('canceled', canceled);
	}
	function handlePointerUp(event: PointerEvent) {
		if (!hasClicked) return;
		console.debug(event);

		clearTimeout(longPressTimeout);

		if (moving) {
			if (snapToGrid && !event.shiftKey) {
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

		clearTimeout(longPressTimeout);

		const transform = $panzoom.instance.getTransform();

		currentPos.x += (event.pageX - prevPos.x) / transform.scale;
		currentPos.y += (event.pageY - prevPos.y) / transform.scale;

		$x = currentPos.x;
		$y = currentPos.y;

		prevPos.x = event.pageX;
		prevPos.y = event.pageY;

		if (!moving) {
			moving = true;
			dispatch('startMove', { ...currentPos });
		}
		dispatch('move', { ...currentPos });
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
	class="absolute {className} -translate-x-1/2 -translate-y-1/2"
	style:top="{$y}px"
	style:left="{$x}px"
	style={disabled ? '' : moving ? 'cursor : grabbing;' : 'cursor : grab;'}
	on:pointerdown={handlePointerDown}
	{...$$restProps}
>
	<slot />
</div>
