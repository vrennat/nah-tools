<svelte:head>
	<title>Free Audio Tools — Convert, Merge, Normalize | nah</title>
	<meta
		name="description"
		content="Free online audio tools. Convert between MP3, WAV, OGG, M4A, FLAC, and AAC, merge multiple tracks, and normalize volume — all in your browser. Files never leave your device."
	/>
	<link rel="canonical" href="https://nah.tools/audio" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah Audio Tools',
		url: 'https://nah.tools/audio',
		description:
			'Free online audio tools. Convert, merge, and normalize audio files in your browser. Files never leave your device.',
		applicationCategory: 'MultimediaApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Audio Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Convert, merge, and normalize audio entirely in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-center text-sm text-text-muted">
			<span class="font-medium">Powered by FFmpeg:</span> First use downloads a cached 25MB engine for client-side processing.
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			<a
				href="/audio/convert"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Convert Audio
				</h2>
				<p class="mt-1 text-sm text-text-muted">MP3, WAV, OGG, M4A, FLAC, AAC</p>
			</a>

			<a
				href="/audio/merge"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Merge Audio
				</h2>
				<p class="mt-1 text-sm text-text-muted">Join multiple tracks into one file</p>
			</a>

			<a
				href="/audio/normalize"
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
					</svg>
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
					Normalize Volume
				</h2>
				<p class="mt-1 text-sm text-text-muted">Even out loudness (EBU R128)</p>
			</a>
		</div>

		<p class="text-center text-sm text-text-muted">
			Looking for trimming or compression? See the <a href="/media" class="text-accent hover:underline">video &amp; audio tools</a>.
		</p>
	</div>
</div>
