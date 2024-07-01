<script lang="ts">
	import { pb } from '$lib/pb';
	import { lt } from 'typed-pocketbase';
	import { onMount } from 'svelte';

	export let data;

	let test1 = new Map(data.test1.map((t) => [t.id, t]));
	onMount(() => {
		pb.from('test1').subscribe(
			'*',
			(args) => {
				console.log(args);
				if (args.action === 'delete') {
					test1.delete(args.record.id);
				} else {
					// Create and update
					test1.set(args.record.id, args.record);
				}
				test1 = test1;
			},
			{
				query: {
					filter: lt('number', 1000)
				}
			}
		);
	});

	let text = '';
	let number = 0;
</script>

<form
	on:submit|preventDefault={function (event) {
		event.preventDefault();
		pb.from('test1').create({ text, number });
		// @ts-expect-error: this will be HTMLFormElement
		this.reset();
	}}
>
	<input type="text" bind:value={text} />
	<input type="number" bind:value={number} />
	<button>Create</button>
</form>

<ul>
	{#each test1 as [id, t] (id)}
		<li>
			<hr />
			{id}
			<form
				on:change|preventDefault={() => {
					pb.collection('test1').update(t.id, t);
				}}
			>
				<input type="text" bind:value={t.text} />
				<input type="number" bind:value={t.number} />
			</form>
			<button
				on:click={() => {
					pb.collection('test1').update(t.id, t);
				}}>update</button
			>
			<button
				on:click={() => {
					pb.collection('test1').delete(t.id);
				}}>X</button
			>
		</li>
	{/each}
</ul>
