<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const tools = getFamilyTools('audio');

	const faqs = [
		{
			question: 'Are these audio tools free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my audio files get uploaded to a server?',
			answer: 'No. All conversion, merging, and normalization runs in your browser via FFmpeg compiled to WebAssembly. Your audio files never leave your device.'
		},
		{
			question: 'Why does it take a moment to start the first time?',
			answer: 'The FFmpeg WebAssembly engine (~25 MB) downloads once on first use and is then cached by your browser. Subsequent visits and operations start immediately.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit. Processing is in-browser, so practical limits depend on your device memory. Audio files are typically much smaller than video, so most tracks work without issue.'
		},
		{
			question: 'Which audio formats are supported?',
			answer: 'Input: MP3, WAV, OGG, M4A, FLAC, AAC, AIFF, OPUS, and most other common formats. Output varies by tool — see each tool page for supported output formats.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Audio Tools', url: 'https://nah.tools/audio' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

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
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Audio Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Audio Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Convert, merge, and normalize audio entirely in your browser. Your files never leave your device.
		</p>
		<p class="mx-auto mt-3 max-w-2xl text-base text-text-muted">
			Convert between any common audio format, merge multiple tracks into one file, or normalize volume across a batch — all powered by FFmpeg running locally. No subscriptions, no file-size paywalls, no account required.
		</p>
	</section>

	<div class="mx-auto max-w-5xl space-y-8">
		<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-center text-sm text-text-muted">
			<span class="font-medium">Powered by FFmpeg:</span> First use downloads a cached 25MB engine for client-side processing.
		</div>

		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool}
				<a
					href={tool.path}
					class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
				>
					<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
						{#if tool.icon}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
							</svg>
						{/if}
					</div>
					<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">
						{tool.name}
					</h2>
					<p class="mt-1 text-sm text-text-muted">{tool.description}</p>
				</a>
			{/each}
		</div>

		<p class="text-center text-sm text-text-muted">
			Looking for trimming or compression? See the <a href="/media" class="text-accent hover:underline">video &amp; audio tools</a>.
		</p>

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
