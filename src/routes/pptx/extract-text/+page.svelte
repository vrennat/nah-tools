<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';
	import type { ExtractedText } from '$pptx/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let error = $state('');
	let slides = $state<ExtractedText[]>([]);

	let file = $derived(files[0]);
	let canExtract = $derived(!!file && !processing);

	let allText = $derived(
		slides.map((s) => `--- Slide ${s.slideNumber} ---\n${s.text}`).join('\n\n')
	);

	async function extract() {
		if (!canExtract || !file) return;
		processing = true;
		error = '';
		slides = [];

		try {
			const { extractText } = await import('$pptx/processor');
			const buf = await file.arrayBuffer();
			slides = await extractText(buf);

			if (slides.every((s) => !s.text.trim())) {
				error = 'No text found in this presentation.';
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract text';
		} finally {
			processing = false;
		}
	}

	function copyToClipboard() {
		navigator.clipboard.writeText(allText);
	}

	function downloadText() {
		const blob = new Blob([allText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = file ? file.name.replace('.pptx', '.txt') : 'extracted-text.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Extract Text from PowerPoint Online Free | nah</title>
	<meta
		name="description"
		content="Extract all text from a PowerPoint presentation slide by slide. Free, no upload — processed entirely in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Extract Text"
	description="Get all text from every slide in your PPTX file."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canExtract}
					onclick={extract}
				>
					{#if processing}
						Extracting...
					{:else if !file}
						Upload a PPTX to extract text
					{:else}
						Extract Text
					{/if}
				</button>
			</div>
		</div>

		{#if slides.length > 0}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-medium text-text">
						Extracted from {slides.length} slide{slides.length === 1 ? '' : 's'}
					</h2>
					<div class="flex gap-2">
						<button
							type="button"
							class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
							onclick={copyToClipboard}
						>
							Copy all
						</button>
						<button
							type="button"
							class="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
							onclick={downloadText}
						>
							Download .txt
						</button>
					</div>
				</div>

				<div class="mt-4 max-h-96 space-y-4 overflow-y-auto">
					{#each slides as slide}
						{#if slide.text.trim()}
							<div>
								<p class="mb-1 text-xs font-medium text-text-muted">Slide {slide.slideNumber}</p>
								<pre class="whitespace-pre-wrap rounded-lg bg-surface-alt px-3 py-2 font-mono text-sm text-text">{slide.text}</pre>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
