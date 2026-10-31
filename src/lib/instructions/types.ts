export const platforms = [
	{ id: 'mac', label: 'Mac' },
	{ id: 'windows', label: 'Windows' },
	{ id: 'ios', label: 'iPhone / iPad' },
	{ id: 'android', label: 'Android' }
] as const;
export type Platform = (typeof platforms)[number]['id'];
export interface NativeMethod {
	kind: 'built-in' | 'app';
	/** A limited recipe for recordings already in the named app, not arbitrary uploaded media. */
	scope?: 'recordings-only';
	title: string;
	steps: string[];
	caveat: string;
	source: { title: string; url: string };
	checked: string;
}
export interface BrowserMethod {
	steps: string[];
	caveat: string;
	privacy: 'local' | 'hosted' | 'mixed';
}
