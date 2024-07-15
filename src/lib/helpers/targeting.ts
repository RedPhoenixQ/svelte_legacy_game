import {
	Box,
	Circle,
	ensureVectorPoint,
	Polygon,
	type BodyOptions,
	type PotentialVector,
	type Vector
} from 'detect-collisions';
import { Sector } from './sector';

export type AttackShape =
	| { type: 'box'; width: number; height: number }
	| { type: 'circle'; radius: number }
	| { type: 'sector'; radius: number; arc: number }
	| { type: 'polygon'; points: Vector[]; offset?: Vector; centered?: boolean };

/**The returned body has isTrigger = true by default */
export function createBodyFromShape(
	shape: AttackShape,
	origin: PotentialVector,
	options?: BodyOptions
) {
	switch (shape.type) {
		case 'box': {
			const body = new Box(origin, shape.height, shape.width, {
				isCentered: true,
				isTrigger: true,
				...options
			});
			body.setOffset(ensureVectorPoint({ x: shape.height / 2, y: 0 }));
			return body;
		}
		case 'circle':
			return new Circle(origin, shape.radius, {
				isCentered: true,
				isTrigger: true,
				...options
			});
		case 'sector':
			return new Sector(origin, shape.radius, shape.arc, {
				isTrigger: true,
				...options
			});
		case 'polygon': {
			const body = new Polygon(origin, shape.points, {
				isTrigger: true,
				isCentered: shape.centered,
				...options
			});
			if (shape.offset) {
				body.setOffset(ensureVectorPoint(shape.offset));
			}
			return body;
		}
	}
}
