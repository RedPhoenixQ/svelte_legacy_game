<script lang="ts">
	import { pb } from '$lib/pb';
	import { createEventDispatcher } from 'svelte';

	export let game_id: string;

	const dispatch = createEventDispatcher<{
		send: string;
	}>();

	async function handleSubmit(event: SubmitEvent) {
		if (!pb.authStore.model?.id) {
			console.log('Unauthenticated users cannot use the chat');
			return;
		}
		const form = event.target as HTMLFormElement;

		pb.from('chat').create({
			game: game_id,
			sender: pb.authStore.model!.id,
			content: value
		});

		form.reset();
	}

	let value = '';
</script>

<form on:submit|preventDefault={handleSubmit}>
	<input type="text" bind:value />
	<button on:click={() => dispatch('send', value)}>Send</button>
</form>
