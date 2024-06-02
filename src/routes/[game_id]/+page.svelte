<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';

	export let data;
	$: ({ game } = data);

	$: console.debug('Game', game);
</script>

<h1>{game.name}</h1>

<RollDice />

<div class="h-screen">
	<Chat game_id={$page.params.game_id} />
</div>
