<script lang="ts">
	import { page } from '$app/stores';
	import { pb } from '$lib/pb';
	import { trpc } from '$lib/trpc/client';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		login: undefined;
	}>();

	async function handleLogin(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);
		const username = data.get('username')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		// TODO: Handle error. Show message or send event
		const auth = await trpc($page).auth.login.mutate({
			username,
			password
		});
		pb.authStore.save(auth.token, auth.record);
		console.debug('AuthStore after login', pb.authStore);
		dispatch('login');
		form.reset();
	}
</script>

<form on:submit|preventDefault={handleLogin} method="post">
	<input required type="text" name="username" autocomplete="username" />
	<input required type="password" name="password" autocomplete="current-password" />
	<button type="submit">Login</button>
</form>
