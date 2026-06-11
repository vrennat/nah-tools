<script lang="ts">
	import { allPairs } from '$convert/pairs';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const popularPairs = allPairs.filter((p) => p.popular);
	const allOtherPairs = allPairs.filter((p) => !p.popular);

	const faqs = [
		{
			question: 'Is this image converter free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my images get uploaded to a server?',
			answer: 'No. All conversion runs entirely in your browser using WebAssembly codecs. Your images never leave your device.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit. Processing is in-browser, so practical limits depend on your device memory. Most images up to hundreds of megabytes convert without issue.'
		},
		{
			question: 'Can I convert multiple images at once?',
			answer: 'Yes. Each conversion page accepts multiple files and processes them in batch, letting you download results individually or as a ZIP.'
		},
		{
			question: 'Which browsers are supported?',
			answer: 'Any modern browser with JavaScript enabled: Chrome, Firefox, Safari (16.4+), and Edge. Some formats like AVIF and JXL require newer browser versions — each tool page notes any requirements.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Image Converter', url: 'https://nah.tools/convert' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

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
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Image Converter</span>
	</nav>

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
</div>
