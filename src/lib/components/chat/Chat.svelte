<script lang="ts">
	import ChatFeed from './ChatFeed.svelte';
	import ChatInput from './ChatInput.svelte';

	export let game_id: string;
</script>

<div class="grid" style="grid-template-rows: 1fr auto;">
	<ChatFeed {game_id} />
	<ChatInput {game_id} />
</div>
