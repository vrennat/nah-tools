<svelte:head>
	<title>Free PowerPoint Tools — Merge, Split, Compress PPTX | nah</title>
	<meta
		name="description"
		content="Free online PowerPoint tools. Merge, split, compress, extract images, add watermarks, and more. 100% client-side — files never leave your device. No signup, no limits."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah PowerPoint Tools',
		url: 'https://nah.tools/pptx',
		description:
			'Free online PowerPoint tools. Merge, split, compress, extract images and text from PPTX files in your browser. Files never leave your device.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free PowerPoint Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/pptx/merge"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Merge Presentations</span>
				<p class="mt-1 text-sm text-text-muted">Combine multiple PPTX files into one</p>
			</a>

			<a
				href="/pptx/split"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12M8 12h12m-12 5h12M4 7h.01M4 12h.01M4 17h.01" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Split Presentation</span>
				<p class="mt-1 text-sm text-text-muted">Extract slides or split into ranges</p>
			</a>

			<a
				href="/pptx/compress"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Compress PPTX</span>
				<p class="mt-1 text-sm text-text-muted">Reduce file size by compressing images</p>
			</a>

			<a
				href="/pptx/extract-images"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Extract Images</span>
				<p class="mt-1 text-sm text-text-muted">Pull all embedded images from a presentation</p>
			</a>

			<a
				href="/pptx/extract-text"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Extract Text</span>
				<p class="mt-1 text-sm text-text-muted">Get all text from every slide</p>
			</a>

			<a
				href="/pptx/remove-notes"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Remove Speaker Notes</span>
				<p class="mt-1 text-sm text-text-muted">Strip notes before sharing</p>
			</a>

			<a
				href="/pptx/watermark"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-6 4h4" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Add Watermark</span>
				<p class="mt-1 text-sm text-text-muted">Add text watermark to all slides</p>
			</a>

			<a
				href="/pptx/remove-animations"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M3 3l18 18" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Remove Animations</span>
				<p class="mt-1 text-sm text-text-muted">Strip all animations and transitions</p>
			</a>

			<a
				href="/pptx/slide-numbers"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Add Slide Numbers</span>
				<p class="mt-1 text-sm text-text-muted">Number your slides automatically</p>
			</a>

			<a
				href="/pptx/metadata"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
					</svg>
				</div>
				<span class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">Edit Metadata</span>
				<p class="mt-1 text-sm text-text-muted">View and edit title, author, and properties</p>
			</a>
		</div>
	</div>
</div>
