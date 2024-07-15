export type AttackShape =
	| { type: 'box'; width: number; height: number }
	| { type: 'circle'; radius: number }
	| { type: 'sector'; radius: number; arc: number };
