import type { FilterPreset } from './types';

export const PRESETS: FilterPreset[] = [
	{
		id: 'none',
		name: 'None',
		params: {}
	},
	{
		id: 'vivid',
		name: 'Vivid',
		params: { contrast: 0.15, saturation: 0.3, vibrance: 0.2 }
	},
	{
		id: 'warm',
		name: 'Warm',
		params: { temperature: 0.35, exposure: 0.05, saturation: 0.1 }
	},
	{
		id: 'cool',
		name: 'Cool',
		params: { temperature: -0.25, tint: 0.05, contrast: 0.05 }
	},
	{
		id: 'matte',
		name: 'Matte',
		params: { contrast: -0.15, shadows: 0.2, highlights: -0.1 }
	},
	{
		id: 'bw',
		name: 'B&W',
		params: { saturation: -1, contrast: 0.1 }
	},
	{
		id: 'dramatic',
		name: 'Dramatic',
		params: { contrast: 0.35, shadows: -0.2, highlights: 0.1, vibrance: 0.15 }
	},
	{
		id: 'faded',
		name: 'Faded',
		params: { contrast: -0.2, brightness: 0.05, saturation: -0.3, shadows: 0.15 }
	},
	{
		id: 'punchy',
		name: 'Punchy',
		params: { contrast: 0.25, vibrance: 0.35, exposure: 0.1 }
	}
];
