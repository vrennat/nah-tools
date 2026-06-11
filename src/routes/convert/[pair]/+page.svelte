<script lang="ts">
	import ConvertTool from '$components/convert/ConvertTool.svelte';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';
	import { getRelated } from '$lib/registry/index';

	let { data } = $props();
	const pair = $derived(data.pair);

	const path = $derived(`/convert/${pair.slug}`);

	const breadcrumbItems = $derived([
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Image Converter', url: 'https://nah.tools/convert' },
		{ name: pair.title, url: `https://nah.tools/convert/${pair.slug}` }
	]);

	// 4 same-family siblings from the registry; convert entries fall back to
	// same-family (convert) siblings when no explicit `related` field is set.
	const related = $derived(getRelated(path, 4));
</script>

<BreadcrumbSchema items={breadcrumbItems} />

<svelte:head>
	<title>{pair.title} Free Online — nah</title>
	<meta
		name="description"
		content="{pair.description} Free, private, no upload required. Runs entirely in your browser."
	/>
</svelte:head>

<div class="space-y-8">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<a href="/convert" class="transition-colors hover:text-accent">Image Converter</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">{pair.title}</span>
	</nav>

	<ConvertTool {pair} />

	{#if related.length > 0}
		<section class="space-y-4 border-t border-border pt-8">
			<h2 class="font-display text-lg font-700">Related conversions</h2>
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				{#each related as tool}
					<a
						href={tool.path}
						class="group flex items-start gap-3 rounded-xl border border-border p-4 transition-all duration-200 hover:border-accent/50 hover:bg-surface-alt"
					>
						<div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
							<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
							</svg>
						</div>
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
