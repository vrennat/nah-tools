import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PDFDocument, PDFArray, PDFRawStream, decodePDFRawStream } from '@cantoo/pdf-lib';
import { ocrPDF } from './ocr';

const mock = vi.hoisted(() => ({
	word: 'Smoke', fail: false,
	terminate: vi.fn(), destroy: vi.fn(), cleanup: vi.fn()
}));

vi.mock('pdfjs-dist', () => ({
	GlobalWorkerOptions: {},
	getDocument: ({ data }: { data: ArrayBuffer }) => {
		// PDF.js hands its input to a worker, detaching the caller's buffer.
		// Real pdf-lib below must still be able to read the independent original.
		structuredClone(data, { transfer: [data] });
		return { promise: Promise.resolve({
		numPages: 1, destroy: mock.destroy,
		getPage: async () => ({
			getTextContent: async () => ({ items: [] }),
			getViewport: () => ({ width: 600, height: 600 }),
			render: () => ({ promise: Promise.resolve() }), cleanup: mock.cleanup
		})
	}) };
	}
}));

vi.mock('tesseract.js', () => ({ createWorker: async () => ({
	terminate: mock.terminate,
	// Model the installed Tesseract v7 contract: blocks are off unless requested.
	recognize: async (_canvas: unknown, _options: unknown, output?: { blocks?: boolean }) => {
		if (mock.fail) throw new Error('Recognition failed');
		return { data: { blocks: output?.blocks ? [{ paragraphs: [{ lines: [{ words: [
			{ text: mock.word, bbox: { x0: 30, y0: 30, x1: 180, y1: 60 } }
		] }] }] }] : null } };
	}
}) }));

beforeEach(() => {
	vi.clearAllMocks(); mock.word = 'Smoke'; mock.fail = false;
	vi.stubGlobal('document', { createElement: () => ({ width: 0, height: 0,
		getContext: () => ({ fillStyle: '', fillRect: () => {} })
	}) });
});
afterEach(() => vi.unstubAllGlobals());

async function blankPDF() {
	const doc = await PDFDocument.create(); doc.addPage([200, 200]);
	return (await doc.save()).buffer as ArrayBuffer;
}

describe('PDF OCR output', () => {
	it('embeds recognized words in the exported PDF under the v7 output contract', async () => {
		const result = await ocrPDF(await blankPDF(), { language: 'eng' });
		expect(result.wordsFound).toBe(1);
		const doc = await PDFDocument.load(result.pdfBytes);
		const streams = doc.getPage(0).node.Contents() as PDFArray;
		const text = Array.from({ length: streams.size() }, (_, index) => {
			const stream = doc.context.lookup(streams.get(index)) as PDFRawStream;
			return new TextDecoder().decode(decodePDFRawStream(stream).decode());
		}).join('');
		expect(text).toContain('<536D6F6B65> Tj'); // searchable PDF text operator: Smoke
		expect(mock.terminate).toHaveBeenCalledOnce();
		expect(mock.destroy).toHaveBeenCalledOnce();
	});
	it('releases both workers after recognition fails', async () => {
		mock.fail = true;
		await expect(ocrPDF(await blankPDF(), { language: 'eng' })).rejects.toThrow('Recognition failed');
		expect(mock.terminate).toHaveBeenCalledOnce();
		expect(mock.destroy).toHaveBeenCalledOnce();
	});
});
