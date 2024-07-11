<script lang="ts">
	import { page } from '$app/stores';
	import type { DiceRollsResponse } from '$lib/schema';
	import { trpc } from '$lib/trpc/client';

	async function roll() {
		lastRoll = await trpc($page).dice.roll.mutate({
			game: $page.params.gameId,
			sides
		});
	}

	let lastRoll: DiceRollsResponse | undefined;

	let sides = 20;
</script>

<div>
	{#if lastRoll}
		<div>
			{lastRoll.sides} rolled <b>{lastRoll.roll}</b>
		</div>
	{/if}
	<input type="number" bind:value={sides} />
	<button on:click={roll}>Roll</button>
</div>
