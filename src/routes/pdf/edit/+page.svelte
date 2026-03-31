<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { EditAnnotation } from '$pdf/types';

	type Mode = 'text' | 'draw' | 'image';

	let files = $state<File[]>([]);
	let file = $derived(files[0]);
	let processing = $state(false);
	let error = $state('');
	let mode = $state<Mode>('text');

	// Page rendering state
	let pageCanvases = $state<HTMLCanvasElement[]>([]);
	let pageDimensions = $state<{ width: number; height: number; pdfWidth: number; pdfHeight: number }[]>([]);
	let pagesLoaded = $state(false);
	let pagesContainer: HTMLDivElement | undefined = $state();

	// Annotations
	let annotations = $state<EditAnnotation[]>([]);

	// Text mode options
	let textContent = $state('');
	let textFontSize = $state(16);
	let textColor = $state('#000000');

	// Draw mode options
	let drawColor = $state('#000000');
	let drawWidth = $state(2);
	let isDrawing = $state(false);
	let currentPath = $state<{ x: number; y: number }[]>([]);
	let currentDrawPageIndex = $state(-1);

	// Image mode options
	let imageFiles = $state<File[]>([]);
	let imageData = $state<ArrayBuffer | null>(null);
	let imageType = $state<'png' | 'jpg'>('png');
	let imageDimW = $state(150);
	let imageDimH = $state(150);

	// Overlay canvases for drawing
	let overlayCanvases = $state<HTMLCanvasElement[]>([]);

	let canApply = $derived(!!file && annotations.length > 0 && !processing);

	// Render PDF pages when file changes
	$effect(() => {
		if (file) {
			loadPages();
		} else {
			pagesLoaded = false;
			pageCanvases = [];
			pageDimensions = [];
			annotations = [];
		}
	});

	// Handle image file upload
	$effect(() => {
		const imgFile = imageFiles[0];
		if (imgFile) {
			const ext = imgFile.name.split('.').pop()?.toLowerCase();
			imageType = ext === 'jpg' || ext === 'jpeg' ? 'jpg' : 'png';
			imgFile.arrayBuffer().then((buf) => {
				imageData = buf;
				// Get natural dimensions
				const url = URL.createObjectURL(imgFile);
				const img = new Image();
				img.onload = () => {
					const scale = Math.min(150 / img.width, 150 / img.height, 1);
					imageDimW = Math.round(img.width * scale);
					imageDimH = Math.round(img.height * scale);
					URL.revokeObjectURL(url);
				};
				img.src = url;
			});
		}
	});

	// Redraw overlays when annotations change
	$effect(() => {
		// Access annotations to track changes
		const _ = annotations.length;
		redrawOverlays();
	});

	async function loadPages() {
		if (!file) return;
		error = '';
		pagesLoaded = false;

		try {
			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).href;

			const buf = await file.arrayBuffer();
			const doc = await pdfjs.getDocument({ data: buf }).promise;
			const canvases: HTMLCanvasElement[] = [];
			const dims: typeof pageDimensions = [];

			const maxRenderWidth = 700;

			for (let i = 0; i < doc.numPages; i++) {
				const page = await doc.getPage(i + 1);
				const viewport = page.getViewport({ scale: 1 });
				const scale = Math.min(maxRenderWidth / viewport.width, 1.5);
				const scaled = page.getViewport({ scale });

				const canvas = document.createElement('canvas');
				canvas.width = scaled.width;
				canvas.height = scaled.height;

				await page.render({ canvas, viewport: scaled }).promise;
				canvases.push(canvas);
				dims.push({
					width: scaled.width,
					height: scaled.height,
					pdfWidth: viewport.width,
					pdfHeight: viewport.height
				});

				page.cleanup();
			}

			doc.destroy();
			pageCanvases = canvases;
			pageDimensions = dims;
			pagesLoaded = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load PDF';
		}
	}

	function getScaleForPage(pageIndex: number): { sx: number; sy: number } {
		const dim = pageDimensions[pageIndex];
		if (!dim) return { sx: 1, sy: 1 };
		return {
			sx: dim.pdfWidth / dim.width,
			sy: dim.pdfHeight / dim.height
		};
	}

	function screenToPdf(pageIndex: number, screenX: number, screenY: number): { x: number; y: number } {
		const { sx, sy } = getScaleForPage(pageIndex);
		const dim = pageDimensions[pageIndex];
		// PDF y-axis is bottom-up
		return {
			x: screenX * sx,
			y: (dim.height - screenY) * sy
		};
	}

	function pdfToScreen(pageIndex: number, pdfX: number, pdfY: number): { x: number; y: number } {
		const { sx, sy } = getScaleForPage(pageIndex);
		const dim = pageDimensions[pageIndex];
		return {
			x: pdfX / sx,
			y: dim.height - pdfY / sy
		};
	}

	function handlePageClick(e: MouseEvent, pageIndex: number) {
		if (mode === 'draw' || isDrawing) return;

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const pdf = screenToPdf(pageIndex, screenX, screenY);

		if (mode === 'text' && textContent.trim()) {
			annotations = [
				...annotations,
				{
					type: 'text',
					pageIndex,
					x: pdf.x,
					y: pdf.y,
					text: textContent.trim(),
					fontSize: textFontSize,
					color: textColor
				}
			];
		} else if (mode === 'image' && imageData) {
			const { sx, sy } = getScaleForPage(pageIndex);
			annotations = [
				...annotations,
				{
					type: 'image',
					pageIndex,
					x: pdf.x,
					y: pdf.y - imageDimH * sy,
					width: imageDimW * sx,
					height: imageDimH * sy,
					data: imageData,
					imageType
				}
			];
		}
	}

	function handleDrawStart(e: MouseEvent, pageIndex: number) {
		if (mode !== 'draw') return;
		e.preventDefault();
		isDrawing = true;
		currentDrawPageIndex = pageIndex;

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const pdf = screenToPdf(pageIndex, screenX, screenY);
		currentPath = [{ x: pdf.x, y: pdf.y }];
	}

	function handleDrawMove(e: MouseEvent, pageIndex: number) {
		if (!isDrawing || mode !== 'draw' || currentDrawPageIndex !== pageIndex) return;
		e.preventDefault();

		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;
		const pdf = screenToPdf(pageIndex, screenX, screenY);
		currentPath = [...currentPath, { x: pdf.x, y: pdf.y }];

		// Draw live preview on overlay canvas
		drawLivePreview(pageIndex);
	}

	function handleDrawEnd() {
		if (!isDrawing || currentPath.length < 2) {
			isDrawing = false;
			currentPath = [];
			currentDrawPageIndex = -1;
			return;
		}

		annotations = [
			...annotations,
			{
				type: 'draw',
				pageIndex: currentDrawPageIndex,
				paths: [currentPath],
				strokeColor: drawColor,
				strokeWidth: drawWidth * getScaleForPage(currentDrawPageIndex).sx
			}
		];

		isDrawing = false;
		currentPath = [];
		currentDrawPageIndex = -1;
	}

	function drawLivePreview(pageIndex: number) {
		const canvas = overlayCanvases[pageIndex];
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Redraw all existing annotations for this page first
		redrawSingleOverlay(pageIndex);

		// Then draw the current live path
		if (currentPath.length < 2) return;
		ctx.strokeStyle = drawColor;
		ctx.lineWidth = drawWidth;
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';
		ctx.beginPath();

		const first = pdfToScreen(pageIndex, currentPath[0].x, currentPath[0].y);
		ctx.moveTo(first.x, first.y);

		for (let i = 1; i < currentPath.length; i++) {
			const pt = pdfToScreen(pageIndex, currentPath[i].x, currentPath[i].y);
			ctx.lineTo(pt.x, pt.y);
		}
		ctx.stroke();
	}

	function redrawOverlays() {
		for (let i = 0; i < overlayCanvases.length; i++) {
			redrawSingleOverlay(i);
		}
	}

	function redrawSingleOverlay(pageIndex: number) {
		const canvas = overlayCanvases[pageIndex];
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const dim = pageDimensions[pageIndex];
		if (!dim) return;

		ctx.clearRect(0, 0, dim.width, dim.height);

		const pageAnnotations = annotations.filter((a) => a.pageIndex === pageIndex);

		for (const ann of pageAnnotations) {
			if (ann.type === 'text') {
				const screen = pdfToScreen(pageIndex, ann.x, ann.y);
				const { sx } = getScaleForPage(pageIndex);
				ctx.font = `${ann.fontSize / sx}px Helvetica, Arial, sans-serif`;
				ctx.fillStyle = ann.color;
				ctx.textBaseline = 'alphabetic';
				ctx.fillText(ann.text, screen.x, screen.y);
			} else if (ann.type === 'draw') {
				const { sx } = getScaleForPage(pageIndex);
				ctx.strokeStyle = ann.strokeColor;
				ctx.lineWidth = ann.strokeWidth / sx;
				ctx.lineCap = 'round';
				ctx.lineJoin = 'round';

				for (const path of ann.paths) {
					if (path.length < 2) continue;
					ctx.beginPath();
					const first = pdfToScreen(pageIndex, path[0].x, path[0].y);
					ctx.moveTo(first.x, first.y);
					for (let i = 1; i < path.length; i++) {
						const pt = pdfToScreen(pageIndex, path[i].x, path[i].y);
						ctx.lineTo(pt.x, pt.y);
					}
					ctx.stroke();
				}
			} else if (ann.type === 'image') {
				const screen = pdfToScreen(pageIndex, ann.x, ann.y + ann.height);
				const { sx, sy } = getScaleForPage(pageIndex);
				const w = ann.width / sx;
				const h = ann.height / sy;

				// Draw placeholder rectangle
				ctx.strokeStyle = '#3b82f6';
				ctx.lineWidth = 1;
				ctx.setLineDash([4, 4]);
				ctx.strokeRect(screen.x, screen.y, w, h);
				ctx.setLineDash([]);

				// Draw image if available
				const blob = new Blob([ann.data], { type: ann.imageType === 'png' ? 'image/png' : 'image/jpeg' });
				const url = URL.createObjectURL(blob);
				const img = new Image();
				img.onload = () => {
					ctx.drawImage(img, screen.x, screen.y, w, h);
					URL.revokeObjectURL(url);
				};
				img.src = url;
			}
		}
	}

	function removeAnnotation(index: number) {
		annotations = annotations.filter((_, i) => i !== index);
	}

	function annotationLabel(ann: EditAnnotation, index: number): string {
		if (ann.type === 'text') return `Text: "${ann.text.slice(0, 20)}${ann.text.length > 20 ? '...' : ''}"`;
		if (ann.type === 'draw') return `Drawing (page ${ann.pageIndex + 1})`;
		if (ann.type === 'image') return `Image (page ${ann.pageIndex + 1})`;
		return `Annotation ${index + 1}`;
	}

	async function apply() {
		if (!canApply || !file) return;
		processing = true;
		error = '';

		try {
			const { editPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const result = await editPDF(buf, annotations);
			downloadPDF(result, makeFilename('edited', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to apply edits';
		} finally {
			processing = false;
		}
	}

	function setOverlayCanvas(el: HTMLCanvasElement, pageIndex: number) {
		overlayCanvases[pageIndex] = el;
		redrawSingleOverlay(pageIndex);
	}
</script>

<svelte:head>
	<title>Edit PDF Online Free — Add Text, Images, Drawings | nah</title>
	<meta
		name="description"
		content="Add text, images, and freehand drawings to your PDF. Free, no upload — processed entirely in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Edit PDF"
	description="Add text, images, and drawings to your PDF."
>
	<section class="mx-auto max-w-4xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if file && pagesLoaded}
				<!-- Toolbar -->
				<div class="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface-alt p-3">
					<div class="flex gap-1">
						<button
							type="button"
							class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {mode === 'text' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface hover:text-text'}"
							onclick={() => (mode = 'text')}
						>
							<svg class="mr-1 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
							</svg>
							Text
						</button>
						<button
							type="button"
							class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {mode === 'draw' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface hover:text-text'}"
							onclick={() => (mode = 'draw')}
						>
							<svg class="mr-1 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
							</svg>
							Draw
						</button>
						<button
							type="button"
							class="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors {mode === 'image' ? 'bg-accent text-white' : 'text-text-muted hover:bg-surface hover:text-text'}"
							onclick={() => (mode = 'image')}
						>
							<svg class="mr-1 inline-block h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
							Image
						</button>
					</div>

					<div class="ml-auto flex flex-wrap items-center gap-3">
						{#if mode === 'text'}
							<input
								type="text"
								bind:value={textContent}
								placeholder="Type text to place..."
								class="w-48 rounded-lg border border-border bg-surface px-2 py-1 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							<label class="flex items-center gap-1 text-xs text-text-muted">
								Size
								<input
									type="number"
									min="8"
									max="120"
									bind:value={textFontSize}
									class="w-14 rounded border border-border bg-surface px-1 py-0.5 text-sm"
								/>
							</label>
							<input type="color" bind:value={textColor} class="h-7 w-8 rounded border border-border" />
						{:else if mode === 'draw'}
							<label class="flex items-center gap-1 text-xs text-text-muted">
								Width
								<input
									type="number"
									min="1"
									max="20"
									bind:value={drawWidth}
									class="w-14 rounded border border-border bg-surface px-1 py-0.5 text-sm"
								/>
							</label>
							<input type="color" bind:value={drawColor} class="h-7 w-8 rounded border border-border" />
						{:else if mode === 'image'}
							<FileDropZone
								accept=".png,.jpg,.jpeg"
								bind:files={imageFiles}
								label="Upload image"
								maxSizeMB={10}
							/>
							{#if imageData}
								<label class="flex items-center gap-1 text-xs text-text-muted">
									W
									<input
										type="number"
										min="10"
										max="2000"
										bind:value={imageDimW}
										class="w-16 rounded border border-border bg-surface px-1 py-0.5 text-sm"
									/>
								</label>
								<label class="flex items-center gap-1 text-xs text-text-muted">
									H
									<input
										type="number"
										min="10"
										max="2000"
										bind:value={imageDimH}
										class="w-16 rounded border border-border bg-surface px-1 py-0.5 text-sm"
									/>
								</label>
							{/if}
						{/if}
					</div>
				</div>

				{#if mode === 'text' && !textContent.trim()}
					<p class="mt-2 text-xs text-text-muted">Type text above, then click on a page to place it.</p>
				{:else if mode === 'draw'}
					<p class="mt-2 text-xs text-text-muted">Click and drag on a page to draw.</p>
				{:else if mode === 'image' && !imageData}
					<p class="mt-2 text-xs text-text-muted">Upload an image above, then click on a page to place it.</p>
				{:else if mode === 'image' && imageData}
					<p class="mt-2 text-xs text-text-muted">Click on a page to place the image.</p>
				{:else if mode === 'text' && textContent.trim()}
					<p class="mt-2 text-xs text-text-muted">Click on a page to place the text.</p>
				{/if}

				<!-- PDF pages with overlay -->
				<div class="mt-4 space-y-4" bind:this={pagesContainer}>
					{#each pageCanvases as pageCanvas, i}
						<div class="relative mx-auto" style="width: {pageDimensions[i].width}px; height: {pageDimensions[i].height}px;">
							<div class="rounded-lg border border-border shadow-sm overflow-hidden">
								<p class="bg-surface-alt px-3 py-1 text-xs text-text-muted">Page {i + 1}</p>
								<div
									class="relative"
									style="width: {pageDimensions[i].width}px; height: {pageDimensions[i].height}px; cursor: {mode === 'draw' ? 'crosshair' : 'pointer'};"
								>
									<!-- Rendered PDF page -->
									{@html `<img src="${pageCanvas.toDataURL()}" width="${pageDimensions[i].width}" height="${pageDimensions[i].height}" alt="Page ${i + 1}" style="position:absolute;top:0;left:0;pointer-events:none;" />`}

									<!-- Annotation overlay canvas -->
									<canvas
										width={pageDimensions[i].width}
										height={pageDimensions[i].height}
										style="position: absolute; top: 0; left: 0; width: {pageDimensions[i].width}px; height: {pageDimensions[i].height}px;"
										use:setOverlayCanvas={i}
										onclick={(e) => handlePageClick(e, i)}
										onmousedown={(e) => handleDrawStart(e, i)}
										onmousemove={(e) => handleDrawMove(e, i)}
										onmouseup={handleDrawEnd}
										onmouseleave={handleDrawEnd}
										role="button"
										tabindex="0"
									></canvas>
								</div>
							</div>
						</div>
					{/each}
				</div>

				<!-- Annotations list -->
				{#if annotations.length > 0}
					<div class="mt-4 space-y-2">
						<h3 class="text-sm font-medium text-text">Annotations ({annotations.length})</h3>
						<ul class="space-y-1">
							{#each annotations as ann, i}
								<li class="flex items-center justify-between rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm">
									<span class="text-text-muted">
										<span class="inline-block w-5 text-center font-mono text-xs">{i + 1}</span>
										{annotationLabel(ann, i)}
										<span class="text-xs text-text-muted">(page {ann.pageIndex + 1})</span>
									</span>
									<button
										type="button"
										class="text-text-muted transition-colors hover:text-error"
										onclick={() => removeAnnotation(i)}
										aria-label="Remove annotation {i + 1}"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canApply}
					onclick={apply}
				>
					{#if processing}
						Applying edits...
					{:else if !file}
						Upload a PDF
					{:else if annotations.length === 0}
						Add annotations to get started
					{:else}
						Apply & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
