import type { PanZoom as PZ } from 'panzoom';
import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';
import Movable from './Movable.svelte';
import PanZoom from './PanZoom.svelte';
import type { Body } from 'detect-collisions';
import type { Board } from '$lib/game/board';

export { PanZoom, Movable };

export const DEFAULT_GRID_SIZE = 50 as const;
export const DEFAULT_GRID_SIZE_HALF = DEFAULT_GRID_SIZE / 2;
export const ROTATION_SPAN_STEP = Math.PI / 6;
export const ONE_AND_A_HALF_PI = Math.PI + Math.PI / 2;

export type XYPos = {
	x: number;
	y: number;
};

export type AttackShape =
	| { type: 'box'; width: number; height: number }
	| { type: 'circle'; radius: number }
	| { type: 'sector'; radius: number; arc: number };

export type AimBodies = Set<Body>;

const AIM_BODIES_CONTEXT_KEY = Symbol('aimCanvasBodies');

export function initAimBodiesCtx(board: Board) {
	const bodies = new Set<Body>();
	const { subscribe, set } = writable(bodies);
	const store = {
		subscribe,
		add(body: Body) {
			bodies.add(body);
			board.insert(body);
			set(bodies);
		},
		remove(body: Body) {
			bodies.delete(body);
			board.remove(body);
			set(bodies);
		},
		update() {
			set(bodies);
		}
	};
	setContext(AIM_BODIES_CONTEXT_KEY, store);
	return store;
}

export function getAimBodiesCtx() {
	return getContext(AIM_BODIES_CONTEXT_KEY) as ReturnType<typeof initAimBodiesCtx>;
}

export type PanZoomInner = { element: HTMLElement; instance: PZ };

export type PanZoomStore = Writable<PanZoomInner>;

const PANZOOM_CONTEXT_KEY = Symbol('panzoom');

export function getPanZoomCtx(): PanZoomStore {
	return getContext(PANZOOM_CONTEXT_KEY);
}

export function initPanZoomCtx(): PanZoomStore {
	const store: PanZoomStore = writable();
	setContext(PANZOOM_CONTEXT_KEY, store);
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
