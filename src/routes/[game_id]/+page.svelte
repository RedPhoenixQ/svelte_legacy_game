<script lang="ts">
	import { page } from '$app/stores';
	import PanZoom from '../../lib/components/board/PanZoom.svelte';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import Movable from '$lib/components/board/Movable.svelte';

	export let data;
	$: ({ game } = data);
</script>

<h1>{game.name}</h1>

<RollDice />

<div class="h-screen overflow-hidden bg-blue-400">
	<PanZoom class="bg-gray-400 size-64" bounds={true}>
		<Movable x={20} y={30} class="size-10 bg-red-500">A</Movable>
	</PanZoom>
</div>

<div class="h-screen">
	<Chat game_id={$page.params.game_id} />
</div>
