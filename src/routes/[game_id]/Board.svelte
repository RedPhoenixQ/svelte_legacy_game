<script lang="ts">
	import Movable from '$lib/components/board/Movable.svelte';
	import PanZoom from '$lib/components/board/PanZoom.svelte';
	import { pb, user } from '$lib/pb';
	import { characters, tokens, isDm } from './stores';

	let isGrabbing = false;
</script>

<div class="h-screen overflow-hidden bg-blue-400" style={isGrabbing ? 'cursor : grabbing;' : ''}>
	<PanZoom class="size-64 bg-gray-400" bounds={true} autocenter={true}>
		{#each $tokens as [id, token] (id)}
			{@const character = $characters.get(token.character)}
			<Movable
				x={token.x}
				y={token.y}
				disabled={!$isDm && character?.owner !== $user?.id}
				class="size-10 bg-red-500"
				on:startMove={() => (isGrabbing = true)}
				on:endMove={(event) => {
					isGrabbing = false;
					pb.from('token').update(token.id, event.detail);
				}}
			>
				{token.id}
			</Movable>
		{/each}
	</PanZoom>
</div>
