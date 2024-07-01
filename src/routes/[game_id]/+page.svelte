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
	<Resizable.PaneGroup direction="horizontal" autoSaveId="gameMainLayout">
		<Resizable.Pane collapsible defaultSize={25} minSize={10}>
			<Resizable.PaneGroup direction="vertical" autoSaveId="gameLeftLayout">
				<Resizable.Pane defaultSize={60}>Turn order</Resizable.Pane>
				<Resizable.Handle withHandle />
				<Resizable.Pane collapsible defaultSize={40} minSize={20}>Actions</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={50}>
			{#if $board}
				<Board board={$board} bind:tokens={$tokens} />
			{:else}
				No board active
			{/if}
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane
			collapsible
			defaultSize={25}
			minSize={10}
			class="grid grid-rows-2"
			style="grid-template-rows: auto minmax(0, 1fr);"
		>
			<RollDice />
			<Chat game_id={$page.params.game_id} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
