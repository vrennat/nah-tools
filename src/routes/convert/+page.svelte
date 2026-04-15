<script lang="ts">
	import { allPairs } from '$convert/pairs';

	const popularPairs = allPairs.filter((p) => p.popular);
	const allOtherPairs = allPairs.filter((p) => !p.popular);
</script>

<svelte:head>
	<title>Free Image Converter — Convert Between Any Format | nah</title>
	<meta
		name="description"
		content="Convert images between any format. HEIC, PNG, JPG, WebP, SVG, AVIF, and more. 100% client-side — files never leave your device. No signup, no limits."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah Image Converter',
		url: 'https://nah.tools/convert',
		description:
			'Free online image converter. Convert images between any format in your browser. Files never leave your device.',
		applicationCategory: 'UtilityApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Image Converter. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Convert between any image format. Everything runs in your browser. Your files never leave your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		{#if popularPairs.length > 0}
			<section class="space-y-4">
				<h2 class="text-xl font-700 text-text">Popular Conversions</h2>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each popularPairs as pair}
						<a
							href="/convert/{pair.slug}"
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
							<div class="flex items-center justify-between">
								<div>
									<h3 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
										{pair.sourceFormat}
									</h3>
									<p class="text-xs text-text-muted">to {pair.targetFormat}</p>
								</div>
								<svg class="h-4 w-4 text-text-muted transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		{#if allOtherPairs.length > 0}
			<section class="space-y-4">
				<h2 class="text-xl font-700 text-text">All Conversions</h2>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					{#each allOtherPairs as pair}
						<a
							href="/convert/{pair.slug}"
							class="group flex items-center gap-3 rounded-xl border border-border bg-surface-alt px-4 py-3 transition-all duration-300 hover:border-accent/50 hover:bg-surface"
						>
							<div class="flex-1 min-w-0">
								<p class="text-xs font-medium text-text-muted">{pair.sourceFormat}</p>
								<p class="text-sm font-600 text-text">to {pair.targetFormat}</p>
							</div>
							<svg class="h-4 w-4 shrink-0 text-text-muted transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</div>
</div>
