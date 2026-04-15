/// <reference lib="webworker" />
import * as Comlink from 'comlink';

let mupdfModule: typeof import('mupdf') | null = null;

async function loadMuPDF() {
	if (mupdfModule) return mupdfModule;
	mupdfModule = await import('mupdf');
	return mupdfModule;
}

async function pdfToSVG(
	data: ArrayBuffer,
	onProgress?: (current: number, total: number) => void
): Promise<string[]> {
	const mupdf = await loadMuPDF();
	const doc = mupdf.Document.openDocument(
		new mupdf.Buffer(new Uint8Array(data)),
		'application/pdf'
	);
	const numPages = doc.countPages();
	const svgs: string[] = [];

	for (let i = 0; i < numPages; i++) {
		const page = doc.loadPage(i);
		const bounds = page.getBounds();

		const buf = new mupdf.Buffer();
		const writer = new mupdf.DocumentWriter(buf, 'svg', '');
		const dev = writer.beginPage(bounds);
		page.run(dev, mupdf.Matrix.identity);
		writer.endPage();
		writer.close();

		svgs.push(buf.asString());
		onProgress?.(i + 1, numPages);
	}

	return svgs;
}

const api = { pdfToSVG };
export type MuPDFWorkerAPI = typeof api;

Comlink.expose(api);
