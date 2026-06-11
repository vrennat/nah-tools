<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';

	const photoFamilyTools = getFamilyTools('photo');

	// The photo hub cross-links to the image converter hub (/convert), which
	// belongs to a different family. It appears between 'filters' and 'exif'
	// in the original display order (index 3 in the 8-card grid).
	const convertCard = {
		path: '/convert',
		name: 'Image Converter',
		description: 'HEIC to JPG, WebP to PNG, SVG to PNG, and 14 more conversions.',
		icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
	};

	// Reconstruct the original 8-card order: rm-bg, compress, filters, /convert, exif, crop, favicon, svg-optimize
	const cards = [
		...photoFamilyTools.slice(0, 3),
		convertCard,
		...photoFamilyTools.slice(3)
	];
</script>

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
		{#each cards as card}
			<a
				href={card.path}
				class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
			>
				<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
					{#if card.icon}
						<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d={card.icon} />
						</svg>
					{/if}
				</div>
				<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">{card.name}</h2>
				<p class="mt-1 text-sm text-text-muted">
					{card.description}
				</p>
			</a>
		{/each}
	</div>
</div>
