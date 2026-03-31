<svelte:head>
	<title>Free PDF Tools — Merge, Split, Rotate, Compress | nah</title>
	<meta
		name="description"
		content="Free online PDF tools. Merge, split, rotate, compress, convert, and more. 100% client-side — files never leave your device. No signup, no limits."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah PDF Tools',
		url: 'https://nah.tools/pdf',
		description:
			'Free online PDF tools. Merge, split, rotate, compress, convert PDFs in your browser. Files never leave your device.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free PDF Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/pdf/merge"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 4v16m8-8H4"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Merge PDFs</span>
				<p class="mt-1 text-sm text-text-muted">Combine multiple PDFs into one file</p>
			</a>

			<a
				href="/pdf/split"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Split PDF</span>
				<p class="mt-1 text-sm text-text-muted">Extract pages or split into ranges</p>
			</a>

			<a
				href="/pdf/rotate"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Rotate Pages</span>
				<p class="mt-1 text-sm text-text-muted">Rotate all or specific pages</p>
			</a>

			<a
				href="/pdf/remove-pages"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Remove Pages</span>
				<p class="mt-1 text-sm text-text-muted">Delete pages from a PDF</p>
			</a>

			<a
				href="/pdf/reorder"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Reorder Pages</span>
				<p class="mt-1 text-sm text-text-muted">Drag and drop to rearrange pages</p>
			</a>

			<a
				href="/pdf/images-to-pdf"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Images to PDF</span>
				<p class="mt-1 text-sm text-text-muted">Convert JPG or PNG images to PDF</p>
			</a>

			<a
				href="/pdf/pdf-to-images"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 13l-3 3m0 0l-3-3m3 3V8"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">PDF to Images</span>
				<p class="mt-1 text-sm text-text-muted">Export PDF pages as PNG or JPG</p>
			</a>

			<a
				href="/pdf/compress"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 14l-7 7m0 0l-7-7m7 7V3"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Compress PDF</span>
				<p class="mt-1 text-sm text-text-muted">Reduce file size by stripping metadata</p>
			</a>

			<a
				href="/pdf/flatten"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Flatten PDF</span>
				<p class="mt-1 text-sm text-text-muted">Bake form fields and annotations into static content</p>
			</a>

			<a
				href="/pdf/page-numbers"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Page Numbers</span>
				<p class="mt-1 text-sm text-text-muted">Add page numbers to your PDF</p>
			</a>

			<a
				href="/pdf/watermark"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Watermark</span>
				<p class="mt-1 text-sm text-text-muted">Add text watermark to all pages</p>
			</a>

			<a
				href="/pdf/edit"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Edit PDF</span>
				<p class="mt-1 text-sm text-text-muted">Add text, images, and drawings to your PDF</p>
			</a>

			<a
				href="/pdf/fill-sign"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Fill & Sign</span>
				<p class="mt-1 text-sm text-text-muted">Add text and signatures to your PDF</p>
			</a>

			<a
				href="/pdf/word-to-pdf"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 13l3 3 3-3"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Word to PDF</span>
				<p class="mt-1 text-sm text-text-muted">Convert DOCX files to PDF</p>
			</a>

			<a
				href="/pdf/protect"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Protect PDF</span>
				<p class="mt-1 text-sm text-text-muted">Add password protection to your PDF</p>
			</a>

			<a
				href="/pdf/unlock"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Unlock PDF</span>
				<p class="mt-1 text-sm text-text-muted">Remove password from your PDF</p>
			</a>

			<a
				href="/pdf/pdf-to-csv"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 10h18M3 14h18M3 18h18M3 6h18M9 6v12M15 6v12"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">PDF to CSV</span>
				<p class="mt-1 text-sm text-text-muted">Extract tables from PDFs as spreadsheet data</p>
			</a>

			<a
				href="/pdf/ocr"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">OCR PDF</span>
				<p class="mt-1 text-sm text-text-muted">Make scanned PDFs searchable with text recognition</p>
			</a>

			<a
				href="/pdf/crop"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M7 3v4M3 7h4m0 0v10a2 2 0 002 2h10m4-4v4m-4 0h4m0 0V9a2 2 0 00-2-2H7"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Crop PDF</span>
				<p class="mt-1 text-sm text-text-muted">Trim margins from PDF pages</p>
			</a>

			<a
				href="/pdf/extract-images"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Extract Images</span>
				<p class="mt-1 text-sm text-text-muted">Pull all embedded images from a PDF</p>
			</a>

			<a
				href="/pdf/pdfa"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Prepare for PDF/A</span>
				<p class="mt-1 text-sm text-text-muted">Add archival metadata for long-term preservation</p>
			</a>

			<a
				href="/pdf/compare"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Compare PDFs</span>
				<p class="mt-1 text-sm text-text-muted">Visual side-by-side diff of two PDFs</p>
			</a>

			<a
				href="/pdf/redact"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18"
						/>
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Redact PDF</span>
				<p class="mt-1 text-sm text-text-muted">Permanently black out sensitive content</p>
			</a>
		</div>
	</div>
</div>
