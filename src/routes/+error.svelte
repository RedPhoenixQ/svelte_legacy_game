<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<h1 class="text-pretty text-center">{$page.error?.message ?? 'An error occured'}</h1>

{#if $page.error?.needsAuth}
	<h2>Login</h2>
	<LoginForm
		on:login={() =>
			goto($page.url, {
				invalidateAll: true
			})}
	/>
{/if}
