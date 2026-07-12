<script lang="ts">
	import { allPairs } from '$convert/pairs';
	import UniversalConverter from '$components/convert/UniversalConverter.svelte';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	// Group the pair links by source format — matches how people search
	// ("I have a HEIC") and gives every SEO page a descriptive internal link.
	const sourceOrder = [...new Set(allPairs.map((p) => p.sourceFormat))];
	const groups = sourceOrder.map((source) => ({
		source,
		pairs: allPairs.filter((p) => p.sourceFormat === source)
	}));

	// High-volume conversions served by sibling tool families.
	const beyondImages = [
		{ href: '/pdf/images-to-pdf', label: 'JPG to PDF' },
		{ href: '/pdf/pdf-to-images', label: 'PDF to JPG' },
		{ href: '/photo/compress', label: 'Compress images' },
		{ href: '/photo/favicon', label: 'Favicon generator' }
	];

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
			question: 'What image formats are supported?',
			answer: 'HEIC, HEIF, JPG, PNG, WebP, AVIF, JPEG XL, SVG, BMP, GIF, and TIFF as inputs, converting to JPG, PNG, WebP, or AVIF. Drop a file above and the converter detects its format automatically.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit. Processing is in-browser, so practical limits depend on your device memory. Most images up to hundreds of megabytes convert without issue.'
		},
		{
			question: 'Can I convert multiple images at once?',
			answer: 'Yes. Drop as many files as you like — they convert in batch, and you can download results individually or as a ZIP.'
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
			Drop any image — we detect the format and convert it right here in your browser. Your files
			never leave your device.
		</p>
	</section>

	<UniversalConverter />

	<div class="mx-auto max-w-5xl space-y-8">
		<section class="space-y-6">
			<h2 class="text-xl font-700 text-text">All conversions</h2>
			{#each groups as group}
				<div class="space-y-3">
					<h3 class="text-sm font-600 uppercase tracking-wide text-text-muted">
						From {group.source}
					</h3>
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						{#each group.pairs as pair}
							<a
								href="/convert/{pair.slug}"
								class="group flex items-center justify-between rounded-xl border border-border bg-surface-alt px-4 py-3 transition-all duration-200 hover:border-accent/50 hover:bg-surface"
							>
								<span class="text-sm font-600 text-text transition-colors group-hover:text-accent">
									{pair.sourceFormat}
									<span aria-hidden="true" class="mx-1 text-text-muted">→</span>
									{pair.targetFormat}
								</span>
								<svg
									class="h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</section>

		<section class="space-y-3">
			<h2 class="text-xl font-700 text-text">Beyond image formats</h2>
			<div class="flex flex-wrap gap-3">
				{#each beyondImages as link}
					<a
						href={link.href}
						class="rounded-full border border-border bg-surface-alt px-4 py-2 text-sm font-600 text-text transition-colors hover:border-accent/50 hover:text-accent"
					>
						{link.label}
					</a>
				{/each}
			</div>
		</section>

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
