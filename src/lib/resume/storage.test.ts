import { describe, it, expect } from 'vitest';
import {
	saveResume,
	getResume,
	listResumes,
	deleteResume,
	saveTailoredResume,
	listTailoredResumes,
	exportResumeJSON,
	importResumeJSON
} from '$resume/storage';
import { createMockResume, createMinimalResume } from '$resume/test-utils';

describe('saveResume', () => {
	it('saves and returns the resume data', async () => {
		const mock = createMockResume();
		const result = await saveResume(mock);
		expect(result).toEqual(mock);
	});
});

describe('getResume', () => {
	it('retrieves a saved resume by ID', async () => {
		const mock = createMockResume();
		await saveResume(mock);
		const result = await getResume(mock.id);
		expect(result).toEqual(mock);
	});

	it('returns undefined for non-existent ID', async () => {
		const result = await getResume('non-existent-id');
		expect(result).toBeUndefined();
	});
});

describe('listResumes', () => {
	it('returns array of ResumeMetadata for all saved resumes', async () => {
		const a = createMockResume({ name: 'Resume A' });
		const b = createMinimalResume({ name: 'Resume B' });
		await saveResume(a);
		await saveResume(b);

		const list = await listResumes();
		expect(list).toHaveLength(2);

		const ids = list.map((r) => r.id);
		expect(ids).toContain(a.id);
		expect(ids).toContain(b.id);

		for (const item of list) {
			expect(item).toHaveProperty('id');
			expect(item).toHaveProperty('name');
			expect(item).toHaveProperty('template');
			expect(item).toHaveProperty('updatedAt');
		}
	});

	it('returns empty array when no resumes saved', async () => {
		const list = await listResumes();
		expect(list).toEqual([]);
	});
});

describe('deleteResume', () => {
	it('removes a resume', async () => {
		const mock = createMockResume();
		await saveResume(mock);
		await deleteResume(mock.id);
		const result = await getResume(mock.id);
		expect(result).toBeUndefined();
	});

	it('does not throw for non-existent ID', async () => {
		await expect(deleteResume('non-existent-id')).resolves.not.toThrow();
	});
});

describe('saveTailoredResume', () => {
	it('saves with masterResumeId set', async () => {
		const master = createMockResume();
		await saveResume(master);

		const tailored = createMockResume({ name: 'Tailored for Google' });
		const result = await saveTailoredResume(tailored, master.id);

		expect(result.masterResumeId).toBe(master.id);

		const retrieved = await getResume(result.id);
		expect(retrieved).toBeDefined();
		expect(retrieved!.masterResumeId).toBe(master.id);
	});
});

describe('listTailoredResumes', () => {
	it('returns only variants of that master', async () => {
		const master = createMockResume({ name: 'Master' });
		await saveResume(master);

		const tailoredA = createMockResume({ name: 'Tailored A' });
		const tailoredB = createMockResume({ name: 'Tailored B' });
		await saveTailoredResume(tailoredA, master.id);
		await saveTailoredResume(tailoredB, master.id);

		const otherMaster = createMockResume({ name: 'Other Master' });
		await saveResume(otherMaster);
		const otherTailored = createMockResume({ name: 'Other Tailored' });
		await saveTailoredResume(otherTailored, otherMaster.id);

		const list = await listTailoredResumes(master.id);
		expect(list).toHaveLength(2);
		expect(list.every((r) => r.masterResumeId === master.id)).toBe(true);
	});

	it('returns empty array when no variants exist', async () => {
		const list = await listTailoredResumes('no-variants-master-id');
		expect(list).toEqual([]);
	});
});

describe('exportResumeJSON', () => {
	it('returns a JSON string of the resume', async () => {
		const mock = createMockResume();
		await saveResume(mock);

		const json = await exportResumeJSON(mock.id);
		expect(typeof json).toBe('string');

		const parsed = JSON.parse(json);
		expect(parsed.id).toBe(mock.id);
		expect(parsed.name).toBe(mock.name);
		expect(parsed.personal).toEqual(mock.personal);
	});
});

describe('importResumeJSON', () => {
	it('parses JSON and saves as new resume with new ID', async () => {
		const mock = createMockResume();
		const json = JSON.stringify(mock);

		const imported = await importResumeJSON(json);
		expect(imported.id).not.toBe(mock.id);
		expect(imported.name).toBe(mock.name);
		expect(imported.personal).toEqual(mock.personal);

		const retrieved = await getResume(imported.id);
		expect(retrieved).toBeDefined();
		expect(retrieved!.name).toBe(mock.name);
	});

	it('throws error for invalid JSON', async () => {
		await expect(importResumeJSON('not valid json {')).rejects.toThrow();
	});

	it('throws error for JSON missing required fields', async () => {
		const incomplete = JSON.stringify({ name: 'Missing fields' });
		await expect(importResumeJSON(incomplete)).rejects.toThrow();
	});
});
