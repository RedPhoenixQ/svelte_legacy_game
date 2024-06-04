<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import Board from './Board.svelte';
	import { initStores, deinitStores, game } from './stores';

	export let data;
	$: console.debug('page data', data);
	$: initStores(data);

	onMount(() => {
		return () => {
			deinitStores();
		};
	});
</script>

<h1>{$game.name}</h1>

<RollDice />

<Board />

<div class="h-screen">
	<Chat game_id={$page.params.game_id} />
</div>
