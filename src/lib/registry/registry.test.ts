import { describe, it, expect } from 'vitest';
import { allTools, allFamilies, getTool, getFamily, getFamilyTools, getRelated } from './index';
import { devTools } from '$dev/tools';
import { textTools } from '$text/tools';
import { allPairs } from '$convert/pairs';

describe('registry', () => {
	describe('allTools', () => {
		it('all paths are unique', () => {
			const paths = allTools.map((t) => t.path);
			const unique = new Set(paths);
			expect(unique.size).toBe(paths.length);
		});

		it('all paths start with /', () => {
			for (const tool of allTools) {
				expect(tool.path).toMatch(/^\//);
			}
		});

		it('derived dev tool count matches source registry', () => {
			const derived = allTools.filter((t) => t.family === 'dev');
			expect(derived.length).toBe(devTools.length);
		});

		it('derived text tool count matches source registry', () => {
			const derived = allTools.filter((t) => t.family === 'text');
			expect(derived.length).toBe(textTools.length);
		});

		it('derived convert pair count matches source registry', () => {
			const derived = allTools.filter((t) => t.family === 'convert');
			expect(derived.length).toBe(allPairs.length);
		});
	});

	describe('allFamilies', () => {
		it('every family id appears at least once in allTools (except standalone hub)', () => {
			for (const family of allFamilies) {
				// The standalone family has tools (resume, invoice, etc.) — it just has no hub.
				const tools = getFamilyTools(family.id);
				expect(tools.length).toBeGreaterThan(0);
			}
		});
	});

	describe('getTool', () => {
		it('returns a tool for a known path', () => {
			const tool = getTool('/pdf/merge');
			expect(tool).toBeDefined();
			expect(tool?.name).toBe('Merge PDFs');
		});

		it('returns undefined for an unknown path', () => {
			expect(getTool('/does/not/exist')).toBeUndefined();
		});
	});

	describe('getFamily', () => {
		it('returns a family for a known id', () => {
			const family = getFamily('pdf');
			expect(family).toBeDefined();
			expect(family?.hub).toBe('/pdf');
		});

		it('returns standalone family with null hub', () => {
			const family = getFamily('standalone');
			expect(family?.hub).toBeNull();
		});
	});

	describe('getFamilyTools', () => {
		it('returns only tools belonging to the given family', () => {
			const tools = getFamilyTools('pdf');
			for (const tool of tools) {
				expect(tool.family).toBe('pdf');
			}
			expect(tools.length).toBeGreaterThan(0);
		});
	});

	describe('getRelated', () => {
		it('does not include the tool itself', () => {
			const related = getRelated('/pdf/merge');
			const paths = related.map((t) => t.path);
			expect(paths).not.toContain('/pdf/merge');
		});

		it('returns only valid paths (all entries exist in allTools)', () => {
			const related = getRelated('/pdf/merge');
			for (const tool of related) {
				expect(getTool(tool.path)).toBeDefined();
			}
		});

		it('falls back to same-family siblings when related field is unset', () => {
			// qr tools have no related field set
			const related = getRelated('/qr/wifi');
			for (const tool of related) {
				expect(tool.family).toBe('qr');
			}
		});

		it('respects the n limit', () => {
			const related = getRelated('/pdf/merge', 2);
			expect(related.length).toBeLessThanOrEqual(2);
		});

		it('returns empty array for unknown path', () => {
			expect(getRelated('/does/not/exist')).toEqual([]);
		});
	});
});
