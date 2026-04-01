/**
 * Structural PDF mutations for the editor.
 * Thin wrappers around processor.ts that operate on raw bytes.
 * The editor state module handles snapshot/undo and document reload.
 */

import {
	reorderPages as processorReorder,
	rotatePages as processorRotate,
	removePages as processorRemove,
	mergePDFs as processorMerge
} from './processor';

/** Reorder pages to a new index order. Returns new PDF bytes. */
export async function reorderPages(
	source: ArrayBuffer,
	newOrder: number[]
): Promise<Uint8Array> {
	return processorReorder(source, newOrder);
}

/** Rotate pages by a given angle (90, 180, 270). Returns new PDF bytes. */
export async function rotatePages(
	source: ArrayBuffer,
	pageIndices: number[],
	degrees: number
): Promise<Uint8Array> {
	const rotations = new Map(pageIndices.map((i) => [i, degrees]));
	return processorRotate(source, rotations);
}

/** Remove pages by their 0-based indices. Returns new PDF bytes. */
export async function deletePages(
	source: ArrayBuffer,
	pageIndices: number[]
): Promise<Uint8Array> {
	// Work around @cantoo/pdf-lib removePage not persisting through save():
	// rebuild the document with only the pages we want to keep.
	const { PDFDocument } = await import('@cantoo/pdf-lib');
	const srcDoc = await PDFDocument.load(source);
	const toRemove = new Set(pageIndices);
	const keepIndices = Array.from(
		{ length: srcDoc.getPageCount() },
		(_, i) => i
	).filter((i) => !toRemove.has(i));

	const newDoc = await PDFDocument.create();
	const pages = await newDoc.copyPages(srcDoc, keepIndices);
	for (const page of pages) newDoc.addPage(page);
	return newDoc.save();
}

/** Merge additional PDF bytes into the document at a given position. Returns new PDF bytes. */
export async function mergeAtPosition(
	source: ArrayBuffer,
	additionalPdf: ArrayBuffer,
	insertAt: number
): Promise<Uint8Array> {
	const { PDFDocument } = await import('@cantoo/pdf-lib');

	const srcDoc = await PDFDocument.load(source);
	const addDoc = await PDFDocument.load(additionalPdf);
	const newDoc = await PDFDocument.create();

	const srcPageCount = srcDoc.getPageCount();
	const addPageCount = addDoc.getPageCount();

	// Copy pages before insertion point
	if (insertAt > 0) {
		const before = await newDoc.copyPages(
			srcDoc,
			Array.from({ length: insertAt }, (_, i) => i)
		);
		for (const p of before) newDoc.addPage(p);
	}

	// Copy all pages from the additional PDF
	const added = await newDoc.copyPages(
		addDoc,
		Array.from({ length: addPageCount }, (_, i) => i)
	);
	for (const p of added) newDoc.addPage(p);

	// Copy pages after insertion point
	if (insertAt < srcPageCount) {
		const after = await newDoc.copyPages(
			srcDoc,
			Array.from({ length: srcPageCount - insertAt }, (_, i) => i + insertAt)
		);
		for (const p of after) newDoc.addPage(p);
	}

	return newDoc.save();
}
