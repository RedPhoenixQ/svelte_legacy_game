<script lang="ts">
	import BoardComp from '$lib/components/board/Board.svelte';
	import type { Board } from '$lib/game/board';
	import type { CharactersMap } from '$lib/game/character';
	import type { TokenMap } from '$lib/game/token';
	import type { ActionItems, CurrentTurn } from '$lib/game/actionItem';
	import * as Resizable from '$lib/components/ui/resizable';
	import ActionButtons from './ActionButtons.svelte';
	import ActionList from './ActionList.svelte';
	import Aim from '$lib/components/board/Aim.svelte';
	import { user } from '$lib/pb';
	import * as Menubar from '$lib/components/ui/menubar';
	import UseAttackMenu from './UseAttackMenuContent.svelte';
	import type { AttackShape } from '$lib/components/board';
	import type { StatsMap } from '$lib/game/stats';
	import { Progress } from '$lib/components/ui/progress';
	import { trpc } from '$lib/trpc/client';
	import { page } from '$app/stores';

	export let board: Board;
	export let tokens: TokenMap;
	export let actionItems: ActionItems;
	export let characters: CharactersMap;
	export let statsMap: StatsMap;
	export let currentTurn: CurrentTurn;
	export let isDm = false;

	$: isUsersTurn = currentTurn?.character?.owner === $user?.id;

	let selectedAttack:
		| {
				centered: boolean;
				shape: AttackShape;
		  }
		| undefined;
</script>

<Resizable.PaneGroup direction="horizontal" autoSaveId="combatLayout">
	<Resizable.Pane collapsible defaultSize={25} minSize={10}>
		<Resizable.PaneGroup direction="vertical" autoSaveId="combatSidebarLayout">
			<Resizable.Pane defaultSize={60}>
				<ActionList {actionItems} {characters} {tokens} />
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane collapsible defaultSize={40} minSize={20}>
				<ActionButtons />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</Resizable.Pane>
	<Resizable.Handle withHandle />
	<Resizable.Pane defaultSize={75} minSize={20} class="relative">
		<BoardComp {board} {characters} moveAll={isDm} {tokens} let:width let:height>
			{#if isUsersTurn && currentTurn?.token && selectedAttack}
				<Aim
					{board}
					{width}
					{height}
					origin={currentTurn.token}
					angle={0}
					shape={selectedAttack.shape}
					movableOrigin={!selectedAttack.centered}
				/>
			{/if}

			<svlete:fragment slot="token" let:token let:character>
				{@const stats = character
					? statsMap.character.get(character.id)
					: statsMap.token.get(token.id)}
				<div class="absolute left-0 right-0 top-full">
					{#if stats}
						<Progress
							class="h-4 text-center text-xs"
							barBgClass="bg-red-700"
							max={stats.maxHp}
							value={stats.hp}
						>
							{stats.hp}/{stats.maxHp}
						</Progress>
					{/if}
				</div>
			</svlete:fragment>
		</BoardComp>
		<Menubar.Menubar class="absolute left-2 top-2">
			<Menubar.Menu>
				<Menubar.Trigger disabled={!isUsersTurn}>Attack</Menubar.Trigger>
				<UseAttackMenu on:useAttack={({ detail }) => (selectedAttack = detail)} />
			</Menubar.Menu>
			<Menubar.Menu>
				<Menubar.Trigger>Test</Menubar.Trigger>
				<Menubar.Content>
					<Menubar.Item
						on:click={() => {
							trpc($page).combat.testAction.mutate().then(console.warn);
						}}
					>
						Test modifiers
					</Menubar.Item>
				</Menubar.Content>
			</Menubar.Menu>
		</Menubar.Menubar>
		{#if isUsersTurn}
			<div
				class="absolute inset-0 top-auto mx-auto my-4 w-fit animate-bounce rounded-md bg-accent px-4 py-2 text-accent-foreground"
			>
				It's your turn
			</div>
		{/if}
	</Resizable.Pane>
</Resizable.PaneGroup>
