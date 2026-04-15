<script lang="ts">
	import { page } from '$app/state';
	import { error } from '@sveltejs/kit';
	import { getPair } from '$convert/pairs';
	import ConvertTool from '$components/convert/ConvertTool.svelte';

	const slug = $derived(page.params.pair ?? '');
	const pair = $derived(getPair(slug));

	$effect(() => {
		if (!pair) {
			error(404, 'Conversion not found');
		}
	});
</script>

<svelte:head>
	{#if pair}
		<title>{pair.title} Free Online — nah</title>
		<meta
			name="description"
			content="{pair.description} Free, private, no upload required. Runs entirely in your browser."
		/>
	{/if}
</svelte:head>

{#if pair}
	<ConvertTool {pair} />
{/if}
