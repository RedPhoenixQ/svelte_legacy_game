<script lang="ts">
	import { pb } from '$lib/pb';
	import { onMount } from 'svelte';
	import type { MessagesResponse, UsersResponse } from '$lib/schema';

	export let gameId: string;
	export let users: Map<string, UsersResponse>;
	let messages: MessagesResponse[] = [];

	$: console.log(users);

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

<ol class="flex flex-col-reverse divide-y overflow-y-auto">
	{#each messages as msg (msg.id)}
		{@const user = users.get(msg.sender)}
		<li class="p-2">
			<div class="flex h-8 items-center gap-2">
				{#if user}
					{#if user.avatar}
						<img
							class="aspect-square h-full rounded-full"
							src={pb.getFileUrl(user, user?.avatar, { thumb: '100x100' })}
							alt={user.name}
						/>
					{/if}
					<span>{user.name}</span>
				{:else}
					<span>{msg.sender}</span>
				{/if}
				<span class="ml-auto text-sm opacity-75">{new Date(msg.created).toLocaleString()}</span>
			</div>
			{msg.content}
		</li>
	{/each}
</ol>
