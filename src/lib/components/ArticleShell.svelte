<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getTool, getFamily, getRelated } from '$lib/registry/index';
	import FAQSchema from '$components/FAQSchema.svelte';
	import BreadcrumbSchema from '$components/BreadcrumbSchema.svelte';

	interface FAQ {
		question: string;
		answer: string;
	}

	// Sibling to ToolShell for informational /guides content — not a tool, so it
	// emits Article JSON-LD instead of SoftwareApplication and drops the
	// "100% in your browser" badge in favor of a published/updated date line.
	// Reuses the same registry lookups and FAQ/Breadcrumb schema components as
	// ToolShell so both surfaces stay consistent without sharing a base file
	// that would otherwise need a schema-type branch threaded through it.
	let {
		path,
		dek,
		seoTitle,
		description,
		publishedDate,
		updatedDate,
		faqs = [],
		h1,
		children
	}: {
		path: string;
		/** One-line summary shown under the h1, analogous to ToolShell's tagline. */
		dek: string;
		seoTitle: string;
		description: string;
		/** ISO date string, e.g. '2026-07-28'. */
		publishedDate: string;
		/** ISO date string; defaults to publishedDate when omitted. */
		updatedDate?: string;
		faqs?: FAQ[];
		h1?: string;
		children: Snippet;
	} = $props();

	const entry = $derived.by(() => {
		const found = getTool(path);
		if (!found) {
			throw new Error(`ArticleShell: path "${path}" is not registered in the tool registry`);
		}
		return found;
	});

	const family = $derived.by(() => {
		const found = getFamily(entry.family);
		if (!found) {
			throw new Error(`ArticleShell: family "${entry.family}" is not registered`);
		}
		return found;
	});

	const canonical = $derived(`https://nah.tools${path}`);
	const effectiveUpdatedDate = $derived(updatedDate ?? publishedDate);

	const breadcrumbItems = $derived([
		{ name: 'nah', url: 'https://nah.tools' },
		...(family.hub ? [{ name: family.name, url: `https://nah.tools${family.hub}` }] : []),
		{ name: entry.name, url: canonical }
	]);

	const visibleCrumbs = $derived([
		{ name: 'nah', href: '/' },
		...(family.hub ? [{ name: family.name, href: family.hub }] : []),
		{ name: entry.name, href: null }
	]);

	const related = $derived(getRelated(path, 4));
	const displayH1 = $derived(h1 ?? entry.name);

	const dateFormatter = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	const displayPublished = $derived(dateFormatter.format(new Date(publishedDate)));
	const displayUpdated = $derived(dateFormatter.format(new Date(effectiveUpdatedDate)));
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="description" content={description} />

	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content={seoTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content="https://nah.tools/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content="https://nah.tools/og.png" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: displayH1,
		description,
		url: canonical,
		datePublished: publishedDate,
		dateModified: effectiveUpdatedDate,
		mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
		author: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' },
		publisher: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

{#if faqs.length > 0}
	<FAQSchema {faqs} />
{/if}

<BreadcrumbSchema items={breadcrumbItems} />

<article class="space-y-8 py-2">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		{#each visibleCrumbs as crumb, i}
			{#if i > 0}
				<span aria-hidden="true">/</span>
			{/if}
			{#if crumb.href}
				<a href={crumb.href} class="transition-colors hover:text-accent">{crumb.name}</a>
			{:else}
				<span class="text-text">{crumb.name}</span>
			{/if}
		{/each}
	</nav>

	<header class="space-y-3">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">{displayH1}</h1>
		<p class="max-w-2xl text-lg text-text-muted">{dek}</p>
		<p class="text-sm text-text-muted">
			Published {displayPublished}
			{#if effectiveUpdatedDate !== publishedDate}
				&middot; Updated {displayUpdated}
			{/if}
		</p>
	</header>

	<div class="prose-guide mx-auto max-w-2xl space-y-6">
		{@render children()}
	</div>

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

	{#if related.length > 0}
		<section class="space-y-4 border-t border-border pt-8">
			<h2 class="font-display text-lg font-700">Related guides &amp; tools</h2>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each related as tool}
					<a
						href={tool.path}
						class="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all duration-200 hover:border-accent/50 hover:bg-surface-alt"
					>
						{#if tool.icon}
							<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
								</svg>
							</div>
						{/if}
						<div class="min-w-0">
							<h3 class="text-sm font-600 text-text transition-colors group-hover:text-accent">{tool.name}</h3>
							<p class="truncate text-xs text-text-muted">{tool.description}</p>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
</article>
