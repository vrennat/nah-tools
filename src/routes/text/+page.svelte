<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const tools = getFamilyTools('text');

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Text Tools', url: 'https://nah.tools/text' }
	];
</script>

<BreadcrumbSchema items={breadcrumbItems} />

<svelte:head>
	<title>Text Tools — Free Online Word Counter &amp; Find Replace | nah</title>
	<meta
		name="description"
		content="Free text and content tools that run entirely in your browser. Word and character counter, bulk find and replace with regex. No signup, no uploads."
	/>
	<link rel="canonical" href="https://nah.tools/text" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools/text" />
	<meta property="og:title" content="Text Tools — Free Online Utilities | nah" />
	<meta
		property="og:description"
		content="Free text tools that run entirely in your browser. No signup, no uploads."
	/>
	<meta property="og:image" content="https://nah.tools/og.png" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Text Tools',
		url: 'https://nah.tools/text',
		description: 'Free text and content tools that run entirely in your browser.'
	})}</script>`}
</svelte:head>

<div class="space-y-10 py-2">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Text Tools</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Text tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Count words, find and replace in bulk, and more. Every one runs entirely in your browser.
			Your text never leaves your device.
		</p>
	</section>

	<div class="mx-auto max-w-5xl">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool}
				<a
					href={tool.path}
					class="group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
				>
					<div
						class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white"
					>
						{#if tool.icon}
							<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
							</svg>
						{/if}
					</div>
					<h2 class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">
						{tool.name}
					</h2>
					<p class="mt-1 text-sm leading-relaxed text-text-muted">{tool.description}</p>
				</a>
			{/each}
		</div>
	</div>
</div>
