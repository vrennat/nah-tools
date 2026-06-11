<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

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

	const faqs = [
		{
			question: 'Are my files uploaded to add a watermark?',
			answer:
				'No. The watermark is applied entirely in your browser. Your PPTX never leaves your device — no upload, no account, no data retention.'
		},
		{
			question: 'How is the watermark drawn in the slide?',
			answer:
				'The tool inserts a transparent text box spanning the full slide dimensions into the shape tree of each slide\'s XML. The text is center-aligned and rotated at your chosen angle. It uses OOXML\'s alpha transparency to control opacity. The shape id is computed dynamically so it does not collide with existing shape ids.'
		},
		{
			question: 'Is the watermark permanent?',
			answer:
				'The watermark is a standard text shape written into the slide XML. A determined recipient with a PPTX editor could select and delete it, but it cannot be toggled off or hidden simply by opening the file. It will appear on screen and in print as part of the slide content.'
		},
		{
			question: 'Can I control how visible the watermark is?',
			answer:
				'Yes. You can adjust the opacity (5% to 50%), font size (12pt to 120pt), color, and rotation angle. The defaults — "CONFIDENTIAL" at 15% opacity, -45 degrees — are a standard choice for document review workflows.'
		},
		{
			question: 'What text can I use as a watermark?',
			answer:
				'Any text string. Common choices are CONFIDENTIAL, DRAFT, DO NOT COPY, FOR REVIEW ONLY, or a company name. The same text is stamped on every slide in the presentation.'
		}
	];
</script>

<ToolShell
	path="/pptx/watermark"
	tagline="Stamp every slide with a custom text watermark. Control opacity, rotation, and color."
	seoTitle="Add Watermark to PowerPoint Free — Text Overlay | nah.tools"
	description="Add a text watermark to all slides of your PowerPoint presentation. Customize text, opacity, rotation, and color. Free, no upload — processed in your browser."
	{faqs}
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">When to watermark a presentation</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Watermarks communicate document status at a glance — reviewers know a draft is not final,
				recipients know a copy is for reference only, and distributed files are clearly marked with
				ownership or classification information. A diagonal "CONFIDENTIAL" stamp across every slide
				is standard practice in legal, financial, and HR review workflows.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool inserts the watermark as a native OOXML text shape in each slide's shape tree,
				sized to span the full slide and positioned in the center. The result renders correctly in
				PowerPoint, Keynote, Google Slides, and when the deck is exported to PDF or printed.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Because everything runs in your browser, sensitive decks — investor materials, board
				presentations, unreleased product roadmaps — never leave your device during the watermarking
				process.
			</p>
		</div>
	</section>
</ToolShell>
