<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import FAQSchema from '$lib/components/FAQSchema.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const tools = getFamilyTools('media');

	const faqs = [
		{
			question: 'Are these video and audio tools free?',
			answer: 'Yes, completely free with no signup, no account, and no limits. All tools are open source and will stay free.'
		},
		{
			question: 'Do my media files get uploaded to a server?',
			answer: 'No. Processing runs in your browser via FFmpeg compiled to WebAssembly. Your video and audio files never leave your device.'
		},
		{
			question: 'Why does it take a moment to start the first time?',
			answer: 'The FFmpeg WebAssembly engine (~25 MB) downloads once on first use and is then cached by your browser. Subsequent visits and operations start immediately.'
		},
		{
			question: 'Is there a file size limit?',
			answer: 'No enforced limit. Very large files (multi-GB) require enough RAM in your browser tab to hold the file during processing. For most use cases — trimming clips, compressing for social, extracting audio — files up to a few GB work fine on modern hardware.'
		},
		{
			question: 'Which browsers are supported?',
			answer: 'Chrome, Firefox, and Edge on desktop. Safari requires version 16.4 or later for full WebAssembly threading support. Mobile browsers work for small files but are slower due to hardware constraints.'
		}
	];

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Video & Audio Tools', url: 'https://nah.tools/media' }
	];
</script>

<FAQSchema {faqs} />
<BreadcrumbSchema items={breadcrumbItems} />

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
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Video & Audio Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Video and Audio Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
		</p>
		<p class="mx-auto mt-3 max-w-2xl text-base text-text-muted">
			Trim clips, compress for email or social, extract audio tracks, or convert video to GIF — all powered by FFmpeg running locally in your browser. No subscriptions, no watermarks, no 100 MB limits.
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
					<div
						class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"
					>
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
