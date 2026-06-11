<script lang="ts">
	import { onMount } from 'svelte';
	import BreadcrumbSchema from '$components/BreadcrumbSchema.svelte';

	let PdfEditor: typeof import('./_components/PdfEditor.svelte').default | undefined = $state();

	onMount(async () => {
		const mod = await import('./_components/PdfEditor.svelte');
		PdfEditor = mod.default;
	});

	const canonical = 'https://nah.tools/pdf/edit';

	const breadcrumbItems = [
		{ name: 'nah', url: 'https://nah.tools' },
		{ name: 'PDF Tools', url: 'https://nah.tools/pdf' },
		{ name: 'Edit PDF', url: canonical }
	];
</script>

<svelte:head>
	<title>Edit PDF Online Free — Reorder, Rotate, Annotate Pages | nah.tools</title>
	<meta
		name="description"
		content="Free PDF editor. Reorder, rotate, delete pages, add text and drawings with live preview. No upload — processed entirely in your browser."
	/>
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:url" content={canonical} />
	<meta property="og:title" content="Edit PDF Online Free — Reorder, Rotate, Annotate Pages | nah.tools" />
	<meta property="og:description" content="Free PDF editor. Reorder, rotate, delete pages, add text and drawings with live preview. No upload — processed entirely in your browser." />
	<meta property="og:image" content="https://nah.tools/og.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Edit PDF Online Free — Reorder, Rotate, Annotate Pages | nah.tools" />
	<meta name="twitter:description" content="Free PDF editor. Reorder, rotate, delete pages, add text and drawings with live preview. No upload — processed entirely in your browser." />
	<meta name="twitter:image" content="https://nah.tools/og.png" />

	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: 'Edit PDF',
		url: canonical,
		description: 'Free PDF editor. Reorder, rotate, delete pages, add text and drawings with live preview. No upload — processed entirely in your browser.',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		creator: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' }
	})}</script>`}
</svelte:head>

<BreadcrumbSchema items={breadcrumbItems} />

{#if PdfEditor}
	<PdfEditor />
{:else}
	<div class="flex min-h-[60vh] items-center justify-center">
		<div class="flex items-center gap-3">
			<div class="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
			<span class="text-sm text-text-muted">Loading editor...</span>
		</div>
	</div>
{/if}
