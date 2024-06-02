<script lang="ts">
	import { page } from '$app/stores';
	import type { DiceRollResponse } from '$lib/schema';
	import { trpc } from '$lib/trpc/client';

	async function roll() {
		last_roll = await trpc($page).dice.roll.mutate({
			game: $page.params.game_id,
			sides
		});
	}

	let last_roll: DiceRollResponse | undefined;

	let sides = 20;
</script>

<div>
	{#if last_roll}
		<div>
			{last_roll.sides} rolled <b>{last_roll.roll}</b>
		</div>
	{/if}
	<input type="number" bind:value={sides} />
	<button on:click={roll}>Roll</button>
</div>
