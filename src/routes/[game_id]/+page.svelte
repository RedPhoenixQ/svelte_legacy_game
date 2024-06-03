<script lang="ts">
	import { page } from '$app/stores';
	import Chat from '$lib/components/chat/Chat.svelte';
	import RollDice from '$lib/components/dice/RollDice.svelte';
	import { pb, user } from '$lib/pb';
	import { onMount } from 'svelte';
	import Board from './Board.svelte';

	export let data;
	$: console.debug('page data', data);
	$: ({ game, dms, players, characters } = data);

	$: isDm = !!$user && game.dms.includes($user.id);

	onMount(() => {
		const game_unsub = pb.from('games').subscribe(game.id, ({ action, record }) => {
			console.debug('Game sub', action, record);
			switch (action) {
				case 'update':
					// TODO: Handle adding/removing players and dms
					game = record;
					break;
				default:
					throw new Error(`Game cannot handle action ${action}`, {
						cause: {
							action,
							record
						}
					});
			}
		});

		return async () => {
			(await game_unsub)();
		};
	});
</script>

<h1>{game.name}</h1>

<RollDice />

<Board {game} {characters} {isDm} />

<div class="h-screen">
	<Chat game_id={$page.params.game_id} />
</div>
