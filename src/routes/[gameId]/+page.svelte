<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import Board from '../../lib/components/board/Board.svelte';
	import ActionList from './ActionList.svelte';
	import { initStores, deinitStores, game, board, characters, tokens, isDm } from './stores';
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
				<Resizable.Pane defaultSize={60}>
					<ActionList />
				</Resizable.Pane>
				<Resizable.Handle withHandle />
				<Resizable.Pane collapsible defaultSize={40} minSize={20}>Actions</Resizable.Pane>
			</Resizable.PaneGroup>
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={50}>
			{#if $board}
				<Board board={$board} characters={$characters} moveAll={$isDm} bind:tokens={$tokens} />
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
			<Chat gameId={$page.params.gameId} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
