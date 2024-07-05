<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import Board from '../../lib/components/board/Board.svelte';
	import ActionList from './ActionList.svelte';
	import ActionButtons from './ActionButtons.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import { GameStores } from '$lib/game';

	export let data;
	$: console.debug('page data', data);
	$: stores = new GameStores(data);
	$: ({ game, characters, board, tokens, actionItems, isDm } = stores);

	$: console.debug('game', $game);
	$: console.debug('characters', $characters);
	$: console.debug('board', $board);
	$: console.debug('tokens', $tokens);
	$: console.debug('actionItems', $actionItems);

	onMount(() => {
		stores.init().catch(console.error);
		return () => {
			stores.deinit().catch(console.error);
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
					{#if $board}
						<ActionButtons />
					{/if}
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
			<Chat gameId={$game.id} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</main>
