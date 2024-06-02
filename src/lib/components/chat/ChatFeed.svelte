<script lang="ts">
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import type { ChatResponse } from '$lib/schema';

	export let game_id: string;
	let messages: ChatResponse[] = [];

	function sortMessages() {
		messages.sort((a, b) => new Date(b.created).valueOf() - new Date(a.created).valueOf());
	}

	onMount(async () => {
		const list = await pb.from('chat').getList(0, 20, {
			filter: ['game', '=', game_id],
			sort: '-created'
		});
		messages = list.items;

		pb.from('chat').subscribe(
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
					filter: `game = '${game_id}'`
				}
			}
		);
	});
</script>

<ol class="flex flex-col-reverse">
	{#each messages as msg}
		<li>{msg.created}: {msg.sender} - {msg.content}</li>
	{/each}
</ol>
