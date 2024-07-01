<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	export let data;

	$: console.debug('Games page', data);
</script>

<ul>
	{#each data.games as game}
		<li>
			<Button href="/{game.id}">{game.name}</Button>
		</li>
	{/each}
</ul>
