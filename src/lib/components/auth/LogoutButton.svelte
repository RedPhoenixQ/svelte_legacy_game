<script lang="ts">
	import { page } from '$app/stores';
	import { pb } from '$lib/pb';
	import { trpc } from '$lib/trpc/client';
	import { Button, type ButtonProps } from '../ui/button';

	type $$Props = ButtonProps;

	async function logout() {
		// TODO: Handle error. Show message or send event
		await trpc($page).auth.logout.mutate();
		pb.authStore.clear();
		console.log('Logged out successfully');
	}
</script>

<Button on:click={logout} {...$$restProps}>
	<slot>Logout</slot>
</Button>
