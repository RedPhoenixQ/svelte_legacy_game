<script lang="ts">
	import { page } from '$app/stores';
	import type { UsersResponse } from '$lib/schema';
	import { trpc } from '$lib/trpc/client';
	import { createEventDispatcher } from 'svelte';
	import { Input } from '../ui/input';
	import { Button } from '../ui/button';
	import { Label } from '../ui/label';

	const dispatch = createEventDispatcher<{
		registered: UsersResponse;
	}>();

	async function handleRegister(event: SubmitEvent) {
		const form = event.target as HTMLFormElement;
		const data = new FormData(form);
		const username = data.get('username')?.toString() ?? '';
		const password = data.get('password')?.toString() ?? '';
		const passwordConfirm = data.get('passwordConfirm')?.toString() ?? '';
		// TODO: Handle error. Show message or send event
		const user = await trpc($page).auth.register.mutate({
			username,
			password,
			passwordConfirm
		});
		console.debug('New user', user);
		dispatch('registered', user);
		form.reset();
	}
</script>

<form on:submit|preventDefault={handleRegister} method="post" class="flex items-center gap-2">
	<Label>
		<div class="pb-2">Username</div>
		<Input required type="text" name="username" autocomplete="username" />
	</Label>
	<Label>
		<div class="pb-2">Password</div>
		<Input required type="password" name="password" autocomplete="new-password" />
	</Label>
	<Label>
		<div class="pb-2">Repeat Password</div>
		<Input required type="password" name="passwordConfirm" autocomplete="new-password" />
	</Label>
	<Button type="submit">Register</Button>
</form>
