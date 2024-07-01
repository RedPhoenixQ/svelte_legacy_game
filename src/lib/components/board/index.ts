import type { PanZoom as PZ } from 'panzoom';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import Movable from './Movable.svelte';
import PanZoom from './PanZoom.svelte';

export { PanZoom, Movable };

export const DEFAULT_GRID_SIZE = 50 as const;

export type XYPos = {
	x: number;
	y: number;
};

export type PanZoomInner = { element: HTMLElement; instance: PZ };

export type PanZoomStore = Writable<PanZoomInner>;

export function getPanZoomCtx(): PanZoomStore {
	return getContext('panzoom');
}

export function initPanZoomCtx(): PanZoomStore {
	const store: PanZoomStore = writable();
	setContext('panzoom', store);
	return store;
}

export function pageToBoard(
	{ instance, element }: PanZoomInner,
	pageX: number,
	pageY: number
): XYPos {
	const transform = instance.getTransform();
	const rect = element.getBoundingClientRect();

	const boardPos = {
		x: (pageX - rect.x) / transform.scale,
		y: (pageY - rect.y) / transform.scale
	};

	console.debug('pageToBoard', transform, rect, boardPos);

	return boardPos;
}
