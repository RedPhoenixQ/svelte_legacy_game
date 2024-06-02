<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { getPanZoomCtx, pageToBoard, type XYPos } from '.';

	let className: string = '';
	export { className as class };
	export let x: number;
	export let y: number;

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

	function reset() {
		hasClicked = false;
		moving = false;
		canceled = false;
	}

	function handlePointerDown(event: PointerEvent) {
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
			const pos: XYPos = {
				x: event.pageX,
				y: event.pageY
			};
			dispatch('endMove', pos);
		}
		reset();
	}
	function handlePointerMove(event: PointerEvent) {
		if (!hasClicked) return;
		console.debug(event);

		clearTimeout(longPressTimeout);

		const transform = $panzoom.instance.getTransform();

		x += (event.pageX - prevPos.x) / transform.scale;
		y += (event.pageY - prevPos.y) / transform.scale;

		prevPos.x = event.pageX;
		prevPos.y = event.pageY;

		if (!moving) {
			moving = true;
			dispatch('startMove', { x, y });
		}
		dispatch('move', { x, y });
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
	class="absolute {className}"
	style:top="{y}px"
	style:left="{x}px"
	on:pointerdown={handlePointerDown}
	{...$$restProps}
>
	<slot />
</div>