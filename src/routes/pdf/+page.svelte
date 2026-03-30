<svelte:head>
	<title>Free PDF Tools — Merge, Split, Rotate, Compress | Nah Tools</title>
	<meta
		name="description"
		content="Free online PDF tools. Merge, split, rotate, compress, convert, and more. 100% client-side — files never leave your device. No signup, no limits."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Nah Tools PDF Tools',
		url: 'https://nah.tools/pdf',
		description:
			'Free online PDF tools. Merge, split, rotate, compress, convert PDFs in your browser. Files never leave your device.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'Nah Tools', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
			Free PDF Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-4xl space-y-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/pdf/merge"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Merge PDFs</h2>
				<p class="mt-1 text-sm text-text-muted">Combine multiple PDFs into one file</p>
			</a>

			<a
				href="/pdf/split"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Split PDF</h2>
				<p class="mt-1 text-sm text-text-muted">Extract pages or split into ranges</p>
			</a>

			<a
				href="/pdf/rotate"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Rotate Pages</h2>
				<p class="mt-1 text-sm text-text-muted">Rotate all or specific pages</p>
			</a>

			<a
				href="/pdf/remove-pages"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Remove Pages</h2>
				<p class="mt-1 text-sm text-text-muted">Delete pages from a PDF</p>
			</a>

			<a
				href="/pdf/reorder"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Reorder Pages</h2>
				<p class="mt-1 text-sm text-text-muted">Drag and drop to rearrange pages</p>
			</a>

			<a
				href="/pdf/images-to-pdf"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Images to PDF</h2>
				<p class="mt-1 text-sm text-text-muted">Convert JPG or PNG images to PDF</p>
			</a>

			<a
				href="/pdf/pdf-to-images"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">PDF to Images</h2>
				<p class="mt-1 text-sm text-text-muted">Export PDF pages as PNG or JPG</p>
			</a>

			<a
				href="/pdf/compress"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Compress PDF</h2>
				<p class="mt-1 text-sm text-text-muted">Reduce file size by stripping metadata</p>
			</a>

			<a
				href="/pdf/page-numbers"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Page Numbers</h2>
				<p class="mt-1 text-sm text-text-muted">Add page numbers to your PDF</p>
			</a>

			<a
				href="/pdf/watermark"
				class="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:border-accent hover:shadow-md"
			>
				<div
					class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent"
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
				<h2 class="font-semibold text-text group-hover:text-accent">Watermark</h2>
				<p class="mt-1 text-sm text-text-muted">Add text watermark to all pages</p>
			</a>
		</div>
	</div>
</div>
