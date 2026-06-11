import { describe, it, expect } from 'vitest';
import { searchTools, popularTools } from './index';

describe('searchTools', () => {
	describe('empty / blank queries', () => {
		it('returns [] for empty string', () => {
			expect(searchTools('')).toEqual([]);
		});

		it('returns [] for whitespace-only string', () => {
			expect(searchTools('   ')).toEqual([]);
		});
	});

	describe('merge query ranking', () => {
		it('ranks /pdf/merge and /pptx/merge above description-only matches', () => {
			const results = searchTools('merge');
			const paths = results.map((r) => r.path);

			const pdfIdx = paths.indexOf('/pdf/merge');
			const pptxIdx = paths.indexOf('/pptx/merge');
			const audioIdx = paths.indexOf('/audio/merge');

			// All three should appear
			expect(pdfIdx).toBeGreaterThanOrEqual(0);
			expect(pptxIdx).toBeGreaterThanOrEqual(0);
			expect(audioIdx).toBeGreaterThanOrEqual(0);

			// Any result that only matched via description should rank lower
			// than the tools with "merge" in their name or keywords
			const descOnlyMinIdx = results.findIndex(
				(r) =>
					!r.name.toLowerCase().includes('merge') &&
					!(r.keywords ?? []).some((k) => k.toLowerCase().includes('merge'))
			);
			if (descOnlyMinIdx >= 0) {
				// pdf, pptx, and audio merge should all appear before description-only matches
				expect(pdfIdx).toBeLessThan(descOnlyMinIdx);
				expect(pptxIdx).toBeLessThan(descOnlyMinIdx);
			}
		});
	});

	describe('keyword matching', () => {
		it('finds /photo/rm-bg by keyword "transparent"', () => {
			const results = searchTools('transparent');
			expect(results.map((r) => r.path)).toContain('/photo/rm-bg');
		});

		it('finds /photo/rm-bg by keyword "cutout"', () => {
			const results = searchTools('cutout');
			expect(results.map((r) => r.path)).toContain('/photo/rm-bg');
		});

		it('finds /media/video-to-gif by keyword "animated"', () => {
			const results = searchTools('animated');
			expect(results.map((r) => r.path)).toContain('/media/video-to-gif');
		});
	});

	describe('limit parameter', () => {
		it('respects the limit argument', () => {
			const results = searchTools('pdf', 3);
			expect(results.length).toBeLessThanOrEqual(3);
		});

		it('returns fewer results than limit when fewer matches exist', () => {
			// "video-to-gif" is a very specific query — likely fewer than 10 matches
			const results = searchTools('video-to-gif', 10);
			expect(results.length).toBeLessThanOrEqual(10);
		});
	});

	describe('case insensitivity', () => {
		it('matches regardless of query case', () => {
			const lower = searchTools('merge').map((r) => r.path);
			const upper = searchTools('MERGE').map((r) => r.path);
			expect(lower).toEqual(upper);
		});
	});
});

describe('popularTools', () => {
	it('returns only tools with popular: true', () => {
		const pop = popularTools();
		expect(pop.length).toBeGreaterThan(0);
		for (const t of pop) {
			expect(t.popular).toBe(true);
		}
	});

	it('includes /pdf/merge', () => {
		expect(popularTools().map((t) => t.path)).toContain('/pdf/merge');
	});
});
