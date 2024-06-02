<script lang="ts">
	import LoginForm from '$lib/components/auth/LoginForm.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<h1 class="text-center text-pretty">{$page.error?.message ?? 'An error occured'}</h1>

{#if $page.error?.needs_auth}
	<h2>Login</h2>
	<LoginForm
		on:login={() =>
			goto($page.url, {
				invalidateAll: true
			})}
	/>
{/if}
