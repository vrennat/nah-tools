export type AdjustmentName =
	| 'brightness'
	| 'contrast'
	| 'exposure'
	| 'saturation'
	| 'vibrance'
	| 'temperature'
	| 'tint'
	| 'highlights'
	| 'shadows'
	| 'vignette'
	| 'grain';

export type AdjustmentParams = Partial<Record<AdjustmentName, number>>;

export interface CurvePoint {
	x: number;
	y: number;
}

export interface CurvesParams {
	rgb: CurvePoint[];
	red: CurvePoint[];
	green: CurvePoint[];
	blue: CurvePoint[];
}

export interface FilterPreset {
	id: string;
	name: string;
	params: AdjustmentParams;
}

export interface FilterState {
	params: AdjustmentParams;
	curves: CurvesParams;
}

export const DEFAULT_CURVES: CurvesParams = {
	rgb: [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 }
	],
	red: [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 }
	],
	green: [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 }
	],
	blue: [
		{ x: 0, y: 0 },
		{ x: 1, y: 1 }
	]
};

export const DEFAULT_PARAMS: AdjustmentParams = {};

export const ADJUSTMENT_RANGES: Record<AdjustmentName, { min: number; max: number; step: number; default: number }> = {
	brightness: { min: -1, max: 1, step: 0.01, default: 0 },
	contrast: { min: -1, max: 1, step: 0.01, default: 0 },
	exposure: { min: -2, max: 2, step: 0.01, default: 0 },
	saturation: { min: -1, max: 1, step: 0.01, default: 0 },
	vibrance: { min: -1, max: 1, step: 0.01, default: 0 },
	temperature: { min: -1, max: 1, step: 0.01, default: 0 },
	tint: { min: -1, max: 1, step: 0.01, default: 0 },
	highlights: { min: -1, max: 1, step: 0.01, default: 0 },
	shadows: { min: -1, max: 1, step: 0.01, default: 0 },
	vignette: { min: 0, max: 1, step: 0.01, default: 0 },
	grain: { min: 0, max: 1, step: 0.01, default: 0 }
};
