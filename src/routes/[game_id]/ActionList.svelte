<script lang="ts">
	import { flip } from 'svelte/animate';
	import { expoInOut } from 'svelte/easing';

	let items = [
		{ id: 1, value: 12 },
		{ id: 2, value: 15 },
		{ id: 3, value: 7 },
		{ id: 4, value: 9 }
	];

	$: {
		items.sort((a, b) => a.value - b.value);
		items = items;
	}
</script>

<ol>
	{#each items as item (item.id)}
		<li class="flex justify-between px-2" animate:flip={{ duration: 1000, easing: expoInOut }}>
			<button
				on:click={() => {
					item.value--;
					items = items;
				}}>-</button
			>
			<span>
				{item.id}:
			</span>
			{item.value}
			<button
				on:click={() => {
					item.value++;
					items = items;
				}}>+</button
			>
		</li>
	{/each}
</ol>
