<script lang="ts">
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { onMount } from 'svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import { GameStores } from '$lib/game';
	import Combat from './Combat.svelte';

	export let data;
	$: console.debug('page data', data);
	$: stores = new GameStores(data, true);
	$: ({ game, characters, board, tokens, actionItems, stats, currentTurn, firstActionItem, isDm } = stores);

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
		<Resizable.Pane defaultSize={75} minSize={20}>
			{#if $board}
				<Combat
					board={$board}
					characters={$characters}
					actionItems={$actionItems}
					currentTurn={$currentTurn}
					firstActionItem={$firstActionItem}
					statsMap={$stats}
					isDm={$isDm}
					tokens={$tokens}
				/>
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
