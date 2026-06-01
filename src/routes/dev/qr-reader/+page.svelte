<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	// BarcodeDetector is not in the standard TypeScript DOM lib yet.
	// Declaring a minimal interface here keeps the rest of the code typed
	// without resorting to `any` everywhere.
	interface BarcodeDetectorResult {
		rawValue: string;
	}
	interface BarcodeDetectorConstructor {
		new (options: { formats: string[] }): {
			detect(source: HTMLCanvasElement): Promise<BarcodeDetectorResult[]>;
		};
	}

	type DecodeState =
		| { status: 'idle' }
		| { status: 'decoding' }
		| { status: 'success'; text: string; thumbnail: string }
		| { status: 'notfound'; thumbnail: string }
		| { status: 'error'; message: string; thumbnail: string };

	let decodeState = $state<DecodeState>({ status: 'idle' });
	let dragging = $state(false);
	let fileInput = $state<HTMLInputElement | undefined>(undefined);
	let canvasEl = $state<HTMLCanvasElement | undefined>(undefined);

	function detectContentType(text: string): string {
		if (text.startsWith('http://') || text.startsWith('https://')) return 'URL';
		if (text.startsWith('WIFI:')) return 'WiFi config';
		if (text.startsWith('BEGIN:VCARD')) return 'vCard';
		if (text.startsWith('mailto:') || text.startsWith('MATMSG:')) return 'Email';
		if (text.startsWith('tel:')) return 'Phone';
		return 'Text';
	}

	function isUrl(text: string): boolean {
		return text.startsWith('http://') || text.startsWith('https://');
	}

	async function decode(file: File): Promise<void> {
		decodeState = { status: 'decoding' };

		const objectUrl = URL.createObjectURL(file);
		const thumbnail = objectUrl;

		try {
			if (!canvasEl) throw new Error('Canvas not ready');

			// Load image to get dimensions and pixel data
			const img = new Image();
			await new Promise<void>((resolve, reject) => {
				img.onload = () => resolve();
				img.onerror = () => reject(new Error('Failed to load image'));
				img.src = objectUrl;
			});

			const ctx = canvasEl.getContext('2d');
			if (!ctx) throw new Error('Canvas context unavailable');

			canvasEl.width = img.naturalWidth;
			canvasEl.height = img.naturalHeight;
			ctx.drawImage(img, 0, 0);

			const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);

			let decoded: string | null = null;

			// Try BarcodeDetector first (Chromium 83+, Safari 17.4+)
			if ('BarcodeDetector' in window) {
				try {
					const BarcodeDetector = (
						window as unknown as { BarcodeDetector: BarcodeDetectorConstructor }
					).BarcodeDetector;
					const det = new BarcodeDetector({ formats: ['qr_code'] });
					const codes = await det.detect(canvasEl);
					if (codes.length > 0) {
						decoded = codes[0].rawValue;
					}
				} catch {
					// BarcodeDetector failed (e.g. format not supported) — fall through to jsQR
				}
			}

			// Fallback: jsQR
			if (decoded === null) {
				const jsQR = (await import('jsqr')).default;
				const result = jsQR(imageData.data, imageData.width, imageData.height);
				decoded = result?.data ?? null;
			}

			if (decoded !== null) {
				decodeState = { status: 'success', text: decoded, thumbnail };
			} else {
				decodeState = { status: 'notfound', thumbnail };
			}
		} catch (err) {
			URL.revokeObjectURL(objectUrl);
			decodeState = {
				status: 'error',
				message: err instanceof Error ? err.message : 'Unknown error',
				thumbnail: ''
			};
		}
		// objectUrl lives on in `thumbnail` for display; revoked on next decode or reset.
	}

	function revokeCurrent(): void {
		if (
			decodeState.status !== 'idle' &&
			decodeState.status !== 'decoding' &&
			'thumbnail' in decodeState &&
			decodeState.thumbnail
		) {
			URL.revokeObjectURL(decodeState.thumbnail);
		}
	}

	function handleFile(file: File): void {
		if (!file.type.startsWith('image/')) return;
		revokeCurrent();
		decode(file);
	}

	function handleDrop(e: DragEvent): void {
		e.preventDefault();
		dragging = false;
		const file = e.dataTransfer?.files[0];
		if (file) handleFile(file);
	}

	function handleDragOver(e: DragEvent): void {
		e.preventDefault();
		dragging = true;
	}

	function reset(): void {
		revokeCurrent();
		decodeState = { status: 'idle' };
	}

	// Clipboard paste support
	$effect(() => {
		function handlePaste(e: ClipboardEvent): void {
			const items = e.clipboardData?.items;
			if (!items) return;
			for (const item of items) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) {
						handleFile(file);
						break;
					}
				}
			}
		}
		window.addEventListener('paste', handlePaste);
		return () => window.removeEventListener('paste', handlePaste);
	});

	const faqs = [
		{
			question: 'Is my image uploaded to a server?',
			answer:
				'No. Decoding happens entirely in your browser — either via the native BarcodeDetector API or the jsQR library. Your image never leaves your device.'
		},
		{
			question: 'Which browsers support this tool?',
			answer:
				'All modern browsers work. Chrome/Edge use the native BarcodeDetector API for fast decoding. Firefox and older browsers fall back to jsQR, which runs fully in JavaScript and handles the same QR codes.'
		},
		{
			question: 'What image formats are supported?',
			answer:
				'Any format your browser can display: JPEG, PNG, WebP, GIF, BMP, AVIF, and HEIC (on Apple devices). The image is drawn to an off-screen canvas before decoding, so format support matches your browser.'
		}
	];
