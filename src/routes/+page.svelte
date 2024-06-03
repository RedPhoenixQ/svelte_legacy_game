<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import RegisterForm from '$lib/components/auth/RegisterForm.svelte';
	import LogoutButton from '$lib/components/auth/LogoutButton.svelte';
	import { user } from '$lib/pb';
</script>

<header>
	<div>
		{#if $user}
			Logged in as: {$user.username}
		{:else}
			Not logged in
		{/if}
	</div>
	<LoginForm />
	<RegisterForm
		on:registered={(event) => alert('Registered!\n\n' + JSON.stringify(event.detail, undefined, 2))}
	/>
	<LogoutButton />
</header>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
