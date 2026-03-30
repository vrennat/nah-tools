<svelte:head>
	<title>Photo Tools — nah</title>
	<meta name="description" content="Free, client-side photo editing tools. Background removal, image compression, color correction, and more. No upload, no signup." />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Photo <span class="text-accent">Tools</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Image editing that runs entirely in your browser.
		</p>
	</section>

	<div class="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<a
			href="/photo/rm-bg"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
					/>
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Background Remover</h2>
			<p class="mt-1 text-sm text-text-muted">
				Remove image backgrounds instantly. Free, unlimited, full resolution.
			</p>
		</a>

		<a
			href="/photo/compress"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859"
					/>
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Image Compression</h2>
			<p class="mt-1 text-sm text-text-muted">
				Compress to WebP, AVIF, JPEG, PNG, or JPEG XL with full quality control.
			</p>
		</a>

		<a
			href="/photo/filters"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
					/>
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Color Correction</h2>
			<p class="mt-1 text-sm text-text-muted">
				Brightness, contrast, exposure, temperature, and more. Real-time WebGL2.
			</p>
		</a>
	</div>
</div>
