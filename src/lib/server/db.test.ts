import { describe, it, expect } from 'vitest';
import { generateShortCode, isValidURL } from '$server/db';

describe('isValidURL', () => {
	it('returns true for https://example.com', () => {
		expect(isValidURL('https://example.com')).toBe(true);
	});

	it('returns true for http://example.com', () => {
		expect(isValidURL('http://example.com')).toBe(true);
	});

	it('returns false for javascript:alert(1)', () => {
		expect(isValidURL('javascript:alert(1)')).toBe(false);
	});

	it('returns false for data:text/html,<h1>hi</h1>', () => {
		expect(isValidURL('data:text/html,<h1>hi</h1>')).toBe(false);
	});

	it('returns false for file:///etc/passwd', () => {
		expect(isValidURL('file:///etc/passwd')).toBe(false);
	});

	it('returns false for vbscript:msgbox', () => {
		expect(isValidURL('vbscript:msgbox')).toBe(false);
	});

	it('returns false for ftp://example.com', () => {
		expect(isValidURL('ftp://example.com')).toBe(false);
	});

	it('returns false for empty string', () => {
		expect(isValidURL('')).toBe(false);
	});

	it('returns false for random text', () => {
		expect(isValidURL('not a url')).toBe(false);
	});
});

describe('generateShortCode', () => {
	it('returns an 8-character string', () => {
		const code = generateShortCode();
		expect(code).toHaveLength(8);
	});

	it('contains only alphanumeric characters', () => {
		const code = generateShortCode();
		expect(code).toMatch(/^[a-zA-Z0-9]+$/);
	});

	it('produces different codes on successive calls', () => {
		const a = generateShortCode();
		const b = generateShortCode();
		expect(a).not.toBe(b);
	});
});
