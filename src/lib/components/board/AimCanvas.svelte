<script lang="ts">
	import { onMount } from 'svelte';
	import { Board } from '$lib/game/board';
	import { initAimBodiesCtx } from '.';

	export let board: Board;
	export let width: number;
	export let height: number;

	const bodies = initAimBodiesCtx(board);

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;

	function draw() {
		console.debug('drawing');
		ctx!.clearRect(0, 0, width, height);
		ctx!.beginPath();
		for (const body of $bodies) {
			body.draw(ctx!);
		}
		ctx!.stroke();
		testCollisions();
	}

	function testCollisions() {
		ctx!.save();
		ctx!.strokeStyle = 'Red';
		ctx!.beginPath();
		for (const body of $bodies) {
			console.group('HIT TEST', body);
			board.checkHitTokens(body, (token, res) => {
				console.log('Collision', token, res.overlap);
				token.draw(ctx!);
			});
			console.groupEnd();
		}
		ctx!.stroke();
		ctx!.restore();
	}

	onMount(() => {
		ctx = canvas.getContext('2d')!;
		if (!ctx) throw new Error('Could not get 2d context');
		ctx.strokeStyle = '#FFF';
		ctx.lineWidth = 2;

		return bodies.subscribe(draw);
	});
</script>

<canvas {width} {height} class="pointer-events-none absolute inset-0 z-30" bind:this={canvas}
></canvas>

<slot />
