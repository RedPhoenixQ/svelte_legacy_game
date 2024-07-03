<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import Board from '../../lib/components/board/Board.svelte';
	import ActionList from './ActionList.svelte';
	import ActionButtons from './ActionButtons.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import { createGameStores } from '$lib/game';

	export let data;
	$: console.debug('page data', data);
	const { game, characters, board, tokens, actionItems, isDm, init, deinit } =
		createGameStores(data);

	$: console.debug('Game', $game);
	$: console.debug('Characters', $characters);
	$: console.debug('Board', $board);
	$: console.debug('Tokens', $tokens);
	$: console.debug('ActionItems', $actionItems);

	onMount(() => {
		init().catch(console.error);
		return () => {
			deinit().catch(console.error);
			// deinitStores();
		};
	});
</script>

<svelte:head>
	<title>{$game.name}</title>
</svelte:head>

<main class="grid h-screen max-h-screen">
	<Resizable.PaneGroup direction="horizontal" autoSaveId="gameMainLayout">
		<Resizable.Pane collapsible defaultSize={25} minSize={10}>
			<Resizable.PaneGroup direction="vertical" autoSaveId="gameLeftLayout">
				<Resizable.Pane defaultSize={60}>
					{#if $board}
						<ActionList actionItems={$actionItems} characters={$characters} />
					{/if}
				</Resizable.Pane>
				<Resizable.Handle withHandle />
				<Resizable.Pane collapsible defaultSize={40} minSize={20}>
					<ActionButtons />
				</Resizable.Pane>
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