</script>

<!-- Hidden canvas used for pixel data extraction; must be in the DOM before decode() runs -->
<canvas bind:this={canvasEl} class="hidden" aria-hidden="true"></canvas>

<DevToolShell
	slug="qr-reader"
	title="QR Code Reader"
	tagline="Decode any QR code from an image — paste, drop, or browse. Runs entirely in your browser."
	description="Free QR code reader that decodes QR codes from images in your browser. No upload, no account. Supports JPEG, PNG, WebP, and more."
	{faqs}
>
	<div class="space-y-6">
		{#if decodeState.status === 'idle' || decodeState.status === 'decoding'}
			<!-- Drop zone -->
			<button
				type="button"
				class="w-full rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors {dragging
					? 'border-accent bg-accent/5'
					: 'border-border bg-surface-alt hover:border-accent/50'}"
				ondrop={handleDrop}
				ondragover={handleDragOver}
				ondragleave={() => (dragging = false)}
				onclick={() => fileInput?.click()}
				disabled={decodeState.status === 'decoding'}
			>
				{#if decodeState.status === 'decoding'}
					<div class="flex flex-col items-center gap-3">
						<!-- Spinner -->
						<svg
							class="h-8 w-8 animate-spin text-accent"
							fill="none"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							></path>
						</svg>
						<p class="text-sm font-medium text-text-muted">Decoding...</p>
					</div>
				{:else}
					<svg
						class="mx-auto mb-3 h-10 w-10 text-text-muted"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<rect x="3" y="3" width="7" height="7" stroke-width="1.5" rx="1" />
						<rect x="14" y="3" width="7" height="7" stroke-width="1.5" rx="1" />
						<rect x="3" y="14" width="7" height="7" stroke-width="1.5" rx="1" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 14h3m4 0v3m0 4h-7m3-4v4" />
					</svg>
					<p class="text-sm font-medium text-text">Drop an image here, or click to browse</p>
					<p class="mt-1 text-xs text-text-muted">
						Also supports
						<kbd class="rounded border border-border px-1 py-0.5 font-mono text-[10px]">Ctrl+V</kbd>
						/
						<kbd class="rounded border border-border px-1 py-0.5 font-mono text-[10px]">Cmd+V</kbd>
						to paste from clipboard
					</p>
				{/if}
			</button>

			<input
				bind:this={fileInput}
				type="file"
				accept="image/*"
				class="hidden"
				onchange={(e) => {
					const file = (e.target as HTMLInputElement).files?.[0];
					if (file) handleFile(file);
					(e.target as HTMLInputElement).value = '';
				}}
			/>
		{:else if decodeState.status === 'success'}
			{@const successText = decodeState.text}
			<div class="grid gap-6 sm:grid-cols-[auto_1fr]">
				<!-- Thumbnail -->
				<img
					src={decodeState.thumbnail}
					alt="Decoded QR code"
					class="h-36 w-36 shrink-0 rounded-xl border border-border object-contain"
				/>

				<!-- Result -->
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<span
							class="inline-block rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-text-muted"
						>
							{detectContentType(successText)}
						</span>
						<p class="flex items-center gap-1.5 text-sm font-medium text-success">
							<svg
								class="h-4 w-4"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
							</svg>
							QR code decoded
						</p>
					</div>

					<div class="rounded-xl border border-border bg-surface-alt p-4">
						<p class="break-all font-mono text-sm text-text">{successText}</p>
						<div class="mt-3 flex flex-wrap items-center gap-2">
							<CopyButton text={() => successText} small />
							{#if isUrl(successText)}
								<a
									href={successText}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
								>
									<svg
										class="h-3.5 w-3.5"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
										/>
									</svg>
									Open
								</a>
							{/if}
						</div>
					</div>

					<button
						type="button"
						onclick={reset}
						class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
					>
						Try another
					</button>
				</div>
			</div>
		{:else if decodeState.status === 'notfound'}
			<div class="grid gap-6 sm:grid-cols-[auto_1fr]">
				<img
					src={decodeState.thumbnail}
					alt="Scanned QR code"
					class="h-36 w-36 shrink-0 rounded-xl border border-border object-contain"
				/>
				<div class="flex flex-col justify-center gap-3">
					<p class="flex items-center gap-1.5 text-sm font-medium text-warning">
						<svg
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
							/>
						</svg>
						No QR code found in this image.
					</p>
					<p class="text-sm text-text-muted">
						Make sure the image is clear and the QR code fills a reasonable portion of the frame.
					</p>
					<button
						type="button"
						onclick={reset}
						class="self-start rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
					>
						Try another
					</button>
				</div>
			</div>
		{:else if decodeState.status === 'error'}
			<div class="space-y-3">
				{#if decodeState.thumbnail}
					<img
						src={decodeState.thumbnail}
						alt="Scanned QR code"
						class="h-36 w-36 rounded-xl border border-border object-contain"
					/>
				{/if}
				<p class="text-sm text-error">{decodeState.message}</p>
				<button
					type="button"
					onclick={reset}
					class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
				>
					Try another
				</button>
			</div>
		{/if}
	</div>
</DevToolShell>
