// Registry of developer tools. Drives the /dev hub, the related-tools nav on each
// tool page, and the global tool grid. Icons are single-path Heroicons-style outlines.

export interface DevTool {
	slug: string;
	name: string;
	/** Short tagline shown in cards and nav. */
	desc: string;
	/** Inline SVG path(s) for a 24x24 stroke icon. */
	icon: string;
	/** Search keywords for SEO/discovery. */
	keywords: string[];
}

export const devTools: DevTool[] = [
	{
		slug: 'json',
		name: 'JSON Formatter',
		desc: 'Format, validate, minify, and explore JSON.',
		icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		keywords: ['json', 'formatter', 'beautify', 'prettify', 'validator', 'minify', 'tree']
	},
	{
		slug: 'base64',
		name: 'Base64 Encode/Decode',
		desc: 'Encode and decode Base64 for text and files.',
		icon: 'M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7M4 7l8 5 8-5M4 7l8-4 8 4',
		keywords: ['base64', 'encode', 'decode', 'btoa', 'atob', 'data uri']
	},
	{
		slug: 'jwt',
		name: 'JWT Decoder',
		desc: 'Decode and verify JSON Web Tokens.',
		icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
		keywords: ['jwt', 'json web token', 'decode', 'verify', 'auth', 'bearer']
	},
	{
		slug: 'url',
		name: 'URL Encoder',
		desc: 'Encode, decode, and parse URLs and query strings.',
		icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
		keywords: ['url', 'encode', 'decode', 'percent', 'query string', 'parameters', 'uri']
	},
	{
		slug: 'hash',
		name: 'Hash Generator',
		desc: 'MD5, SHA-1, SHA-256/384/512 for text and files.',
		icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14',
		keywords: ['hash', 'md5', 'sha1', 'sha256', 'sha512', 'checksum', 'digest']
	},
	{
		slug: 'uuid',
		name: 'UUID Generator',
		desc: 'UUID v4, v7, and Nano ID. Bulk generation.',
		icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
		keywords: ['uuid', 'guid', 'v4', 'v7', 'nanoid', 'unique id', 'generator']
	},
	{
		slug: 'regex',
		name: 'Regex Tester',
		desc: 'Test patterns with live matches and replace.',
		icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
		keywords: ['regex', 'regular expression', 'pattern', 'match', 'replace', 'capture']
	},
	{
		slug: 'cron',
		name: 'Cron Expression',
		desc: 'Build, explain, and preview cron schedules.',
		icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
		keywords: ['cron', 'crontab', 'schedule', 'expression', 'next run', 'job']
	},
	{
		slug: 'timestamp',
		name: 'Timestamp Converter',
		desc: 'Unix, ISO 8601, and human time across zones.',
		icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
		keywords: ['timestamp', 'unix', 'epoch', 'iso 8601', 'date', 'timezone', 'convert']
	},
	{
		slug: 'color',
		name: 'Color Converter',
		desc: 'HEX, RGB, HSL, OKLCH, and contrast checker.',
		icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
		keywords: ['color', 'hex', 'rgb', 'hsl', 'oklch', 'contrast', 'wcag', 'converter']
	},
	{
		slug: 'qr-reader',
		name: 'QR Code Reader',
		desc: 'Scan and decode QR codes from an image.',
		icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4v-4h-4m4-1V8a2 2 0 00-2-2h-2.343M11 4.343H8a2 2 0 00-2 2v2.343M4 11v6a2 2 0 002 2h2.343',
		keywords: ['qr', 'qr code', 'reader', 'scanner', 'decode', 'read']
	},
	{
		slug: 'diff',
		name: 'Text Diff Checker',
		desc: 'Compare two texts line by line.',
		icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
		keywords: ['diff', 'compare', 'text', 'difference', 'merge', 'changes']
	},
	{
		slug: 'password',
		name: 'Password Generator',
		desc: 'Strong random passwords and passphrases.',
		icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
		keywords: ['password', 'generator', 'passphrase', 'random', 'secure', 'strength']
	},
	{
		slug: 'markdown',
		name: 'Markdown Editor',
		desc: 'Live Markdown preview and editor.',
		icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
		keywords: ['markdown', 'md', 'preview', 'editor', 'render', 'gfm']
	},
	{
		slug: 'lorem',
		name: 'Lorem Ipsum',
		desc: 'Placeholder text by words, sentences, paragraphs.',
		icon: 'M4 6h16M4 12h16M4 18h7',
		keywords: ['lorem', 'ipsum', 'placeholder', 'dummy text', 'filler', 'generator']
	},
	{
		slug: 'case',
		name: 'Case Converter',
		desc: 'UPPER, lower, Title, camelCase, snake_case, more.',
		icon: 'M4 7V4h16v3M9 20h6M12 4v16',
		keywords: ['case', 'convert', 'uppercase', 'lowercase', 'camelcase', 'snake', 'kebab', 'title']
	}
];

export function getDevTool(slug: string): DevTool | undefined {
	return devTools.find((t) => t.slug === slug);
}
