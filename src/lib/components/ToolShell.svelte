<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getTool, getFamily, getRelated } from '$lib/registry/index';
	import FAQSchema from '$components/FAQSchema.svelte';
	import BreadcrumbSchema from '$components/BreadcrumbSchema.svelte';

	interface FAQ {
		question: string;
		answer: string;
	}

	let {
		path,
		tagline,
		seoTitle,
		description,
		faqs = [],
		// Override the h1 text when the page's intended title differs from the
		// registry entry name. Dev/text shells pass this so their more descriptive
		// titles ("JSON Formatter & Validator" vs "JSON Formatter") are preserved.
		h1,
		// Override the JSON-LD applicationCategory. Dev tools pass
		// 'DeveloperApplication'; text tools pass 'UtilityApplication'.
		// Falls back to 'UtilitiesApplication' for all other families.
		applicationCategory = 'UtilitiesApplication',
		children
	}: {
		path: string;
		tagline: string;
		seoTitle: string;
		description: string;
		faqs?: FAQ[];
		h1?: string;
		applicationCategory?: string;
		children: Snippet;
	} = $props();

	// Use $derived so Svelte tracks prop reads correctly and doesn't warn about
	// "captures initial value". path is a static string per page, but $derived
	// is the right pattern for any computation based on a prop.
	const entry = $derived.by(() => {
		const found = getTool(path);
		if (!found) {
			throw new Error(`ToolShell: path "${path}" is not registered in the tool registry`);
		}
		return found;
	});

	const family = $derived.by(() => {
		const found = getFamily(entry.family);
		if (!found) {
			throw new Error(`ToolShell: family "${entry.family}" is not registered`);
		}
		return found;
	});

	const canonical = $derived(`https://nah.tools${path}`);

	const breadcrumbItems = $derived([
		{ name: 'nah', url: 'https://nah.tools' },
		...(family.hub ? [{ name: family.name, url: `https://nah.tools${family.hub}` }] : []),
		{ name: entry.name, url: canonical }
	]);

	// Visible breadcrumb links use relative hrefs for internal nav
	const visibleCrumbs = $derived([
		{ name: 'nah', href: '/' },
		...(family.hub ? [{ name: family.name, href: family.hub }] : []),
		{ name: entry.name, href: null }
	]);

	const related = $derived(getRelated(path, 4));

	// Displayed h1: prefer the explicit override, fall back to the registry name
	const displayH1 = $derived(h1 ?? entry.name);
</script>

<svelte:head>
	<title>{seoTitle}</title>
	<meta name="description" content={description} />

	<meta property="og:type" content="website" />
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
		'@type': 'SoftwareApplication',
		name: displayH1,
		url: canonical,
		description,
		applicationCategory,
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

{#if faqs.length > 0}
	<FAQSchema {faqs} />
{/if}

<BreadcrumbSchema items={breadcrumbItems} />

<div class="space-y-8 py-2">
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
		<p class="max-w-2xl text-lg text-text-muted">{tagline}</p>
		<p class="inline-flex items-center gap-1.5 text-sm font-medium text-success">
			<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			100% in your browser — files never leave your device
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

	{#if related.length > 0}
		<section class="space-y-4 border-t border-border pt-8">
			<h2 class="font-display text-lg font-700">Related tools</h2>
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
</div>
