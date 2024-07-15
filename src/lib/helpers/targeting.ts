import { Box, Circle, ensureVectorPoint, type PotentialVector } from 'detect-collisions';
import { Sector } from './sector';

export type AttackShape =
	| { type: 'box'; width: number; height: number }
	| { type: 'circle'; radius: number }
	| { type: 'sector'; radius: number; arc: number };

export function createBodyFromShape(shape: AttackShape, origin: PotentialVector, angle: number) {
	switch (shape.type) {
		case 'box': {
			const collider = new Box(origin, shape.height, shape.width, {
				isCentered: true,
				isTrigger: true,
				angle
			});
			collider.setOffset(ensureVectorPoint({ x: shape.height / 2, y: 0 }));
			return collider;
		}
		case 'circle':
			return new Circle(origin, shape.radius, {
				isCentered: true,
				isTrigger: true,
				angle
			});
		case 'sector':
			return new Sector(origin, shape.radius, shape.arc, {
				isTrigger: true,
				angle
			});
	}
}
