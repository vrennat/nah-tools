<script lang="ts">
	import { getFamily, getFamilyTools } from '$lib/registry/index';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const photoFamilyTools = getFamilyTools('photo');

	// The photo hub cross-links to the image converter hub (/convert), which
	// belongs to a different family. Name and description come from the registry
	// so the card cannot drift from the converter's own hub.
	const convertFamily = getFamily('convert');
	const convertCard = {
		path: convertFamily?.hub ?? '/convert',
		name: convertFamily?.name ?? 'Image Converter',
		description: convertFamily?.description ?? '',
		icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5'
	};

	// The converter card slots in right after the filters tool. Anchoring to the
	// path (not an index) keeps the order stable as photo tools are added.
	const filtersIndex = photoFamilyTools.findIndex((t) => t.path === '/photo/filters');
	const insertAt = filtersIndex === -1 ? photoFamilyTools.length : filtersIndex + 1;
	const cards = [
		...photoFamilyTools.slice(0, insertAt),
		convertCard,
		...photoFamilyTools.slice(insertAt)
	];

	const faqs = [
		{
			question: 'Are these photo tools free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my images get uploaded to a server?',
			answer: 'No. All image processing — compression, background removal, color correction, format conversion — runs entirely in your browser. Your photos never leave your device.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit. Processing is in-browser, so practical limits depend on your device memory. Very large images (50+ MP) may be slower but should work on most modern devices.'
		},
		{
			question: 'Which image formats are supported?',
			answer: 'Input formats vary by tool but commonly include JPEG, PNG, WebP, AVIF, HEIC, GIF, BMP, TIFF, and SVG. See each individual tool for its specific accepted formats.'
		},
		{
			question: 'Which browsers are supported?',
			answer: 'Any modern browser with JavaScript enabled: Chrome, Firefox, Safari, and Edge. Some advanced codecs (AVIF, JXL) require newer browser versions — each tool page notes any requirements.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Photo Tools', url: 'https://nah.tools/photo' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

<svelte:head>
	<title>Photo Tools — nah</title>
	<meta name="description" content="Free, client-side photo editing tools. Background removal, image compression, color correction, and more. No upload, no signup." />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-10">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Photo Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Photo <span class="text-accent">Tools</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Image editing that runs entirely in your browser.
		</p>
		<p class="mx-auto mt-3 max-w-2xl text-base text-text-muted">
			Remove backgrounds, compress images for web or email, correct colors, convert between formats, read or strip EXIF metadata, crop to any ratio, and generate favicons — all client-side, all free.
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

	<section class="mx-auto max-w-3xl space-y-4 pt-4">
		<h2 class="font-display text-xl font-700">Frequently asked questions</h2>
		<div class="space-y-3">
			{#each faqs as faq}
				<details class="group rounded-xl border border-border bg-surface-alt p-4">
					<summary class="cursor-pointer list-none font-medium text-text marker:hidden">
						<span class="flex items-center justify-between gap-3">
							{faq.question}
							<svg class="h-4 w-4 shrink-0 text-text-muted transition-transform group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
							</svg>
						</span>
					</summary>
					<p class="mt-2 text-sm leading-relaxed text-text-muted">{faq.answer}</p>
				</details>
			{/each}
		</div>
	</section>
</div>
