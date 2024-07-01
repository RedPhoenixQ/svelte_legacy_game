<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import Board from './Board.svelte';
	import { initStores, deinitStores, game, board, tokens } from './stores';
	import * as Resizable from '$lib/components/ui/resizable';

	export let data;
	$: console.debug('page data', data);
	$: initStores(data);

	onMount(() => {
		return () => {
			deinitStores();
		};
	});
</script>

<main class="grid h-screen max-h-screen">
	<Resizable.PaneGroup direction="horizontal">
		<Resizable.Pane defaultSize={3}>
			{#if $board}
				<Board board={$board} bind:tokens={$tokens} />
			{:else}
				No board active
			{/if}
		</Resizable.Pane>
		<Resizable.Handle />
		<Resizable.Pane
			defaultSize={1}
			class="grid grid-rows-2"
			style="grid-template-rows: auto minmax(0, 1fr);"
		>
			<RollDice />
			<Chat game_id={$page.params.game_id} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
