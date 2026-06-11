<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const tools = getFamilyTools('pptx');

	const faqs = [
		{
			question: 'Are these PowerPoint tools free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my PPTX files get uploaded to a server?',
			answer: 'No. PPTX files are ZIP archives of XML, and this suite unpacks and modifies them entirely in your browser. Your presentations never leave your device.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit — processing is in-browser. Large presentations with many high-resolution images may be slow; for best performance keep files under 100 MB.'
		},
		{
			question: 'Does it work with .ppt (older format) files?',
			answer: 'These tools work with the modern .pptx format (Office Open XML). For older .ppt files, first re-save as .pptx in PowerPoint, Google Slides, or LibreOffice.'
		},
		{
			question: 'Which browsers are supported?',
			answer: 'Any modern browser with JavaScript enabled: Chrome, Firefox, Safari, and Edge. Mobile browsers work too, though desktop is recommended for large files.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'PowerPoint Tools', url: 'https://nah.tools/pptx' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

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
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">PowerPoint Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free PowerPoint Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
		<p class="mx-auto mt-3 max-w-2xl text-base text-text-muted">
			A full suite for working with .pptx files without PowerPoint. Merge decks, extract individual slides, compress images to shrink file size, pull out all embedded images, strip speaker notes before sharing, or add a text watermark — all processed locally, all free.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool}
				<a
					href={tool.path}
					class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
				>
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
					>
						{#if tool.icon}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={tool.icon} />
							</svg>
						{/if}
					</div>
					<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">{tool.name}</h2>
					<p class="mt-1 text-sm text-text-muted">{tool.description}</p>
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
</div>
