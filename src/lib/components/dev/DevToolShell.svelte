<script lang="ts">
	import type { Snippet } from 'svelte';
	import { devTools, type DevTool } from '$dev/tools';
	import FAQSchema from '$components/FAQSchema.svelte';

	interface FAQ {
		question: string;
		answer: string;
	}

	let {
		slug,
		title,
		tagline,
		seoTitle,
		description,
		faqs = [],
		children
	}: {
		slug: string;
		title: string;
		tagline: string;
		seoTitle?: string;
		description: string;
		faqs?: FAQ[];
		children: Snippet;
	} = $props();

	const fullTitle = $derived(seoTitle ?? `${title} — Free Online Tool | nah`);
	const canonical = $derived(`https://nah.tools/dev/${slug}`);
	const related = $derived(devTools.filter((t: DevTool) => t.slug !== slug).slice(0, 6));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://nah.tools/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://nah.tools/og.png" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: title,
		url: canonical,
		description,
		applicationCategory: 'DeveloperApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

{#if faqs.length > 0}
	<FAQSchema {faqs} />
{/if}

<div class="space-y-8 py-2">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<a href="/dev" class="transition-colors hover:text-accent">Dev Tools</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">{title}</span>
	</nav>

	<header class="space-y-3">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">{title}</h1>
		<p class="max-w-2xl text-lg text-text-muted">{tagline}</p>
		<p class="inline-flex items-center gap-1.5 text-sm font-medium text-success">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			100% in your browser. Nothing is uploaded.
		</p>
	</header>

	{@render children()}

	{#if faqs.length > 0}
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
	{/if}

	<section class="space-y-4 border-t border-border pt-8">
		<h2 class="font-display text-lg font-700">More dev tools</h2>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each related as tool}
				<a
					href="/dev/{tool.slug}"
					class="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all duration-200 hover:border-accent/50 hover:bg-surface-alt"
				>
					<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
						<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
						</svg>
					</div>
					<div class="min-w-0">
						<h3 class="text-sm font-600 text-text transition-colors group-hover:text-accent">{tool.name}</h3>
						<p class="truncate text-xs text-text-muted">{tool.desc}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>
</div>
