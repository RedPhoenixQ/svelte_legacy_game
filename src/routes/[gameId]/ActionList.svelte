<script lang="ts">
	import { flip } from 'svelte/animate';
	import { expoInOut } from 'svelte/easing';
	import { actionItems, sortActionItems } from './stores/board';

	$: {
		$actionItems.sort(sortActionItems);
		$actionItems = $actionItems;
	}
</script>

<ol>
	{#each $actionItems as item (item.id)}
		<li class="flex justify-between px-2" animate:flip={{ duration: 1000, easing: expoInOut }}>
			<button
				on:click={() => {
					item.actionValue--;
					$actionItems = $actionItems;
				}}>-</button
			>
			<span>
				{item.tempName}:
			</span>
			{item.actionValue}
			<button
				on:click={() => {
					item.actionValue++;
					$actionItems = $actionItems;
				}}>+</button
			>
		</li>
	{/each}
</ol>
