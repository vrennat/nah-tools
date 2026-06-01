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

	<div class="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
		<a
			href="/photo/rm-bg"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
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
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
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
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
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
		<a
			href="/convert"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
					/>
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Image Converter</h2>
			<p class="mt-1 text-sm text-text-muted">
				HEIC to JPG, WebP to PNG, SVG to PNG, and 14 more conversions.
			</p>
		</a>

		<a
			href="/photo/exif"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">EXIF Viewer &amp; Remover</h2>
			<p class="mt-1 text-sm text-text-muted">
				See camera, timestamp, and GPS data — then strip it before sharing.
			</p>
		</a>

		<a
			href="/photo/crop"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zM6.75 2.25v4.5m0 0H2.25m13.902 1.487l1.536-.887m-1.536.887a3 3 0 105.196-3 3 3 0 00-5.196 3zm1.536-.887V2.25m0 4.5h4.5" />
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Social Media Crop</h2>
			<p class="mt-1 text-sm text-text-muted">
				Pixel-perfect crops for Instagram, Twitter, LinkedIn, and YouTube.
			</p>
		</a>

		<a
			href="/photo/favicon"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Favicon Generator</h2>
			<p class="mt-1 text-sm text-text-muted">
				Multi-size favicon.ico plus a full PNG icon set from one image.
			</p>
		</a>

		<a
			href="/photo/svg-optimize"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">SVG Optimizer</h2>
			<p class="mt-1 text-sm text-text-muted">
				Strip editor metadata and minify SVG markup to shrink file size.
			</p>
		</a>
	</div>
</div>
