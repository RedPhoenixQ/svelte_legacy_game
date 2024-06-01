<script lang="ts">
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import type { Test1 } from './+page';

	export let data;

	let test1 = data.test1;
	onMount(() => {
		pb.collection<Test1>('test1').subscribe(
			'*',
			(args) => {
				console.log(args);
				switch (args.action) {
					case 'create':
						test1 = [...test1, args.record];
						break;
					case 'delete':
						test1 = test1.filter((v) => v.id !== args.record.id);
						break;
					case 'update': {
						const index = test1.findIndex((v) => v.id === args.record.id);
						if (index <= 0) {
							test1[index] = args.record;
							test1 = test1;
						}
						break;
					}
				}
			},
			{
				query: {
					filter: 'number < 1000'
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
		pb.collection('test1').create({ text, number });
		// this.reset();
	}}
>
	<input type="text" bind:value={text} />
	<input type="number" bind:value={number} />
	<button>Create</button>
</form>

<ul>
	{#each test1 as t}
		<li>
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
