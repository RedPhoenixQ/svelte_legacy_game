<script lang="ts">
	export let data;

	$: console.debug('Games page', data);
</script>

<ul>
	{#each data.games as game}
		<li>
			<a href="/{game.id}">{game.name}</a>
		</li>
	{/each}
</ul>
