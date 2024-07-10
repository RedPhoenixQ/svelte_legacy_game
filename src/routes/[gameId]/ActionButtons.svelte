<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';

	async function endTurn() {
		const res = await trpc($page).combat.endTurn.mutate();
		console.log('endTurn response', res);
	}
</script>

<Button on:click={endTurn}>End Turn</Button>
