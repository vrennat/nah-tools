<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

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

	const faqs = [
		{
			question: 'Are my files uploaded to add slide numbers?',
			answer:
				'No. The operation runs entirely in your browser. Your PPTX is processed locally and offered as a download — nothing is sent to any server.'
		},
		{
			question: 'How are the slide numbers added to the file?',
			answer:
				'A small text box shape is inserted into the shape tree of each slide\'s XML at the bottom-left, bottom-center, or bottom-right position, with a fixed offset of 0.5 inches from the edges. The shape id is computed dynamically to avoid colliding with existing ids in the slide.'
		},
		{
			question: 'Can I start numbering from a number other than 1?',
			answer:
				'Yes. Use the "Start from" field to set any starting number. This is useful when this deck is part of a larger presentation and you want the numbers to continue from where another deck left off.'
		},
		{
			question: 'Will the numbers conflict with existing slide number placeholders?',
			answer:
				'The tool adds explicit text box shapes rather than activating the native slide number placeholder. If the slide master already has a slide number placeholder configured, both may appear. For clean results, remove the master placeholder first or use this tool on decks without one.'
		},
		{
			question: 'What is the appearance of the added numbers?',
			answer:
				'Numbers are rendered in gray (#666666) at the font size you choose (8pt to 24pt, default 12pt). There is no background fill or border on the text box — just the number positioned at the bottom edge of the slide.'
		}
	];
</script>

<ToolShell
	path="/pptx/slide-numbers"
	tagline="Number every slide automatically. Choose position, font size, and starting number."
	seoTitle="Add Slide Numbers to PowerPoint Free | nah.tools"
	description="Add slide numbers to your PowerPoint presentation. Choose position and starting number. Free, no upload — processed in your browser."
	{faqs}
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
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why add slide numbers directly to the file?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PowerPoint has a built-in slide number placeholder, but it requires the slide master to have
				it configured and it only activates when "Show on all slides" is enabled through the Header
				and Footer dialog. That setting is easy to lose when a deck is copied, re-themed, or opened
				in a different application.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool takes a different approach: it writes the slide number as an explicit text shape
				directly into each slide's XML. The number is visible in every viewer and survives PDF
				export, theme changes, and application migrations — because it is just a text box with a
				number in it, nothing dependent on the master configuration.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The custom "Start from" field is useful when you have split a larger deck and want each
				portion to carry sequential numbers that match the original slide order.
			</p>
		</div>
	</section>
</ToolShell>
