<script lang="ts">
	import { Game } from '$lib/game/game';
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';

	export let data;

	const game = new Game(data.game, {...data, tokens: data?.activeBoard?.expand?.["token(board)"], actionItems: data?.activeBoard?.expand?.["actionItem(board)"]});

	onMount(() => {
		game.init(pb).catch(console.error);
		return () => {
			game.cleanup().catch(console.error);
		};
	});
</script>

{$game.name}
