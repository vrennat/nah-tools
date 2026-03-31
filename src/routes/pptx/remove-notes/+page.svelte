<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let done = $state(false);

	let file = $derived(files[0]);
	let canProcess = $derived(!!file && !processing);

	async function process() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';
		done = false;

		try {
			const { removeNotes } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const result = await removeNotes(buf);

			downloadPPTX(result, makeFilename('no-notes', 'pptx'));
			done = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove speaker notes';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Remove Speaker Notes from PowerPoint Online Free | nah</title>
	<meta
		name="description"
		content="Strip all speaker notes from a PowerPoint presentation before sharing. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Remove Speaker Notes"
	description="Strip all speaker notes from your presentation before sharing."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Removes all speaker notes and notes masters from the presentation. Useful before
					sharing a deck externally.
				</p>
			</div>

			{#if done}
				<div role="alert" class="mt-4 rounded-lg bg-success/10 px-3 py-2">
					<p class="text-sm font-medium text-success">Speaker notes removed successfully</p>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canProcess}
					onclick={process}
				>
					{#if processing}
						Removing notes...
					{:else if !file}
						Upload a PPTX
					{:else}
						Remove Notes & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
