<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

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
			const { removeAnimations } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const result = await removeAnimations(buf);

			downloadPPTX(result, makeFilename('no-animations', 'pptx'));
			done = true;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove animations';
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to remove animations?',
			answer:
				'No. The operation runs entirely in your browser. Your PPTX is processed locally in memory and offered as a download — nothing is sent to any server.'
		},
		{
			question: 'What types of animations does this remove?',
			answer:
				'All entrance, exit, emphasis, and motion path animations defined in the <p:timing> element of each slide XML are removed. Slide-to-slide transitions defined in <p:transition> elements are also removed. All other slide content is preserved.'
		},
		{
			question: 'Will the slide content still be visible after removing animations?',
			answer:
				'Yes. Removing animations only strips the timing and effect data — the shapes, text, images, and other content they were applied to remain fully intact and visible on the slide.'
		},
		{
			question: 'Why would I want to remove animations from a presentation?',
			answer:
				'Common reasons include: exporting to PDF where animations do not translate; sharing a static version with someone who will not present it live; reducing file size slightly; or avoiding compatibility issues when opening in Keynote, LibreOffice, or Google Slides where animation fidelity varies.'
		},
		{
			question: 'Can I remove animations from only specific slides?',
			answer:
				'Not currently. The tool removes all animation and transition effects from every slide in one pass. If selective removal is needed, split the deck first using the Split Presentation tool, process the relevant portion, and re-merge.'
		}
	];
</script>

<ToolShell
	path="/pptx/remove-animations"
	tagline="Strip all animation effects and slide transitions from a presentation in one click."
	seoTitle="Remove Animations from PowerPoint Free | nah.tools"
	description="Strip all animations and transitions from a PowerPoint presentation. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
				<p class="text-sm text-text-muted">
					Removes all entrance, exit, emphasis, and motion path animations, plus slide
					transitions. Content is preserved — only the animation effects are stripped.
				</p>
			</div>

			{#if done}
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">Animations and transitions removed</p>
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
						Removing animations...
					{:else if !file}
						Upload a PPTX
					{:else}
						Remove Animations & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">When static beats animated</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Animations designed for live delivery often become a liability when the file changes hands.
				Converting to PDF for email attachment? Animations do not survive the export and may cause
				content to be missing on slides where objects were set to appear on click. Sending to a
				colleague who uses Keynote or Google Slides? Transition fidelity across applications is
				inconsistent. Archiving a completed project? A static deck is easier to open and read years
				later.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool removes all timing and effect data from each slide's XML — specifically the
				<code class="rounded bg-surface px-1 text-xs">p:timing</code> and{' '}
				<code class="rounded bg-surface px-1 text-xs">p:transition</code> elements — leaving the
				underlying content exactly as it was. The output is a standard, fully compatible PPTX that
				opens cleanly in any viewer.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Your file is processed entirely in the browser — no uploads, no accounts, no file size
				limits imposed by a server.
			</p>
		</div>
	</section>
</ToolShell>
