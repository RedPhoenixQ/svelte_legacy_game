<script lang="ts">
	import { page } from '$app/stores';
	import { pb } from '$lib/pb';
	import { trpc } from '$lib/trpc/client';
	import { createEventDispatcher } from 'svelte';
	import { Input } from '../ui/input';
	import { Button } from '../ui/button';
	import { Label } from '../ui/label';

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

<form on:submit|preventDefault={handleLogin} method="post" class="flex items-center gap-2">
	<Label>
		<div class="pb-2">Username</div>
		<Input required type="text" name="username" autocomplete="username" />
	</Label>
	<Label>
		<div class="pb-2">Password</div>
		<Input required type="password" name="password" autocomplete="current-password" />
	</Label>
	<Button type="submit">Login</Button>
</form>
