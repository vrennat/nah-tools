/**
 * PDF Editor — Central reactive state (Svelte 5 runes).
 *
 * Manages dual-document architecture:
 *   - pdf-lib PDFDocument (source of truth for mutations)
 *   - PDF.js PDFDocumentProxy (rendering engine)
 *
 * All structural mutations follow: snapshot → mutate → reload both docs.
 */

import type { PageMeta, EditAnnotation, WatermarkConfig, PageNumberConfig, EditorTool } from './types';
import type { PDFDocumentProxy } from 'pdfjs-dist';

const PAGE_GAP = 16; // px between pages in main view

/** Determine max undo history entries based on file size */
function maxHistoryForSize(fileSize: number): number {
	if (fileSize < 5 * 1024 * 1024) return 20;
	if (fileSize < 15 * 1024 * 1024) return 10;
	return 5;
}

export function createEditorState() {
	// -- Core document state --
	let currentBytes = $state<Uint8Array | null>(null);
	let pdfJsDoc = $state<PDFDocumentProxy | null>(null);
	let pages = $state<PageMeta[]>([]);
	let loading = $state(false);
	let error = $state('');

	// -- Viewport --
	let zoom = $state(1.0);

	// -- Selection --
	let selectedPages = $state<Set<number>>(new Set());
	let activePage = $state(0);

	// -- File metadata --
	let fileName = $state('');
	let fileSize = $state(0);

	// -- Undo stack --
	let history = $state<Uint8Array[]>([]);
	let historyIndex = $state(-1);

	// -- Thumbnail data URLs (rendered separately at low res) --
	let thumbnails = $state<Map<number, string>>(new Map());

	// -- Content layer --
	let activeTool = $state<EditorTool>('select');
	let annotations = $state<EditAnnotation[]>([]);
	let watermark = $state<WatermarkConfig | null>(null);
	let pageNumbers = $state<PageNumberConfig | null>(null);

	// -- Derived --
	let canUndo = $derived(historyIndex > 0);
	let canRedo = $derived(historyIndex < history.length - 1);
	let hasDoc = $derived(currentBytes !== null);
	let pageCount = $derived(pages.length);
	let hasSelection = $derived(selectedPages.size > 0);

	/** Cumulative page top positions for virtualization */
	let pageOffsets = $derived.by(() => {
		const offsets: number[] = [];
		let cumHeight = 0;
		for (const page of pages) {
			offsets.push(cumHeight);
			const isRotated = page.rotation === 90 || page.rotation === 270;
			const h = (isRotated ? page.width : page.height) * zoom;
			cumHeight += h + PAGE_GAP;
		}
		return offsets;
	});

	let totalHeight = $derived.by(() => {
		if (pages.length === 0) return 0;
		const last = pages[pages.length - 1];
		const isRotated = last.rotation === 90 || last.rotation === 270;
		const lastH = (isRotated ? last.width : last.height) * zoom;
		return pageOffsets[pageOffsets.length - 1] + lastH;
	});

	// -- Internal helpers --

	async function loadPdfJs(bytes: Uint8Array): Promise<PDFDocumentProxy> {
		const { loadPdfDocument } = await import('./renderer');
		return loadPdfDocument(bytes);
	}

	function buildPageMeta(doc: PDFDocumentProxy, pageCount: number): PageMeta[] {
		// PDF.js doesn't expose page dimensions synchronously, so we do it
		// from pdf-lib bytes. But we need the data from the actual source of truth.
		// We'll extract from the loaded doc's catalog via a helper.
		// For now, use a placeholder — we'll populate async in reloadDocs.
		return Array.from({ length: pageCount }, (_, i) => ({
			index: i,
			width: 612, // default letter width
			height: 792, // default letter height
			rotation: 0,
			label: `Page ${i + 1}`
		}));
	}

	async function extractPageMeta(bytes: Uint8Array): Promise<PageMeta[]> {
		const { PDFDocument } = await import('@cantoo/pdf-lib');
		const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
		const count = doc.getPageCount();
		const meta: PageMeta[] = [];

		for (let i = 0; i < count; i++) {
			const page = doc.getPage(i);
			const { width, height } = page.getSize();
			const rotation = page.getRotation().angle;
			meta.push({
				index: i,
				width,
				height,
				rotation,
				label: `Page ${i + 1}`
			});
		}

		return meta;
	}

	async function reloadDocs(bytes: Uint8Array) {
		// Destroy previous PDF.js doc
		if (pdfJsDoc) {
			pdfJsDoc.destroy();
		}

		// Store a clean copy as the source of truth
		currentBytes = new Uint8Array(bytes);

		// Each consumer gets its own copy since PDF.js may transfer the buffer
		const [newPdfJsDoc, meta] = await Promise.all([
			loadPdfJs(new Uint8Array(bytes)),
			extractPageMeta(new Uint8Array(bytes))
		]);

		pdfJsDoc = newPdfJsDoc;
		pages = meta;
	}

	function pushHistory(bytes: Uint8Array) {
		const maxHistory = maxHistoryForSize(fileSize);
		// Truncate any redo entries
		const truncated = history.slice(0, historyIndex + 1);
		truncated.push(bytes);

		// Cap history
		if (truncated.length > maxHistory) {
			truncated.splice(0, truncated.length - maxHistory);
		}

		history = truncated;
		historyIndex = history.length - 1;
	}

	async function applyMutation(
		mutationFn: (source: ArrayBuffer) => Promise<Uint8Array>
	) {
		if (!currentBytes) return;
		error = '';
		loading = true;

		try {
			// Snapshot current state for undo
			pushHistory(currentBytes);

			const result = await mutationFn(currentBytes.slice().buffer);
			await reloadDocs(result);

			// Clear selection (page indices may have changed)
			selectedPages = new Set();

			// Regenerate thumbnails
			regenerateThumbnails();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Operation failed';
			// Revert history push on failure
			if (historyIndex > 0) {
				history = history.slice(0, -1);
				historyIndex = history.length - 1;
			}
		} finally {
			loading = false;
		}
	}

	// Thumbnail render version — incremented on each call to cancel stale renders
	let thumbVersion = 0;

	function regenerateThumbnails() {
		if (!currentBytes) return;
		const version = ++thumbVersion;
		const bytes = new Uint8Array(currentBytes);

		// Clear existing thumbnails so placeholders show
		thumbnails = new Map();

		// Fire-and-forget: render thumbnails progressively in the background
		(async () => {
			const thumbDoc = await loadPdfJs(bytes);
			if (version !== thumbVersion) { thumbDoc.destroy(); return; }

			const maxWidth = 150;
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d')!;

			for (let i = 0; i < thumbDoc.numPages; i++) {
				if (version !== thumbVersion) { thumbDoc.destroy(); return; }

				const page = await thumbDoc.getPage(i + 1);
				const viewport = page.getViewport({ scale: 1 });
				const scale = maxWidth / viewport.width;
				const scaled = page.getViewport({ scale });

				canvas.width = scaled.width;
				canvas.height = scaled.height;
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				await page.render({ canvas, viewport: scaled }).promise;

				if (version !== thumbVersion) { thumbDoc.destroy(); return; }

				// Update progressively — each thumbnail appears as it renders
				const updated = new Map(thumbnails);
				updated.set(i, canvas.toDataURL('image/png'));
				thumbnails = updated;

				page.cleanup();
			}

			thumbDoc.destroy();
		})();
	}

	// -- Public API --

	async function loadFile(file: File) {
		loading = true;
		error = '';
		fileName = file.name;
		fileSize = file.size;

		try {
			const buf = await file.arrayBuffer();
			const bytes = new Uint8Array(buf);

			await reloadDocs(bytes);

			// Initialize history with the original document
			history = [bytes];
			historyIndex = 0;

			selectedPages = new Set();
			activePage = 0;
			zoom = 1.0;

			regenerateThumbnails();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		} finally {
			loading = false;
		}
	}

	async function reorderPagesAction(newOrder: number[]) {
		const { reorderPages: reorder } = await import('./mutations');
		await applyMutation((source) => reorder(source, newOrder));
	}

	async function rotateSelected(degrees: number) {
		if (selectedPages.size === 0) return;
		const indices = [...selectedPages];
		const { rotatePages: rotate } = await import('./mutations');
		await applyMutation((source) => rotate(source, indices, degrees));
	}

	async function deleteSelected() {
		if (selectedPages.size === 0) return;
		if (selectedPages.size >= pages.length) {
			error = 'Cannot delete all pages';
			return;
		}
		const indices = [...selectedPages];
		const { deletePages } = await import('./mutations');
		await applyMutation((source) => deletePages(source, indices));
	}

	async function mergeFile(file: File, insertAt: number) {
		const buf = await file.arrayBuffer();
		const { mergeAtPosition } = await import('./mutations');
		await applyMutation((source) => mergeAtPosition(source, buf, insertAt));
	}

	async function undo() {
		if (!canUndo) return;
		loading = true;
		try {
			historyIndex--;
			await reloadDocs(history[historyIndex]);
			selectedPages = new Set();
			regenerateThumbnails();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Undo failed';
		} finally {
			loading = false;
		}
	}

	async function redo() {
		if (!canRedo) return;
		loading = true;
		try {
			historyIndex++;
			await reloadDocs(history[historyIndex]);
			selectedPages = new Set();
			regenerateThumbnails();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Redo failed';
		} finally {
			loading = false;
		}
	}

	function setZoom(level: number) {
		zoom = Math.max(0.25, Math.min(4.0, level));
	}

	function selectPage(index: number, mode: 'single' | 'toggle' | 'range' = 'single') {
		switch (mode) {
			case 'single':
				selectedPages = new Set([index]);
				break;
			case 'toggle': {
				const next = new Set(selectedPages);
				if (next.has(index)) {
					next.delete(index);
				} else {
					next.add(index);
				}
				selectedPages = next;
				break;
			}
			case 'range': {
				const anchor = activePage;
				const start = Math.min(anchor, index);
				const end = Math.max(anchor, index);
				const next = new Set(selectedPages);
				for (let i = start; i <= end; i++) {
					next.add(i);
				}
				selectedPages = next;
				break;
			}
		}
		activePage = index;
	}

	function selectAll() {
		selectedPages = new Set(pages.map((_, i) => i));
	}

	function clearSelection() {
		selectedPages = new Set();
	}

	// -- Content layer actions --

	function setTool(tool: EditorTool) {
		activeTool = tool;
	}

	function addAnnotation(annotation: EditAnnotation) {
		annotations = [...annotations, annotation];
	}

	function removeAnnotation(index: number) {
		annotations = annotations.filter((_, i) => i !== index);
	}

	function clearAnnotations() {
		annotations = [];
	}

	function setWatermark(config: WatermarkConfig | null) {
		watermark = config;
	}

	function setPageNumbers(config: PageNumberConfig | null) {
		pageNumbers = config;
	}

	// -- Export --

	async function exportPdf() {
		if (!currentBytes) return;

		const { downloadPDF, makeFilename } = await import('./exporter');
		let bytes = currentBytes;

		// Apply annotations if any
		if (annotations.length > 0) {
			const { editPDF } = await import('./processor');
			bytes = await editPDF(bytes.slice().buffer, annotations);
		}

		// Apply watermark if configured
		if (watermark) {
			const { addWatermark } = await import('./processor');
			bytes = await addWatermark(bytes.slice().buffer, watermark);
		}

		// Apply page numbers if configured
		if (pageNumbers) {
			const { addPageNumbers } = await import('./processor');
			bytes = await addPageNumbers(bytes.slice().buffer, pageNumbers);
		}

		downloadPDF(bytes, makeFilename('edited', 'pdf'));
	}

	/** Get visible page range given scroll position and viewport height */
	function getVisibleRange(
		scrollTop: number,
		viewportHeight: number,
		buffer = 1
	): [number, number] {
		if (pages.length === 0) return [0, 0];

		let first = -1;
		let last = -1;

		for (let i = 0; i < pages.length; i++) {
			const pageTop = pageOffsets[i];
			const isRotated = pages[i].rotation === 90 || pages[i].rotation === 270;
			const pageHeight = (isRotated ? pages[i].width : pages[i].height) * zoom;
			const pageBottom = pageTop + pageHeight;

			if (pageBottom >= scrollTop && first === -1) first = i;
			if (pageTop <= scrollTop + viewportHeight) last = i;
		}

		if (first === -1) first = 0;
		if (last === -1) last = pages.length - 1;

		return [Math.max(0, first - buffer), Math.min(pages.length - 1, last + buffer)];
	}

	return {
		// Reactive getters
		get currentBytes() { return currentBytes; },
		get pdfJsDoc() { return pdfJsDoc; },
		get pages() { return pages; },
		get loading() { return loading; },
		get error() { return error; },
		get zoom() { return zoom; },
		get selectedPages() { return selectedPages; },
		get activePage() { return activePage; },
		get fileName() { return fileName; },
		get fileSize() { return fileSize; },
		get canUndo() { return canUndo; },
		get canRedo() { return canRedo; },
		get hasDoc() { return hasDoc; },
		get pageCount() { return pageCount; },
		get hasSelection() { return hasSelection; },
		get thumbnails() { return thumbnails; },
		get pageOffsets() { return pageOffsets; },
		get totalHeight() { return totalHeight; },
		get activeTool() { return activeTool; },
		get annotations() { return annotations; },
		get watermark() { return watermark; },
		get pageNumbers() { return pageNumbers; },

		// Actions
		loadFile,
		reorderPages: reorderPagesAction,
		rotateSelected,
		deleteSelected,
		mergeFile,
		undo,
		redo,
		setZoom,
		selectPage,
		selectAll,
		clearSelection,
		exportPdf,
		getVisibleRange,
		setTool,
		addAnnotation,
		removeAnnotation,
		clearAnnotations,
		setWatermark,
		setPageNumbers,
	};
}

export type EditorState = ReturnType<typeof createEditorState>;
