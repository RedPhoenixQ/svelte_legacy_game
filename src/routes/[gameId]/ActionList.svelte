<script lang="ts">
	import { flip } from 'svelte/animate';
	import { cubicInOut } from 'svelte/easing';
	import TokenImg from '$lib/components/board/TokenImg.svelte';
	import type { ActionItems } from '$lib/game/actionItem';
	import type { CharactersMap } from '$lib/game/character';
	import type { TokenMap } from '$lib/game/token';

	export let actionItems: ActionItems;
	export let characters: CharactersMap;
	export let tokens: TokenMap;
</script>

<ol class="p-4">
	{#each actionItems.items as item, i (item.id)}
		{@const token = item.token && tokens.get(item.token)}
		{@const character = token && characters.get(token.character)}
		{@const isFirst = i === 0}

		<li
			class="flex justify-between px-2 bg-background transition-all duration-1000 {isFirst
				? 'mb-4 ring-2 ring-indigo-300 shadow-md shadow-indigo-300 z-10 relative '
				: ''}"
			style:scale={isFirst ? '110%' : ''}
			animate:flip={{ duration: 500, easing: cubicInOut }}
		>
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
