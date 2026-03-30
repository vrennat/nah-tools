import { describe, it, expect } from 'vitest';
import { createMockResume, createMinimalResume } from './test-utils';
import { buildDocDefinition, getTemplateMeta } from '$resume/pdf';

describe('buildDocDefinition', () => {
	const resume = createMockResume();

	it('professional template returns an object with a content array', () => {
		const doc = buildDocDefinition(resume, 'professional');
		expect(doc).toBeDefined();
		expect(Array.isArray(doc.content)).toBe(true);
	});

	it('modern template returns an object with a content array', () => {
		const doc = buildDocDefinition(resume, 'modern');
		expect(doc).toBeDefined();
		expect(Array.isArray(doc.content)).toBe(true);
	});

	it('minimal template returns an object with a content array', () => {
		const doc = buildDocDefinition(resume, 'minimal');
		expect(doc).toBeDefined();
		expect(Array.isArray(doc.content)).toBe(true);
	});

	it('professional template includes name and contact info in content', () => {
		const doc = buildDocDefinition(resume, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).toContain(resume.personal.fullName);
		expect(json).toContain(resume.personal.email);
		expect(json).toContain(resume.personal.phone);
	});

	it('professional template includes experience section when entries exist', () => {
		const doc = buildDocDefinition(resume, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).toContain('Experience');
		expect(json).toContain(resume.experience[0].title);
		expect(json).toContain(resume.experience[0].company);
	});

	it('professional template includes education section when entries exist', () => {
		const doc = buildDocDefinition(resume, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).toContain('Education');
		expect(json).toContain(resume.education[0].institution);
		expect(json).toContain(resume.education[0].degree);
	});

	it('professional template includes skills section when skills exist', () => {
		const doc = buildDocDefinition(resume, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).toContain('Skills');
		expect(json).toContain(resume.skills[0].name);
		expect(json).toContain(resume.skills[0].skills[0]);
	});

	it('modern template uses columns somewhere in content for two-column layout', () => {
		const doc = buildDocDefinition(resume, 'modern');
		const json = JSON.stringify(doc.content);
		expect(json).toContain('"columns"');
	});

	it('minimal template avoids bold color values (no hex colors in definition)', () => {
		const doc = buildDocDefinition(resume, 'minimal');
		const json = JSON.stringify(doc.content);
		// Should not contain any hex color except dark gray #333333 or black #000000
		const hexColors = json.match(/#[0-9a-fA-F]{6}/g) || [];
		const allowedColors = ['#333333', '#000000'];
		for (const color of hexColors) {
			expect(allowedColors).toContain(color);
		}
	});

	it('empty optional sections are NOT present in output', () => {
		const minimal = createMinimalResume();
		const doc = buildDocDefinition(minimal, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).not.toContain('Projects');
		expect(json).not.toContain('Certifications');
	});

	it('resume with experience and education works when projects/certifications are empty', () => {
		const partialResume = createMockResume({
			projects: [],
			certifications: [],
			customSections: []
		});
		const doc = buildDocDefinition(partialResume, 'professional');
		const json = JSON.stringify(doc.content);
		expect(json).toContain('Experience');
		expect(json).toContain('Education');
		expect(json).not.toContain('Projects');
		expect(json).not.toContain('Certifications');
	});
});

describe('getTemplateMeta', () => {
	it('returns array of 3 items with id, name, description for each template', () => {
		const meta = getTemplateMeta();
		expect(meta).toHaveLength(3);
		for (const item of meta) {
			expect(item).toHaveProperty('id');
			expect(item).toHaveProperty('name');
			expect(item).toHaveProperty('description');
			expect(typeof item.id).toBe('string');
			expect(typeof item.name).toBe('string');
			expect(typeof item.description).toBe('string');
		}
		const ids = meta.map((m) => m.id);
		expect(ids).toContain('professional');
		expect(ids).toContain('modern');
		expect(ids).toContain('minimal');
	});
});
