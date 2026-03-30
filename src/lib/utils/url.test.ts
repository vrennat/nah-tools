import { describe, it, expect } from 'vitest';
import { normalizeUrl } from '$utils/url';

describe('normalizeUrl', () => {
	it('returns URL unchanged with https:// prefix', () => {
		expect(normalizeUrl('https://example.com')).toBe('https://example.com');
	});

	it('returns URL unchanged with http:// prefix', () => {
		expect(normalizeUrl('http://example.com')).toBe('http://example.com');
	});

	it('prepends https:// when no protocol is present', () => {
		expect(normalizeUrl('example.com')).toBe('https://example.com');
	});

	it('handles mixed-case protocol', () => {
		expect(normalizeUrl('HTTP://example.com')).toBe('HTTP://example.com');
	});

	it('handles URL with path and query params', () => {
		expect(normalizeUrl('example.com/path?q=1')).toBe('https://example.com/path?q=1');
	});
});
