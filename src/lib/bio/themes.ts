import type { BioTheme } from './types';

export const themes: BioTheme[] = [
	{
		id: 'minimal',
		name: 'Minimal',
		bg: '#ffffff',
		text: '#0f172a',
		bio: '#64748b',
		linkBg: '#ffffff',
		linkText: '#0f172a',
		linkHover: '#f8fafc',
		linkBorder: '#e2e8f0',
		linkRadius: '0.75rem',
		fontFamily: "'DM Sans', system-ui, sans-serif"
	},
	{
		id: 'dark',
		name: 'Dark',
		bg: '#0f172a',
		text: '#f1f5f9',
		bio: '#94a3b8',
		linkBg: '#1e293b',
		linkText: '#f1f5f9',
		linkHover: '#334155',
		linkBorder: '#334155',
		linkRadius: '0.75rem',
		fontFamily: "'DM Sans', system-ui, sans-serif"
	},
	{
		id: 'brutalist',
		name: 'Brutalist',
		bg: '#ffffff',
		text: '#000000',
		bio: '#000000',
		linkBg: '#ffffff',
		linkText: '#000000',
		linkHover: '#000000',
		linkBorder: '#000000',
		linkRadius: '0',
		fontFamily: "'JetBrains Mono', monospace"
	},
	{
		id: 'gradient',
		name: 'Gradient',
		bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
		text: '#ffffff',
		bio: 'rgba(255,255,255,0.8)',
		linkBg: 'rgba(255,255,255,0.15)',
		linkText: '#ffffff',
		linkHover: 'rgba(255,255,255,0.25)',
		linkBorder: 'rgba(255,255,255,0.2)',
		linkRadius: '0.75rem',
		fontFamily: "'DM Sans', system-ui, sans-serif"
	},
	{
		id: 'ocean',
		name: 'Ocean',
		bg: '#0c4a6e',
		text: '#e0f2fe',
		bio: '#7dd3fc',
		linkBg: '#075985',
		linkText: '#e0f2fe',
		linkHover: '#0369a1',
		linkBorder: '#0284c7',
		linkRadius: '9999px',
		fontFamily: "'DM Sans', system-ui, sans-serif"
	},
	{
		id: 'nah',
		name: 'nah',
		bg: '#0f172a',
		text: '#f1f5f9',
		bio: '#94a3b8',
		linkBg: 'transparent',
		linkText: '#3b82f6',
		linkHover: 'rgba(59,130,246,0.1)',
		linkBorder: '#3b82f6',
		linkRadius: '0.5rem',
		fontFamily: "'DM Sans', system-ui, sans-serif"
	}
];

export function getTheme(id: string): BioTheme {
	return themes.find((t) => t.id === id) ?? themes[0];
}
