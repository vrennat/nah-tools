<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';

	let files = $state<File[]>([]);
	let text = $state('CONFIDENTIAL');
	let fontSize = $state(48);
	let color = $state('#000000');
	let opacity = $state(0.15);
	let rotation = $state(-45);
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);
	let canApply = $derived(!!file && text.trim().length > 0 && !processing);

	async function apply() {
		if (!canApply || !file) return;
		processing = true;
		error = '';

		try {
			const { addWatermark } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const result = await addWatermark(buf, {
				text: text.trim(),
				fontSize,
				color,
				opacity,
				rotation
			});

			downloadPPTX(result, makeFilename('watermarked', 'pptx'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add watermark';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Add Watermark to PowerPoint Online Free | nah</title>
	<meta
		name="description"
		content="Add a text watermark to all slides of your PowerPoint presentation. Customize text, opacity, rotation, and color. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Add Watermark"
	description="Add a text watermark to all slides of your presentation."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div>
						<label for="watermarkText" class="mb-1 block text-sm font-medium text-text">Watermark text</label>
						<input
							id="watermarkText"
							type="text"
							bind:value={text}
							placeholder="e.g. CONFIDENTIAL, DRAFT, DO NOT COPY"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="wmFontSize" class="mb-1 block text-sm font-medium text-text">Font size: {fontSize}pt</label>
							<input id="wmFontSize" type="range" min="12" max="120" bind:value={fontSize} class="w-full accent-accent" />
						</div>
						<div>
							<label for="wmOpacity" class="mb-1 block text-sm font-medium text-text">Opacity: {Math.round(opacity * 100)}%</label>
							<input id="wmOpacity" type="range" min="0.05" max="0.5" step="0.05" bind:value={opacity} class="w-full accent-accent" />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="wmColor" class="mb-1 block text-sm font-medium text-text">Color</label>
							<div class="flex items-center gap-2">
								<input id="wmColor" type="color" bind:value={color} class="h-9 w-12 rounded border border-border" />
								<span class="font-mono text-sm text-text-muted">{color}</span>
							</div>
						</div>
						<div>
							<label for="wmRotation" class="mb-1 block text-sm font-medium text-text">Rotation: {rotation}&deg;</label>
							<input id="wmRotation" type="range" min="-90" max="90" step="5" bind:value={rotation} class="w-full accent-accent" />
						</div>
					</div>
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canApply}
					onclick={apply}
				>
					{#if processing}
						Applying watermark...
					{:else if !file}
						Upload a PPTX
					{:else}
						Add Watermark & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
