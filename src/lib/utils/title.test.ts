import { describe, it, expect } from 'vitest';
import { withSiteSuffix } from './title';

describe('withSiteSuffix', () => {
	it('appends the suffix when missing', () => {
		expect(withSiteSuffix('Compress Video Free')).toBe('Compress Video Free | nah.tools');
	});
	it.each(['X | nah.tools', 'X — nah', 'X | nah', 'X - nah.tools'])('normalises %s', (t) => {
		expect(withSiteSuffix(t)).toBe('X | nah.tools');
	});
	it('does not strip "nah" inside a title', () => {
		expect(withSiteSuffix('Why nah exists')).toBe('Why nah exists | nah.tools');
	});
});
