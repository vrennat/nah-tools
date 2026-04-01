<script lang="ts">
</script>

<svelte:head>
	<title>Free Video and Audio Tools — nah</title>
	<meta
		name="description"
		content="Free online video and audio tools. Compress, trim, convert, and process media files in your browser. 100% client-side — files never leave your device."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah Media Tools',
		url: 'https://nah.tools/media',
		description:
			'Free online media tools. Compress, trim, convert video and audio files in your browser. Files never leave your device.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Video and Audio Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-center text-sm text-text-muted">
			<span class="font-medium">Powered by FFmpeg:</span> First use downloads a cached 25MB engine for client-side processing.
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/media/compress-video"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2m0-14c0-1.105 1.343-2 3-2s3 .895 3 2m0 14c1.657 0 3 .895 3 2s1.343 2 3 2m0-14c1.657 0 3 .895 3 2s1.343 2 3 2"
						/>
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Compress Video
				</h2>
				<p class="mt-1 text-sm text-text-muted">Reduce file size for email or sharing</p>
			</a>

			<a
				href="/media/trim-video"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
						/>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Trim Video
				</h2>
				<p class="mt-1 text-sm text-text-muted">Cut video to a specific time range</p>
			</a>

			<a
				href="/media/trim-audio"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2m0-14c0-1.105 1.343-2 3-2s3 .895 3 2m0 14c1.657 0 3 .895 3 2s1.343 2 3 2m0-14c1.657 0 3 .895 3 2s1.343 2 3 2"
						/>
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Trim Audio
				</h2>
				<p class="mt-1 text-sm text-text-muted">Cut audio to a specific time range</p>
			</a>

			<a
				href="/media/compress-audio"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.586a2.5 2.5 0 010-3.536m2.828 9.9a6 6 0 010-8.485"
						/>
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Compress Audio
				</h2>
				<p class="mt-1 text-sm text-text-muted">Reduce audio file size</p>
			</a>

			<a
				href="/media/video-to-gif"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
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
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Video to GIF
				</h2>
				<p class="mt-1 text-sm text-text-muted">Convert video clips to animated GIFs</p>
			</a>

			<a
				href="/media/extract-audio"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div
					class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 14l9-5-9-5-9 5m0 0l9 5m-9-5v10l9 5m0 0l9-5m-9 5v-10m0 0l-9-5m15 5l9-5"
						/>
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Extract Audio
				</h2>
				<p class="mt-1 text-sm text-text-muted">Pull audio track from any video</p>
			</a>
		</div>
	</div>
</div>
