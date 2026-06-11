import type { ToolEntry } from '../types';

// Names and descriptions copied verbatim from src/routes/audio/+page.svelte card grid.
// Order matches the hub page display order.
export const audioTools: ToolEntry[] = [
	{
		path: '/audio/convert',
		family: 'audio',
		name: 'Convert Audio',
		description: 'MP3, WAV, OGG, M4A, FLAC, AAC',
		icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
		keywords: ['convert', 'mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'audio'],
		related: ['/audio/merge', '/audio/normalize', '/audio/volume', '/media/compress-audio'],
		popular: true,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/audio/merge',
		family: 'audio',
		name: 'Merge Audio',
		description: 'Join multiple tracks into one file',
		icon: 'M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z',
		keywords: ['merge', 'join', 'combine', 'tracks', 'audio'],
		related: ['/audio/convert', '/audio/normalize', '/media/trim-audio', '/audio/fade'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/normalize',
		family: 'audio',
		name: 'Normalize Volume',
		description: 'Even out loudness (EBU R128)',
		icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
		keywords: ['normalize', 'loudness', 'ebu r128', 'volume', 'audio'],
		related: ['/audio/volume', '/audio/convert', '/audio/merge', '/media/compress-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/speed',
		family: 'audio',
		name: 'Change Speed',
		description: 'Speed up or slow down without pitch change',
		icon: 'M3 8.25V18a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 18V8.25m-18 0V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v2.25m-18 0h18M12 12.75h.008v.008H12v-.008zm0 3h.008v.008H12v-.008z',
		keywords: ['speed', 'tempo', 'slow down', 'speed up', 'atempo', 'audio'],
		related: ['/audio/pitch', '/audio/volume', '/audio/normalize', '/media/trim-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/pitch',
		family: 'audio',
		name: 'Shift Pitch',
		description: 'Transpose pitch in semitones, constant speed',
		icon: 'M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z',
		keywords: ['pitch', 'transpose', 'semitones', 'key change', 'audio'],
		related: ['/audio/speed', '/audio/volume', '/audio/convert', '/audio/normalize'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/volume',
		family: 'audio',
		name: 'Adjust Volume',
		description: 'Boost or reduce volume by dB amount',
		icon: 'M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z',
		keywords: ['volume', 'gain', 'boost', 'decibel', 'db', 'audio'],
		related: ['/audio/normalize', '/audio/fade', '/audio/convert', '/audio/speed'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/fade',
		family: 'audio',
		name: 'Fade In / Fade Out',
		description: 'Add fade in and fade out to audio clips',
		icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25',
		keywords: ['fade', 'fade in', 'fade out', 'transition', 'audio envelope'],
		related: ['/audio/volume', '/audio/normalize', '/audio/merge', '/media/trim-audio'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/reverse',
		family: 'audio',
		name: 'Reverse Audio',
		description: 'Play audio backwards for effects',
		icon: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
		keywords: ['reverse', 'backwards', 'audio effect', 'backmasking', 'audio'],
		related: ['/audio/speed', '/audio/fade', '/audio/convert', '/audio/silence-remove'],
		sitemap: { changefreq: 'monthly', priority: 0.7 }
	},
	{
		path: '/audio/silence-remove',
		family: 'audio',
		name: 'Remove Silence',
		description: 'Trim leading and trailing silence automatically',
		icon: 'M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75',
		keywords: ['remove silence', 'trim silence', 'silence detection', 'clean audio', 'audio'],
		related: ['/audio/normalize', '/audio/fade', '/media/trim-audio', '/audio/reverse'],
		sitemap: { changefreq: 'monthly', priority: 0.8 }
	},
	{
		path: '/audio/record',
		family: 'audio',
		name: 'Voice Recorder',
		description: 'Record from mic, pause, download WebM or MP3',
		icon: 'M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z',
		keywords: ['record', 'voice recorder', 'microphone', 'capture audio', 'audio recorder'],
		related: ['/audio/transcribe', '/audio/convert', '/audio/silence-remove', '/audio/normalize'],
		popular: true,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	},
	{
		path: '/audio/transcribe',
		family: 'audio',
		name: 'Transcribe Audio',
		description: 'Speech to text with Whisper — text, SRT, VTT, PDF notes',
		icon: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12',
		keywords: [
			'transcribe',
			'transcription',
			'speech to text',
			'subtitles',
			'captions',
			'whisper',
			'srt',
			'vtt',
			'on-device',
			'ai transcription'
		],
		related: ['/audio/record', '/media/extract-audio', '/audio/convert'],
		popular: true,
		sitemap: { changefreq: 'monthly', priority: 0.9 }
	}
];
