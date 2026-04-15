export interface VideoPreset {
	id: string;
	label: string;
	description: string;
	crf: number;
	audioBitrate: string;
	maxWidth: number;
	maxHeight: number;
	fps: number | null;
}

export const VIDEO_PRESETS: VideoPreset[] = [
	{
		id: 'email',
		label: 'Email-friendly',
		description: 'Under 25MB for email attachments',
		crf: 32,
		audioBitrate: '96k',
		maxWidth: 1280,
		maxHeight: 720,
		fps: 30
	},
	{
		id: 'social',
		label: 'Social media',
		description: 'Optimized for sharing on social platforms',
		crf: 26,
		audioBitrate: '128k',
		maxWidth: 1920,
		maxHeight: 1080,
		fps: 30
	},
	{
		id: 'web',
		label: 'Web',
		description: 'Good quality, reasonable file size',
		crf: 23,
		audioBitrate: '128k',
		maxWidth: 1920,
		maxHeight: 1080,
		fps: null
	}
];

export const AUDIO_BITRATES = [
	{ value: '64k', label: '64 kbps', description: 'Smallest file, lower quality' },
	{ value: '128k', label: '128 kbps', description: 'Good quality for speech' },
	{ value: '192k', label: '192 kbps', description: 'High quality' },
	{ value: '320k', label: '320 kbps', description: 'Maximum quality' }
];
