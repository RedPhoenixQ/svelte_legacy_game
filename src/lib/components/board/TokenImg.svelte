<script lang="ts">
	import { pb } from '$lib/pb';
	import type { CharactersResponse } from '$lib/schema';

	export let character: CharactersResponse;

	$: src = character.token
		? pb.getFileUrl(character, character.token)
		: pb.getFileUrl(character, character.art, { thumb: '100x100' });
</script>

<img
	style="-webkit-touch-callout: none;"
	{src}
	alt={character.name}
	width="100"
	height="100"
	{...$$restProps}
/>
