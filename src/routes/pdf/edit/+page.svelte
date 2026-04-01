<script lang="ts">
	import { onMount } from 'svelte';

	let PdfEditor: typeof import('./_components/PdfEditor.svelte').default | undefined = $state();

	onMount(async () => {
		const mod = await import('./_components/PdfEditor.svelte');
		PdfEditor = mod.default;
	});
</script>

<svelte:head>
	<title>Edit PDF Online Free — Reorder, Rotate, Delete Pages | nah</title>
	<meta
		name="description"
		content="Free PDF editor. Reorder, rotate, and delete pages with live preview. No upload — processed entirely in your browser."
	/>
</svelte:head>

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
