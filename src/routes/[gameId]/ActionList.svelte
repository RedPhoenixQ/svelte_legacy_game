<script lang="ts">
	import { flip } from 'svelte/animate';
	import { expoInOut } from 'svelte/easing';
	import TokenImg from '$lib/components/board/TokenImg.svelte';
	import type { ActionItems } from '$lib/game/actionItem';
	import type { CharactersMap } from '$lib/game/character';

	export let actionItems: ActionItems;
	export let characters: CharactersMap;
</script>

<ol>
	{#each actionItems.items as item (item.id)}
		{@const character = item.character && characters.get(item.character)}

		<li class="flex justify-between px-2" animate:flip={{ duration: 1000, easing: expoInOut }}>
			<button
				on:click={() => {
					item.actionValue--;
					actionItems = actionItems;
				}}>-</button
			>
			{#if character}
				<TokenImg {character} class="size-16" />
			{:else}
				<span>
					{item.tempName}:
				</span>
			{/if}
			{item.actionValue}
			<button
				on:click={() => {
					item.actionValue++;
					actionItems = actionItems;
				}}>+</button
			>
		</li>
	{/each}
</ol>
