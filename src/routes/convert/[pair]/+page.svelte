<script lang="ts">
	import ConvertTool from '$components/convert/ConvertTool.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import { faqsForPair } from '$convert/faqs';

	let { data } = $props();
	const pair = $derived(data.pair);
</script>

<ToolShell
	path="/convert/{pair.slug}"
	tagline={pair.description}
	seoTitle="{pair.title} Free Online — nah"
	description="{pair.description}. Free, private, no upload required. Runs entirely in your browser."
	faqs={faqsForPair(pair)}
>
	<ConvertTool {pair} />
</ToolShell>
