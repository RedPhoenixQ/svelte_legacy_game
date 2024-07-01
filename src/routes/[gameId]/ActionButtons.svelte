<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';

	async function endTurn() {
		const end = await trpc($page).combat.endTurn.mutate($page.data.game.activeBoard);
	}
</script>

<Button on:click={endTurn}>End Turn</Button>
