<script lang="ts">
	import type { UsersResponse } from '$lib/schema';
	import ChatFeed from './ChatFeed.svelte';
	import ChatInput from './ChatInput.svelte';

	export let gameId: string;
	export let users: Map<string, UsersResponse>;
</script>

<div class="grid" style="grid-template-rows: 1fr auto;">
	<ChatFeed {gameId} {users} />
	<ChatInput {gameId} />
</div>
