import { describe, it, expect } from 'vitest';
import { extractKeywords } from '$resume/ats/keywords';
import { computeMatchScore, findMissingKeywords, findMatchedKeywords } from '$resume/ats/matching';
import { analyzeATSCompatibility } from '$resume/ats/xray';
import { analyzeJobMatch } from '$resume/ats';
import { createMockResume, createMinimalResume } from './test-utils';

const jobDescription = `
We are looking for a Senior Software Engineer with experience in React, TypeScript, and Node.js.
The ideal candidate has experience with cloud infrastructure (AWS or GCP), microservices architecture,
and CI/CD pipelines. Experience with PostgreSQL and Redis is a plus. Strong communication skills
and ability to mentor junior engineers required.
`;

describe('extractKeywords', () => {
	it('returns an array of strings', async () => {
		const result = await extractKeywords('Hello world of programming');
		expect(Array.isArray(result)).toBe(true);
		for (const kw of result) {
			expect(typeof kw).toBe('string');
		}
	});

	it('excludes common stop words', async () => {
		const result = await extractKeywords('the and is a to in of for with');
		const stopWords = ['the', 'and', 'is', 'a', 'to', 'in'];
		for (const stop of stopWords) {
			expect(result).not.toContain(stop);
		}
	});

	it('finds technical terms', async () => {
		const text =
			'Experience with JavaScript, React, Python, and machine learning required.';
		const result = await extractKeywords(text);
		expect(result).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/javascript/i),
				expect.stringMatching(/react/i),
				expect.stringMatching(/python/i)
			])
		);
	});

	it('returns unique keywords with no duplicates', async () => {
		const text = 'React React React JavaScript JavaScript TypeScript';
		const result = await extractKeywords(text);
		const unique = new Set(result);
		expect(result.length).toBe(unique.size);
	});

	it('returns empty array for empty string', async () => {
		const result = await extractKeywords('');
		expect(result).toEqual([]);
	});
});

describe('matching', () => {
	it('computeMatchScore returns a number between 0 and 100', () => {
		const score = computeMatchScore(['react', 'typescript'], ['react', 'python', 'go']);
		expect(score).toBeGreaterThanOrEqual(0);
		expect(score).toBeLessThanOrEqual(100);
	});

	it('perfect overlap returns 100', () => {
		const keywords = ['react', 'typescript', 'node.js'];
		expect(computeMatchScore(keywords, keywords)).toBe(100);
	});

	it('zero overlap returns 0', () => {
		expect(computeMatchScore(['react', 'typescript'], ['python', 'go'])).toBe(0);
	});

	it('partial overlap returns score between 0 and 100', () => {
		const score = computeMatchScore(
			['react', 'typescript', 'node.js'],
			['react', 'python', 'go', 'typescript']
		);
		expect(score).toBeGreaterThan(0);
		expect(score).toBeLessThan(100);
	});

	it('findMissingKeywords returns keywords in job but not in resume', () => {
		const missing = findMissingKeywords(['react'], ['react', 'python', 'go']);
		expect(missing).toContain('python');
		expect(missing).toContain('go');
		expect(missing).not.toContain('react');
	});

	it('findMatchedKeywords returns the overlap', () => {
		const matched = findMatchedKeywords(
			['react', 'typescript', 'node.js'],
			['react', 'python', 'typescript']
		);
		expect(matched).toContain('react');
		expect(matched).toContain('typescript');
		expect(matched).not.toContain('python');
		expect(matched).not.toContain('node.js');
	});
});

describe('analyzeATSCompatibility', () => {
	it('returns an object with score, issues, and suggestions arrays', () => {
		const resume = createMockResume();
		const result = analyzeATSCompatibility(resume);
		expect(typeof result.score).toBe('number');
		expect(Array.isArray(result.issues)).toBe(true);
		expect(Array.isArray(result.suggestions)).toBe(true);
		expect(Array.isArray(result.sections)).toBe(true);
	});

	it('resume with missing email produces an issue mentioning email', () => {
		const resume = createMockResume({
			personal: {
				fullName: 'Jane Smith',
				email: '',
				phone: '555-1234',
				location: '',
				linkedin: '',
				website: ''
			}
		});
		const result = analyzeATSCompatibility(resume);
		const emailIssue = result.issues.find((i) => /email/i.test(i));
		expect(emailIssue).toBeDefined();
	});

	it('resume with empty experience array produces an issue mentioning experience', () => {
		const resume = createMockResume({ experience: [] });
		const result = analyzeATSCompatibility(resume);
		const expIssue = result.issues.find((i) => /experience/i.test(i));
		expect(expIssue).toBeDefined();
	});

	it('full mock resume with all sections gets a high score (>= 70)', () => {
		const resume = createMockResume();
		const result = analyzeATSCompatibility(resume);
		expect(result.score).toBeGreaterThanOrEqual(70);
	});

	it('minimal resume with only name gets a low score (< 50)', () => {
		const resume = createMinimalResume({
			personal: {
				fullName: 'John Doe',
				email: '',
				phone: '',
				location: '',
				linkedin: '',
				website: ''
			}
		});
		const result = analyzeATSCompatibility(resume);
		expect(result.score).toBeLessThan(50);
	});
});

describe('analyzeJobMatch', () => {
	it('returns a JobMatchResult with score, matched, missing, suggestions', async () => {
		const resume = createMockResume();
		const result = await analyzeJobMatch(resume, jobDescription);
		expect(typeof result.score).toBe('number');
		expect(Array.isArray(result.matched)).toBe(true);
		expect(Array.isArray(result.missing)).toBe(true);
		expect(Array.isArray(result.suggestions)).toBe(true);
	});

	it('resume containing relevant keywords gets a higher match score than one without', async () => {
		const relevantResume = createMockResume();
		const irrelevantResume = createMinimalResume({
			summary: 'I enjoy painting and gardening in my free time.',
			skills: [
				{
					id: crypto.randomUUID(),
					name: 'Hobbies',
					skills: ['Watercolor', 'Ceramics', 'Botany']
				}
			]
		});

		const relevantScore = (await analyzeJobMatch(relevantResume, jobDescription)).score;
		const irrelevantScore = (await analyzeJobMatch(irrelevantResume, jobDescription)).score;
		expect(relevantScore).toBeGreaterThan(irrelevantScore);
	});
});
