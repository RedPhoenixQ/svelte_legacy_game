<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import LogoutButton from '$lib/components/auth/LogoutButton.svelte';
	import { Button } from '$lib/components/ui/button';
	import { user } from '$lib/pb';
</script>

<header class="flex justify-between border-b bg-background px-4 py-2">
	<ul>
		<li>
			<Button variant="ghost" href="/games">Games</Button>
		</li>
	</ul>

	{#if $user}
		<LogoutButton variant="secondary" title="logout">
			{$user.name}
		</LogoutButton>
	{:else}
		<LoginForm />
	{/if}
</header>

<slot />
