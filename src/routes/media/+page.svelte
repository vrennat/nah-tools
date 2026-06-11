<script lang="ts">
	import { getFamilyTools } from '$lib/registry/index';
	const tools = getFamilyTools('media');
</script>

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
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Video and Audio Tools. <span class="text-accent">No uploads.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Everything runs in your browser. Your files never leave your device.
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
	</div>
</div>
