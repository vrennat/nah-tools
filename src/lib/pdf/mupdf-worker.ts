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

	// mupdf objects live on the WASM heap and must be explicitly freed;
	// relying on GC causes OOM for large documents.
	const inputBuf = new mupdf.Buffer(new Uint8Array(data));
	const doc = mupdf.Document.openDocument(inputBuf, 'application/pdf');
	inputBuf.destroy();

	const numPages = doc.countPages();
	const svgs: string[] = [];

	try {
		for (let i = 0; i < numPages; i++) {
			const page = doc.loadPage(i);
			const bounds = page.getBounds();

			const buf = new mupdf.Buffer();
			const writer = new mupdf.DocumentWriter(buf, 'svg', '');
			const dev = writer.beginPage(bounds);

			try {
				page.run(dev, mupdf.Matrix.identity);
			} finally {
				writer.endPage();
				writer.close();
				writer.destroy();
				dev.destroy();
				page.destroy();
			}

			svgs.push(buf.asString());
			buf.destroy();

			onProgress?.(i + 1, numPages);
		}
	} finally {
		doc.destroy();
	}

	return svgs;
}

const api = { pdfToSVG };
export type MuPDFWorkerAPI = typeof api;

Comlink.expose(api);
