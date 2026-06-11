<script lang="ts">
	import ConvertTool from '$components/convert/ConvertTool.svelte';

	let { data } = $props();
	const pair = $derived(data.pair);
</script>

<svelte:head>
	<title>{pair.title} Free Online — nah</title>
	<meta
		name="description"
		content="{pair.description} Free, private, no upload required. Runs entirely in your browser."
	/>
</svelte:head>

<ConvertTool {pair} />
