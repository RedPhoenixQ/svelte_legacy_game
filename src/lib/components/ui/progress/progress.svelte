<script lang="ts">
	import { Progress as ProgressPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type $$Props = ProgressPrimitive.Props & { barBgClass?: string };

	let className: $$Props['class'] = undefined;
	export let max: $$Props['max'] = 100;
	export let value: $$Props['value'] = undefined;
	export let barBgClass: $$Props['barBgClass'] = 'bg-primary';
	export { className as class };
</script>

<ProgressPrimitive.Root
	class={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
	{...$$restProps}
>
	<div
		class="h-full w-full flex-1 transition-all {barBgClass}"
		style={`transform: translateX(-${100 - (100 * (value ?? 0)) / (max ?? 1)}%)`}
	></div>
	{#if $$slots.default}
		<div class="absolute inset-0">
			<slot />
		</div>
	{/if}
</ProgressPrimitive.Root>
