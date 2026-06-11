<script lang="ts">
	import type { Snippet } from 'svelte';
	import ToolShell from '$components/ToolShell.svelte';

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

	const fullSeoTitle = $derived(seoTitle ?? `${title} — Free Online Tool | nah`);
</script>

<!--
	Thin wrapper that maps the legacy TextToolShell API onto ToolShell.
	applicationCategory 'UtilityApplication' preserves the original JSON-LD
	category used by all /text tool pages. Do not remove it.
-->
<ToolShell
	path="/text/{slug}"
	h1={title}
	{tagline}
	seoTitle={fullSeoTitle}
	{description}
	{faqs}
	applicationCategory="UtilityApplication"
>
	{@render children()}
</ToolShell>
