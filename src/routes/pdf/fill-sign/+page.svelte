<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import SignaturePad from '$components/pdf/SignaturePad.svelte';
	import type { SignatureField, TextFieldFill } from '$pdf/types';

	// File state
	let files = $state<File[]>([]);
	let file = $derived(files[0]);

	// Page rendering
	let pageCanvases = $state<HTMLCanvasElement[]>([]);
	let pageContainers = $state<HTMLDivElement[]>([]);
	let pdfDimensions = $state<{ width: number; height: number }[]>([]);
	let pageCount = $state(0);
	let pdfBytes = $state<ArrayBuffer | null>(null);
	let renderScales = $state<number[]>([]);

	// Tool mode
	type ToolMode = 'text' | 'signature';
	let mode = $state<ToolMode>('text');

	// Text field config
	let textFontSize = $state(14);
	let textColor = $state('#000000');

	// Placed items
	let textFields = $state<(TextFieldFill & { id: string; screenX: number; screenY: number })[]>([]);
	let signatures = $state<
		(SignatureField & { id: string; screenX: number; screenY: number })[]
	>([]);

	// Active editing
	let editingTextId = $state<string | null>(null);
	let editingTextValue = $state('');

	// Signature creation
	let activeSignatureData = $state<string | null>(null);
	let showSignaturePad = $state(false);

	// Dragging
	let draggingId = $state<string | null>(null);
	let dragType = $state<'text' | 'signature' | null>(null);
	let dragOffset = $state({ x: 0, y: 0 });

	// Resizing
	let resizingId = $state<string | null>(null);
	let resizeStartW = $state(0);
	let resizeStartH = $state(0);
	let resizeStartX = $state(0);

	// Processing
	let processing = $state(false);
	let error = $state('');

	let hasItems = $derived(textFields.length > 0 || signatures.length > 0);
	let canApply = $derived(!!file && hasItems && !processing);

	function genId(): string {
		return Math.random().toString(36).slice(2, 10);
	}

	// Render PDF pages when file changes
	$effect(() => {
		if (file) {
			renderPages();
		} else {
			pageCount = 0;
			pdfBytes = null;
			pdfDimensions = [];
			renderScales = [];
			textFields = [];
			signatures = [];
		}
	});

	async function renderPages() {
		if (!file) return;
		error = '';

		try {
			const buf = await file.arrayBuffer();
			pdfBytes = buf;

			const pdfjs = await import('pdfjs-dist');
			pdfjs.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).href;

			const doc = await pdfjs.getDocument({ data: buf }).promise;
			pageCount = doc.numPages;
			pdfDimensions = [];
			renderScales = [];

			// Wait for DOM to create canvases
			await new Promise((r) => requestAnimationFrame(r));
			await new Promise((r) => requestAnimationFrame(r));

			for (let i = 0; i < doc.numPages; i++) {
				const page = await doc.getPage(i + 1);
				const viewport = page.getViewport({ scale: 1 });
				pdfDimensions[i] = { width: viewport.width, height: viewport.height };

				const container = pageContainers[i];
				if (!container) continue;
				const containerWidth = container.clientWidth;
				const scale = containerWidth / viewport.width;
				renderScales[i] = scale;

				const scaled = page.getViewport({ scale });
				const canvas = pageCanvases[i];
				if (!canvas) continue;

				canvas.width = scaled.width;
				canvas.height = scaled.height;
				const ctx = canvas.getContext('2d')!;
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				await page.render({ canvas, viewport: scaled }).promise;
				page.cleanup();
			}

			doc.destroy();
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to render PDF';
		}
	}

	function handlePageClick(e: MouseEvent, pageIndex: number) {
		// Don't place if we clicked on an existing overlay or are dragging/resizing
		if (draggingId || resizingId) return;
		const target = e.target as HTMLElement;
		if (target.closest('[data-overlay]')) return;

		const container = pageContainers[pageIndex];
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const screenX = e.clientX - rect.left;
		const screenY = e.clientY - rect.top;

		if (mode === 'text') {
			const id = genId();
			textFields = [
				...textFields,
				{
					id,
					pageIndex,
					x: 0,
					y: 0,
					text: '',
					fontSize: textFontSize,
					color: textColor,
					screenX,
					screenY
				}
			];
			editingTextId = id;
			editingTextValue = '';
		} else if (mode === 'signature' && activeSignatureData) {
			const sigWidth = 200;
			const sigHeight = 60;
			signatures = [
				...signatures,
				{
					id: genId(),
					pageIndex,
					x: 0,
					y: 0,
					width: sigWidth,
					height: sigHeight,
					data: activeSignatureData,
					screenX: screenX - sigWidth / 2,
					screenY: screenY - sigHeight / 2
				}
			];
		}
	}

	function commitTextEdit() {
		if (!editingTextId) return;
		if (!editingTextValue.trim()) {
			// Remove empty text fields
			textFields = textFields.filter((t) => t.id !== editingTextId);
		} else {
			textFields = textFields.map((t) =>
				t.id === editingTextId ? { ...t, text: editingTextValue } : t
			);
		}
		editingTextId = null;
		editingTextValue = '';
	}

	function handleTextKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			commitTextEdit();
		} else if (e.key === 'Escape') {
			// Remove the field if empty
			if (!editingTextValue.trim()) {
				textFields = textFields.filter((t) => t.id !== editingTextId);
			}
			editingTextId = null;
			editingTextValue = '';
		}
	}

	function removeTextField(id: string) {
		textFields = textFields.filter((t) => t.id !== id);
	}

	function removeSignature(id: string) {
		signatures = signatures.filter((s) => s.id !== id);
	}

	function handleSignatureSave(dataUrl: string) {
		activeSignatureData = dataUrl;
		showSignaturePad = false;
	}

	// Drag handlers
	function startDrag(e: MouseEvent, id: string, type: 'text' | 'signature') {
		e.preventDefault();
		e.stopPropagation();
		const target = e.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		dragOffset = { x: e.clientX - rect.left, y: e.clientY - rect.top };
		draggingId = id;
		dragType = type;

		function onMove(ev: MouseEvent) {
			if (!draggingId) return;
			const items = dragType === 'text' ? textFields : signatures;
			const item = items.find((i) => i.id === draggingId);
			if (!item) return;

			const container = pageContainers[item.pageIndex];
			if (!container) return;
			const containerRect = container.getBoundingClientRect();
			const newScreenX = ev.clientX - containerRect.left - dragOffset.x;
			const newScreenY = ev.clientY - containerRect.top - dragOffset.y;

			if (dragType === 'text') {
				textFields = textFields.map((t) =>
					t.id === draggingId ? { ...t, screenX: newScreenX, screenY: newScreenY } : t
				);
			} else {
				signatures = signatures.map((s) =>
					s.id === draggingId ? { ...s, screenX: newScreenX, screenY: newScreenY } : s
				);
			}
		}

		function onUp() {
			draggingId = null;
			dragType = null;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	// Resize handler for signatures
	function startResize(e: MouseEvent, id: string) {
		e.preventDefault();
		e.stopPropagation();
		const sig = signatures.find((s) => s.id === id);
		if (!sig) return;
		resizingId = id;
		resizeStartW = sig.width;
		resizeStartH = sig.height;
		resizeStartX = e.clientX;

		function onMove(ev: MouseEvent) {
			if (!resizingId) return;
			const dx = ev.clientX - resizeStartX;
			const newW = Math.max(40, resizeStartW + dx);
			const aspect = resizeStartH / resizeStartW;
			const newH = newW * aspect;
			signatures = signatures.map((s) =>
				s.id === resizingId ? { ...s, width: newW, height: newH } : s
			);
		}

		function onUp() {
			resizingId = null;
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onUp);
		}

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onUp);
	}

	/** Convert screen coordinates to PDF points */
	function screenToPdf(
		screenX: number,
		screenY: number,
		pageIndex: number,
		elementHeight: number = 0
	): { x: number; y: number } {
		const scale = renderScales[pageIndex] || 1;
		const dims = pdfDimensions[pageIndex];
		if (!dims) return { x: 0, y: 0 };
		// PDF coordinate system: origin at bottom-left, y goes up
		const pdfX = screenX / scale;
		const pdfY = dims.height - (screenY + elementHeight) / scale;
		return { x: pdfX, y: pdfY };
	}

	function screenSizeToPdf(screenW: number, screenH: number, pageIndex: number) {
		const scale = renderScales[pageIndex] || 1;
		return { width: screenW / scale, height: screenH / scale };
	}

	async function apply() {
		if (!canApply || !pdfBytes) return;
		processing = true;
		error = '';

		try {
			const { fillAndSignPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			// Convert all text fields from screen coords to PDF coords
			const pdfTextFields: TextFieldFill[] = textFields.map((tf) => {
				// Estimate text height based on font size and scale
				const scale = renderScales[tf.pageIndex] || 1;
				const screenTextHeight = tf.fontSize * scale;
				const { x, y } = screenToPdf(tf.screenX, tf.screenY, tf.pageIndex, screenTextHeight);
				return {
					pageIndex: tf.pageIndex,
					x,
					y,
					text: tf.text,
					fontSize: tf.fontSize,
					color: tf.color
				};
			});

			// Convert all signatures from screen coords to PDF coords
			const pdfSignatures: SignatureField[] = signatures.map((sig) => {
				const { x, y } = screenToPdf(sig.screenX, sig.screenY, sig.pageIndex, sig.height);
				const { width, height } = screenSizeToPdf(sig.width, sig.height, sig.pageIndex);
				return {
					pageIndex: sig.pageIndex,
					x,
					y,
					width,
					height,
					data: sig.data
				};
			});

			const result = await fillAndSignPDF(pdfBytes, pdfTextFields, pdfSignatures);
			downloadPDF(result, makeFilename('filled-signed', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to apply changes';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Fill & Sign PDF Online Free | nah</title>
	<meta
		name="description"
		content="Add text and signatures to your PDF. Draw, type, or upload a signature. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Fill & Sign"
	description="Add text and signatures to your PDF documents."
>
	<section class="mx-auto max-w-4xl space-y-6">
		{#if !file}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />
			</div>
		{:else}
			<!-- Toolbar -->
			<div
				class="sticky top-0 z-20 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm"
			>
				<div class="flex gap-1 rounded-lg border border-border bg-surface-alt p-1">
					<button
						type="button"
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {mode === 'text'
							? 'bg-accent text-white'
							: 'text-text-muted hover:text-text'}"
						onclick={() => (mode = 'text')}
					>
						<svg
							class="mr-1 inline-block h-3.5 w-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						Text
					</button>
					<button
						type="button"
						class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {mode === 'signature'
							? 'bg-accent text-white'
							: 'text-text-muted hover:text-text'}"
						onclick={() => (mode = 'signature')}
					>
						<svg
							class="mr-1 inline-block h-3.5 w-3.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
							/>
						</svg>
						Signature
					</button>
				</div>

				{#if mode === 'text'}
					<div class="flex items-center gap-2">
						<label for="fsFontSize" class="text-xs text-text-muted">Size</label>
						<select
							id="fsFontSize"
							bind:value={textFontSize}
							class="rounded-md border border-border bg-surface px-2 py-1 text-sm"
						>
							{#each [10, 12, 14, 16, 18, 20, 24, 28, 32, 36] as size}
								<option value={size}>{size}pt</option>
							{/each}
						</select>
						<input
							type="color"
							bind:value={textColor}
							class="h-7 w-8 rounded border border-border"
							title="Text color"
						/>
					</div>
				{/if}

				{#if mode === 'signature'}
					<button
						type="button"
						class="rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:border-accent/50 hover:text-accent"
						onclick={() => (showSignaturePad = !showSignaturePad)}
					>
						{activeSignatureData ? 'Change Signature' : 'Create Signature'}
					</button>
					{#if activeSignatureData}
						<img
							src={activeSignatureData}
							alt="Active signature"
							class="h-8 rounded border border-border bg-white object-contain px-2"
						/>
						<span class="text-xs text-text-muted">Click on a page to place</span>
					{/if}
				{/if}

				<div class="ml-auto flex items-center gap-2">
					<button
						type="button"
						class="rounded-full border border-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text"
						onclick={() => {
							files = [];
						}}
					>
						Change PDF
					</button>
					<button
						type="button"
						class="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
						disabled={!canApply}
						onclick={apply}
					>
						{#if processing}
							Applying...
						{:else}
							Apply & Download
						{/if}
					</button>
				</div>
			</div>

			<!-- Signature Pad (shown when creating) -->
			{#if showSignaturePad && mode === 'signature'}
				<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
					<h3 class="mb-4 text-sm font-medium text-text">Create your signature</h3>
					<SignaturePad onSave={handleSignatureSave} />
				</div>
			{/if}

			<!-- PDF Pages -->
			<div class="space-y-4">
				{#each Array(pageCount) as _, i}
					<div
						bind:this={pageContainers[i]}
						class="relative rounded-xl border border-border bg-white shadow-sm"
						role="button"
						tabindex="0"
						onclick={(e) => handlePageClick(e, i)}
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								const rect = pageContainers[i].getBoundingClientRect();
								const fakeEvent = {
									clientX: rect.left + rect.width / 2,
									clientY: rect.top + rect.height / 2,
									target: e.target,
									preventDefault: () => {},
									stopPropagation: () => {}
								} as unknown as MouseEvent;
								handlePageClick(fakeEvent, i);
							}
						}}
					>
						<!-- Page label -->
						<div
							class="absolute left-2 top-2 z-10 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
						>
							Page {i + 1}
						</div>

						<canvas
							bind:this={pageCanvases[i]}
							class="w-full rounded-xl"
						></canvas>

						<!-- Text field overlays -->
						{#each textFields.filter((t) => t.pageIndex === i) as tf (tf.id)}
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div
								data-overlay
								class="group absolute cursor-move"
								style="left: {tf.screenX}px; top: {tf.screenY}px"
								onmousedown={(e) => {
									if (editingTextId === tf.id) return;
									startDrag(e, tf.id, 'text');
								}}
								role="group"
							>
								{#if editingTextId === tf.id}
									<!-- svelte-ignore a11y_autofocus -->
									<input
										type="text"
										bind:value={editingTextValue}
										onkeydown={handleTextKeydown}
										onblur={commitTextEdit}
										class="min-w-[100px] border-b-2 border-accent bg-transparent px-1 outline-none"
										style="font-size: {tf.fontSize}px; color: {tf.color}"
										autofocus={true}
									/>
								{:else}
									<!-- svelte-ignore a11y_no_static_element_interactions -->
									<span
										class="inline-block whitespace-nowrap rounded-sm ring-accent/30 hover:ring-2"
										style="font-size: {tf.fontSize}px; color: {tf.color}"
										ondblclick={() => {
											editingTextId = tf.id;
											editingTextValue = tf.text;
										}}
									>
										{tf.text}
									</span>
									<button
										type="button"
										class="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
										onclick={(e) => { e.stopPropagation(); removeTextField(tf.id); }}
										aria-label="Remove text"
									>
										x
									</button>
								{/if}
							</div>
						{/each}

						<!-- Signature overlays -->
						{#each signatures.filter((s) => s.pageIndex === i) as sig (sig.id)}
							<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
							<div
								data-overlay
								class="group absolute cursor-move"
								style="left: {sig.screenX}px; top: {sig.screenY}px; width: {sig.width}px; height: {sig.height}px"
								onmousedown={(e) => startDrag(e, sig.id, 'signature')}
								role="group"
							>
								<img
									src={sig.data}
									alt="Signature"
									class="h-full w-full object-contain"
									draggable="false"
								/>
								<!-- Resize handle -->
								<div
									class="absolute -bottom-1 -right-1 hidden h-4 w-4 cursor-se-resize rounded-sm bg-accent group-hover:block"
									onmousedown={(e) => startResize(e, sig.id)}
									role="slider"
									tabindex="0"
									aria-label="Resize signature"
									aria-valuemin={40}
									aria-valuenow={sig.width}
								></div>
								<!-- Delete button -->
								<button
									type="button"
									class="absolute -right-2 -top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white group-hover:flex"
									onclick={(e) => { e.stopPropagation(); removeSignature(sig.id); }}
									aria-label="Remove signature"
								>
									x
								</button>
							</div>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<p role="alert" class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
		{/if}

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
