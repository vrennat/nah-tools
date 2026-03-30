<script lang="ts">
	interface Props {
		title: string;
		description: string;
		slug: string;
		datePublished: string;
		dateModified: string;
	}

	let { title, description, slug, datePublished, dateModified }: Props = $props();

	const schema = $derived({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		description,
		url: `https://nah.tools/why/${slug}`,
		author: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' },
		publisher: { '@type': 'Organization', name: 'nah', url: 'https://nah.tools' },
		datePublished,
		dateModified,
		mainEntityOfPage: `https://nah.tools/why/${slug}`,
		isPartOf: { '@type': 'WebPage', url: 'https://nah.tools/why' }
	});
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
