<script lang="ts">
	import createPanzoom, { type PanZoomOptions } from 'panzoom';
	import { initPanZoomCtx } from '.';

	type $$Props = PanZoomOptions & Record<string, unknown>;

	export const panzoom = initPanZoomCtx();

	function panZooming(element: HTMLElement) {
		const instance = createPanzoom(element, $$props);
		panzoom.set({ element, instance });
		return {
			destroy() {
				$panzoom.instance.dispose();
			}
		};
	}
</script>

<div {...$$restProps} use:panZooming>
	<slot />
</div>
