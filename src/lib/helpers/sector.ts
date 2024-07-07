import { Polygon, SATVector, type BodyOptions, type PotentialVector } from 'detect-collisions';

export class Sector extends Polygon {
	#radius: number;
	#arc: number;

	/**
	 * @param radius The radius of the circle sector
	 * @param arc The angle of the cone in radiants
	 */
	constructor(position: PotentialVector, radius: number, arc: number, options?: BodyOptions) {
		super(position, createSector(radius, arc), options);
		this.#radius = radius;
		this.#arc = arc;
	}

	get radius() {
		return this.#radius;
	}
	set radius(radius: number) {
		this.#radius = radius;
		super.setPoints(createSector(this.#radius, this.#arc));
	}

	get arc() {
		return this.#arc;
	}
	set arc(arc: number) {
		this.#arc = arc;
		super.setPoints(createSector(this.#radius, this.#arc));
	}
}

function createSector(radius: number, arc: number, stepSize = 1.5): SATVector[] {
	const halfArc = arc / 2;
	const length = (radius * arc) / (Math.PI * 2);
	const segmentLength = (arc / length) * stepSize;
	const points = [new SATVector(0, 0)];

	points.push(new SATVector(radius * Math.cos(-halfArc), radius * Math.sin(-halfArc)));
	for (let step = -halfArc; step < 0; step += segmentLength) {
		points.push(new SATVector(radius * Math.cos(step), radius * Math.sin(step)));
	}
	points.push(new SATVector(radius * Math.cos(0), radius * Math.sin(0)));
	for (let step = halfArc % segmentLength; step <= halfArc; step += segmentLength) {
		points.push(new SATVector(radius * Math.cos(step), radius * Math.sin(step)));
	}
	points.push(new SATVector(radius * Math.cos(halfArc), radius * Math.sin(halfArc)));

	return points;
}
