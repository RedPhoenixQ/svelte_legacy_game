<script lang="ts">
	import ChatFeed from './ChatFeed.svelte';
	import ChatInput from './ChatInput.svelte';

	export let gameId: string;
</script>

<div class="grid" style="grid-template-rows: 1fr auto;">
	<ChatFeed {gameId} />
	<ChatInput {gameId} />
</div>
