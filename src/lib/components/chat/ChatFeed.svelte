<script lang="ts">
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import type { MessagesResponse } from '$lib/schema';

	export let gameId: string;
	let messages: MessagesResponse[] = [];

	function sortMessages() {
		messages.sort((a, b) => new Date(b.created).valueOf() - new Date(a.created).valueOf());
	}

	onMount(async () => {
		const list = await pb.from('messages').getList(0, 20, {
			filter: ['game', '=', gameId],
			sort: '-created'
		});
		messages = list.items;

		pb.from('messages').subscribe(
			'*',
			({ action, record }) => {
				console.log(action, record);
				switch (action) {
					case 'create':
						messages.push(record);
						sortMessages();
						messages = messages;
						break;
					case 'delete':
						messages = messages.filter((msg) => msg.id === record.id);
						break;
					case 'update': {
						const index = messages.findIndex((msg) => msg.id === record.id);
						if (index >= 0) {
							messages[index] = record;
						} else {
							messages.push(record);
							sortMessages();
						}
						messages = messages;
						break;
					}
					default:
						break;
				}
			},
			{
				query: {
					filter: `game = '${gameId}'`
				}
			}
		);
	});
</script>

<ol class="flex flex-col-reverse overflow-y-auto p-1">
	{#each messages as msg}
		<li>{msg.created}: {msg.sender} - {msg.content}</li>
	{/each}
</ol>
