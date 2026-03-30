import { describe, it, expect } from 'vitest';
import { createEmptyResume, createId } from '$resume/types';
import { createMockResume, createMinimalResume } from '$resume/test-utils';

describe('createId', () => {
	it('returns a string', () => {
		const id = createId();
		expect(typeof id).toBe('string');
		expect(id.length).toBeGreaterThan(0);
	});

	it('returns unique strings on each call', () => {
		const ids = new Set(Array.from({ length: 100 }, () => createId()));
		expect(ids.size).toBe(100);
	});
});

describe('createEmptyResume', () => {
	it('returns object with all required fields', () => {
		const resume = createEmptyResume();

		expect(resume).toHaveProperty('id');
		expect(resume).toHaveProperty('name');
		expect(resume).toHaveProperty('template');
		expect(resume).toHaveProperty('personal');
		expect(resume).toHaveProperty('summary');
		expect(resume).toHaveProperty('experience');
		expect(resume).toHaveProperty('education');
		expect(resume).toHaveProperty('skills');
		expect(resume).toHaveProperty('projects');
		expect(resume).toHaveProperty('certifications');
		expect(resume).toHaveProperty('customSections');
		expect(resume).toHaveProperty('createdAt');
		expect(resume).toHaveProperty('updatedAt');
	});

	it('sets template to professional by default', () => {
		const resume = createEmptyResume();
		expect(resume.template).toBe('professional');
	});

	it('generates unique IDs on each call', () => {
		const a = createEmptyResume();
		const b = createEmptyResume();
		const c = createEmptyResume();
		expect(a.id).not.toBe(b.id);
		expect(b.id).not.toBe(c.id);
		expect(a.id).not.toBe(c.id);
	});

	it('sets createdAt and updatedAt to valid ISO date strings', () => {
		const resume = createEmptyResume();

		expect(() => new Date(resume.createdAt)).not.toThrow();
		expect(new Date(resume.createdAt).toISOString()).toBe(resume.createdAt);

		expect(() => new Date(resume.updatedAt)).not.toThrow();
		expect(new Date(resume.updatedAt).toISOString()).toBe(resume.updatedAt);
	});

	it('initializes arrays as empty', () => {
		const resume = createEmptyResume();
		expect(resume.experience).toEqual([]);
		expect(resume.education).toEqual([]);
		expect(resume.skills).toEqual([]);
		expect(resume.projects).toEqual([]);
		expect(resume.certifications).toEqual([]);
		expect(resume.customSections).toEqual([]);
	});

	it('initializes personal info with empty strings', () => {
		const resume = createEmptyResume();
		expect(resume.personal).toEqual({
			fullName: '',
			email: '',
			phone: '',
			location: '',
			linkedin: '',
			website: ''
		});
	});
});

describe('createMockResume', () => {
	it('returns a valid resume structure', () => {
		const resume = createMockResume();

		expect(typeof resume.id).toBe('string');
		expect(resume.id.length).toBeGreaterThan(0);
		expect(resume.name).toBe('Test Resume');
		expect(resume.template).toBe('professional');
		expect(resume.personal.fullName).toBe('Jane Smith');
		expect(resume.personal.email).toBe('jane@example.com');
		expect(resume.experience.length).toBeGreaterThan(0);
		expect(resume.education.length).toBeGreaterThan(0);
		expect(resume.skills.length).toBeGreaterThan(0);
		expect(resume.projects.length).toBeGreaterThan(0);
		expect(resume.certifications.length).toBeGreaterThan(0);
		expect(typeof resume.createdAt).toBe('string');
		expect(typeof resume.updatedAt).toBe('string');
	});

	it('accepts overrides', () => {
		const resume = createMockResume({ name: 'Custom Name', template: 'modern' });
		expect(resume.name).toBe('Custom Name');
		expect(resume.template).toBe('modern');
	});
});

describe('createMinimalResume', () => {
	it('returns a valid resume structure', () => {
		const resume = createMinimalResume();

		expect(typeof resume.id).toBe('string');
		expect(resume.id.length).toBeGreaterThan(0);
		expect(resume.name).toBe('Minimal Resume');
		expect(resume.template).toBe('professional');
		expect(resume.personal.fullName).toBe('John Doe');
		expect(resume.personal.email).toBe('john@example.com');
		expect(resume.experience).toEqual([]);
		expect(resume.education).toEqual([]);
		expect(resume.skills).toEqual([]);
		expect(resume.projects).toEqual([]);
		expect(resume.certifications).toEqual([]);
		expect(resume.customSections).toEqual([]);
		expect(typeof resume.createdAt).toBe('string');
		expect(typeof resume.updatedAt).toBe('string');
	});

	it('accepts overrides', () => {
		const resume = createMinimalResume({ name: 'Override Name' });
		expect(resume.name).toBe('Override Name');
	});
});
