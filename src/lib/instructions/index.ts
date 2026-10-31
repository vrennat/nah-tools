import { getTool } from '$lib/registry/index';
import { browserInstructions } from './browser';
import { nativeInstructions } from './native';
import type { NativeMethod, Platform } from './types';
export { platforms } from './types';

export function getInstructions(path: string) {
	const tool = getTool(path);
	const browser = browserInstructions[path];
	if (!tool || tool.family === 'guides' || !browser) return undefined;
	const withLimits = tool.family === 'pdf' || tool.family === 'pptx'
		? { ...browser, caveat: `${browser.caveat} The file picker accepts up to 100 MB per input file; available browser memory may limit processing further.` }
		: browser;
	const methods = Object.entries(nativeInstructions[path] ?? {});
	const native = Object.fromEntries(methods.filter(([, method]) => method.scope !== 'recordings-only')) as Partial<Record<Platform, NativeMethod>>;
	const optional = Object.fromEntries(methods.filter(([, method]) => method.scope === 'recordings-only')) as Partial<Record<Platform, NativeMethod>>;
	return { tool, browser: withLimits, native, optional };
}

// This is a hint only: never select a platform or redirect a visitor automatically.
export function suggestPlatform(userAgent: string, maxTouchPoints = 0): Platform | undefined {
	if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
	if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
	if (/Android/i.test(userAgent)) return 'android';
	if (/Windows/i.test(userAgent)) return 'windows';
	if (/Macintosh|Mac OS X/i.test(userAgent)) return 'mac';
	return undefined;
}
