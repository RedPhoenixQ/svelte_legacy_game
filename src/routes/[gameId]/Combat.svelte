<script lang="ts">
	import BoardComp from '$lib/components/board/Board.svelte';
	import type { Board } from '$lib/game/board';
	import type { CharactersMap } from '$lib/game/character';
	import type { TokenMap } from '$lib/game/token';
	import type { ActionItems } from '$lib/game/actionItem';
	import * as Resizable from '$lib/components/ui/resizable';
	import ActionButtons from './ActionButtons.svelte';
	import ActionList from './ActionList.svelte';
	import Aim from '$lib/components/board/Aim.svelte';

	export let board: Board;
	export let tokens: TokenMap;
	export let actionItems: ActionItems;
	export let characters: CharactersMap;
	export let isDm = false;
</script>

<Resizable.PaneGroup direction="horizontal" autoSaveId="combatLayout">
	<Resizable.Pane collapsible defaultSize={25} minSize={10}>
		<Resizable.PaneGroup direction="vertical" autoSaveId="combatSidebarLayout">
			<Resizable.Pane defaultSize={60}>
				<ActionList {actionItems} {characters} />
			</Resizable.Pane>
			<Resizable.Handle withHandle />
			<Resizable.Pane collapsible defaultSize={40} minSize={20}>
				<ActionButtons />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</Resizable.Pane>
	<Resizable.Handle withHandle />
	<Resizable.Pane defaultSize={75} minSize={20}>
		<BoardComp {board} {characters} moveAll={isDm} {tokens} let:width let:height>
			<Aim
				{board}
				{width}
				{height}
				origin={{ x: 200, y: 200 }}
				angle={Math.PI / 4}
				shape={{
					// type: 'cone',
					// radius: 200,
					// angle: 1.2
					type: 'box',
					width: 20,
					height: 300
					// type: 'circle',
					// radius: 100
				}}
				movableOrigin
			/>
		</BoardComp>
	</Resizable.Pane>
</Resizable.PaneGroup>
