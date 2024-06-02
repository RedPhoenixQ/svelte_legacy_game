<script lang="ts">
	import { page } from '$app/stores';
	import { pb } from '$lib/pb';
	import { trpc } from '$lib/trpc/client';

	async function logout() {
		// TODO: Handle error. Show message or send event
		await trpc($page).auth.logout.mutate();
		pb.authStore.clear();
		console.log('Logged out successfully');
	}
</script>

<button on:click={logout} type="button">
	<slot>Logout</slot>
</button>
