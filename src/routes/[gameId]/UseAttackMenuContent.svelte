<script lang="ts">
	import type { AttackShape } from '$lib/components/board';
	import { createEventDispatcher } from 'svelte';
	import * as Menubar from '$lib/components/ui/menubar';

	const dispatch = createEventDispatcher<{
		useAttack: { centered: boolean; shape: AttackShape };
	}>();
</script>

<Menubar.Content>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'box',
					width: 1,
					height: 100
				}
			})}>Short Line</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'box',
					width: 1,
					height: 500
				}
			})}>Long Line</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: false,
				shape: {
					type: 'box',
					width: 200,
					height: 100
				}
			})}>Movable Box</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'box',
					width: 150,
					height: 400
				}
			})}>Thick Line</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'circle',
					radius: 100
				}
			})}>Small Circle</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'circle',
					radius: 100
				}
			})}>Large Circle</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: false,
				shape: {
					type: 'circle',
					radius: 500
				}
			})}>Movable Circle</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'sector',
					radius: 100,
					arc: Math.PI / 2
				}
			})}>Short Sector</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'sector',
					radius: 400,
					arc: 1
				}
			})}>Long Sector</Menubar.Item
	>
	<Menubar.Item
		on:click={() =>
			dispatch('useAttack', {
				centered: true,
				shape: {
					type: 'sector',
					radius: 200,
					arc: 5
				}
			})}>Wide Sector</Menubar.Item
	>
</Menubar.Content>
