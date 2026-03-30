import { describe, it, expect } from 'vitest';
import { Document } from 'docx';
import { createMockResume, createMinimalResume } from '$resume/test-utils';
import { exportDOCX, buildDocxDocument } from '$resume/docx/export';
import { importDOCX } from '$resume/docx/import';

describe('DOCX Export', () => {
	it('exportDOCX returns a Blob', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		expect(blob).toBeInstanceOf(Blob);
	});

	it('exported Blob is non-empty', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('buildDocxDocument returns a Document object', () => {
		const resume = createMockResume();
		const doc = buildDocxDocument(resume);
		expect(doc).toBeInstanceOf(Document);
	});

	it('exports with minimal resume (empty arrays)', async () => {
		const resume = createMinimalResume();
		const blob = await exportDOCX(resume);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	it('exports with full mock resume', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});
});

describe('DOCX Import', () => {
	it('round-trip preserves full name', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		const imported = await importDOCX(blob);
		expect(imported.personal?.fullName).toBe(resume.personal.fullName);
	});

	it('round-trip preserves email address', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		const imported = await importDOCX(blob);
		expect(imported.personal?.email).toBe(resume.personal.email);
	});

	it('throws a clear error for invalid (non-DOCX) data', async () => {
		const badBlob = new Blob(['this is not a docx file'], { type: 'text/plain' });
		await expect(importDOCX(badBlob)).rejects.toThrow(
			'Could not parse file. Please ensure it is a valid DOCX document.'
		);
	});

	it('returns a Partial<ResumeData> with at least personal.fullName or personal.email', async () => {
		const resume = createMockResume();
		const blob = await exportDOCX(resume);
		const imported = await importDOCX(blob);
		const hasName = imported.personal?.fullName && imported.personal.fullName.length > 0;
		const hasEmail = imported.personal?.email && imported.personal.email.length > 0;
		expect(hasName || hasEmail).toBe(true);
	});
});
