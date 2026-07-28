<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	import BreadcrumbSchema from '$lib/components/BreadcrumbSchema.svelte';

	const guides = getFamilyTools('guides');

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'Guides', url: 'https://nah.tools/guides' }
	];
</script>

<BreadcrumbSchema items={breadcrumbItems} />

<svelte:head>
	<title>Guides — How to Get Things Done Without the SaaS Upsell | nah</title>
	<meta
		name="description"
		content="Practical how-to guides for PDFs, video, audio, resumes, and online privacy — written around the free tools that do the job, no upload required."
	/>
	<link rel="canonical" href="https://nah.tools/guides" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools/guides" />
	<meta property="og:title" content="Guides — How to Get Things Done Without the SaaS Upsell | nah" />
	<meta
		property="og:description"
		content="Practical how-to guides for PDFs, video, audio, resumes, and online privacy — written around the free tools that do the job."
	/>
	<meta property="og:image" content="https://nah.tools/og.png" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'Guides',
		url: 'https://nah.tools/guides',
		description: 'Practical how-to guides for PDFs, video, audio, resumes, and online privacy.'
	})}</script>`}
</svelte:head>

<div class="space-y-10 py-2">
	<nav class="flex items-center gap-1.5 text-sm text-text-muted" aria-label="Breadcrumb">
		<a href="/" class="transition-colors hover:text-accent">nah</a>
		<span aria-hidden="true">/</span>
		<span class="text-text">Guides</span>
	</nav>

	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Guides. <span class="text-accent">No upsell.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Practical how-to articles for the tasks people actually search for — written around the free
			tools that get them done.
		</p>
	</section>

	<div class="mx-auto max-w-5xl">
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each guides as guide}
				<a
					href={guide.path}
					class="group rounded-2xl border border-border bg-surface-alt p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-card-hover"
				>
					<h2 class="font-display font-700 text-text transition-colors duration-200 group-hover:text-accent">
						{guide.name}
					</h2>
					<p class="mt-1 text-sm leading-relaxed text-text-muted">{guide.description}</p>
				</a>
			{/each}
		</div>
	</div>
</div>
