<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PptxToolLayout from '$components/pptx/PptxToolLayout.svelte';

	let files = $state<File[]>([]);
	let position = $state<'bottom-left' | 'bottom-center' | 'bottom-right'>('bottom-right');
	let fontSize = $state(12);
	let startFrom = $state(1);
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);
	let canProcess = $derived(!!file && !processing);

	async function process() {
		if (!canProcess || !file) return;
		processing = true;
		error = '';

		try {
			const { addSlideNumbers } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const result = await addSlideNumbers(buf, { position, fontSize, startFrom });

			downloadPPTX(result, makeFilename('numbered', 'pptx'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add slide numbers';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Add Slide Numbers to PowerPoint Online Free | nah</title>
	<meta
		name="description"
		content="Add slide numbers to your PowerPoint presentation. Choose position and starting number. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PptxToolLayout
	title="Add Slide Numbers"
	description="Automatically number every slide in your presentation."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div>
						<p class="mb-2 text-sm font-medium text-text">Position</p>
						<div class="flex gap-3">
							{#each [
								{ value: 'bottom-left', label: 'Bottom left' },
								{ value: 'bottom-center', label: 'Bottom center' },
								{ value: 'bottom-right', label: 'Bottom right' }
							] as opt}
								<button
									type="button"
									class="rounded-full px-4 py-1.5 text-sm font-medium transition-colors {position === opt.value
										? 'bg-accent text-white'
										: 'border border-border text-text hover:bg-surface-alt'}"
									onclick={() => (position = opt.value as typeof position)}
								>
									{opt.label}
								</button>
							{/each}
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div>
							<label for="snFontSize" class="mb-1 block text-sm font-medium text-text">
								Font size: {fontSize}pt
							</label>
							<input
								id="snFontSize"
								type="range"
								min="8"
								max="24"
								bind:value={fontSize}
								class="w-full accent-accent"
							/>
						</div>
						<div>
							<label for="snStartFrom" class="mb-1 block text-sm font-medium text-text">Start from</label>
							<input
								id="snStartFrom"
								type="number"
								min="0"
								max="999"
								bind:value={startFrom}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
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
					disabled={!canProcess}
					onclick={process}
				>
					{#if processing}
						Adding numbers...
					{:else if !file}
						Upload a PPTX
					{:else}
						Add Slide Numbers & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pptx" class="underline hover:text-accent">Back to all PowerPoint tools</a>
		</p>
	</section>
</PptxToolLayout>
