<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const tools = getFamilyTools('pdf');

	const faqs = [
		{
			question: 'Are these PDF tools really free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my PDF files get uploaded to a server?',
			answer: 'No. Every tool in this suite runs entirely in your browser using client-side JavaScript. Your files never leave your device.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'There is no enforced limit — processing happens in your browser tab. Practical limits depend on your device memory; most documents up to a few hundred MB work fine.'
		},
		{
			question: 'Which browsers are supported?',
			answer: 'Any modern browser with JavaScript enabled: Chrome, Firefox, Safari, and Edge. Mobile browsers work too, though desktop is recommended for large files.'
		},
		{
			question: 'Can I use these tools offline?',
			answer: 'After the page loads, most tools work offline because processing is client-side. You will need a network connection only for the initial page load.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'PDF Tools', url: 'https://nah.tools/pdf' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

<svelte:head>
	<title>Free PDF Tools — Merge, Split, Rotate, Compress | nah</title>
	<meta
		name="description"
		content="Free online PDF tools. Merge, split, rotate, compress, convert, and more. 100% client-side — files never leave your device. No signup, no limits."
	/>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'nah PDF Tools',
		url: 'https://nah.tools/pdf',
		description:
			'Free online PDF tools. Merge, split, rotate, compress, convert PDFs in your browser. Files never leave your device.',
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
		<span class="text-text">PDF Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free PDF Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
		<p class="mx-auto mt-3 max-w-2xl text-base text-text-muted">
			A complete suite for everyday PDF work — merge multiple documents into one, split out specific pages, rotate or reorder, add watermarks and page numbers, protect with a password, and compress for email. No uploads, no accounts, no expiring free trials.
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
