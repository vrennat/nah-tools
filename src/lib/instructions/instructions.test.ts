import { describe, expect, it } from 'vitest';
import { allTools } from '$lib/registry/index';
import { browserInstructions } from './browser';
import { nativeInstructions } from './native';
import { getInstructions, platforms, suggestPlatform } from './index';

describe('instruction coverage', () => {
	const tools = allTools.filter((tool) => tool.family !== 'guides');
	it('covers exactly every tool, excluding articles', () => {
		expect(Object.keys(browserInstructions).sort()).toEqual(tools.map((tool) => tool.path).sort());
		for (const tool of tools) {
			const instructions = getInstructions(tool.path)!;
			expect(instructions).toBeDefined();
			expect(instructions.browser.steps.length, tool.path).toBeGreaterThanOrEqual(2);
			expect(instructions.browser.caveat, tool.path).toBeTruthy();
		}
	});
	it('keeps native alternatives source-backed and mapped to real tools', () => {
		for (const [path, methods] of Object.entries(nativeInstructions)) {
			expect(tools.some((tool) => tool.path === path), path).toBe(true);
			for (const [platform, method] of Object.entries(methods)) {
				expect(platforms.some((entry) => entry.id === platform)).toBe(true);
				expect(method.source.url).toMatch(/^https:\/\/(support\.apple\.com|support\.microsoft\.com|support\.google\.com|www\.microsoft\.com)\//);
				expect(method.steps.length).toBeGreaterThanOrEqual(2);
				expect(method.caveat).toBeTruthy();
				expect(method.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			}
		}
	});
	it('distinguishes hosted services from local processing', () => {
		expect(browserInstructions['/links'].privacy).toBe('hosted');
		expect(browserInstructions['/bio'].privacy).toBe('hosted');
		expect(browserInstructions['/qr'].privacy).toBe('mixed');
	});
	it('keeps browser processing primary for arbitrary media rather than app-only recordings', () => {
		for (const [path, platform] of [['/audio/transcribe', 'ios'], ['/audio/transcribe', 'android'], ['/media/trim-audio', 'ios']] as const) {
			const instructions = getInstructions(path)!;
			expect(instructions.native[platform]).toBeUndefined();
			expect(instructions.optional[platform]?.scope).toBe('recordings-only');
		}
		expect(getInstructions('/media/trim-audio')!.native.mac).toBeDefined();
	});
	it('suggests a device without requiring recognition', () => {
		expect(suggestPlatform('Mozilla iPhone Mac OS X')).toBe('ios');
		expect(suggestPlatform('Mozilla Android')).toBe('android');
		expect(suggestPlatform('Windows NT')).toBe('windows');
		expect(suggestPlatform('Macintosh')).toBe('mac');
		expect(suggestPlatform('Macintosh', 5)).toBe('ios');
		expect(suggestPlatform('Linux')).toBeUndefined();
	});
});
