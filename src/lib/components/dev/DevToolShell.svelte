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

	// Dev pages use a more descriptive title prop ("JSON Formatter & Validator")
	// than the short registry name ("JSON Formatter"). Pass it as h1 so the
	// displayed heading matches the original and the registry lookup still works.
	const fullSeoTitle = $derived(seoTitle ?? `${title} — Free Online Tool | nah`);
</script>

<!--
	Thin wrapper that maps the legacy DevToolShell API onto ToolShell.
	applicationCategory 'DeveloperApplication' preserves the original JSON-LD
	category used by all /dev tool pages. Do not remove it.
-->
<ToolShell
	path="/dev/{slug}"
	h1={title}
	{tagline}
	seoTitle={fullSeoTitle}
	{description}
	{faqs}
	applicationCategory="DeveloperApplication"
>
	{@render children()}
</ToolShell>
