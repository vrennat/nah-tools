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

	const faqs = [
		{
			question: 'Are my files uploaded to remove speaker notes?',
			answer:
				'No. The operation runs entirely in your browser. The PPTX is processed in memory and offered as a download — nothing is sent to any server.'
		},
		{
			question: 'What exactly is removed from the file?',
			answer:
				'All notesSlide XML files (ppt/notesSlides/), their relationship entries, all notesMaster files (ppt/notesMasters/), and the corresponding content-type overrides in [Content_Types].xml. The result is a clean PPTX with no notes-related parts that would trigger a repair prompt when opened.'
		},
		{
			question: 'Are the slide contents affected in any way?',
			answer:
				'No. Only the notes parts are removed. Slide content, animations, transitions, themes, fonts, and media are all left untouched.'
		},
		{
			question: 'Will the output file still open in all viewers?',
			answer:
				'Yes. Removing notes produces a fully valid PPTX. The file opens normally in PowerPoint, Google Slides, Keynote, and LibreOffice Impress.'
		},
		{
			question: 'Can I remove notes from just specific slides?',
			answer:
				'Not currently. The tool removes all speaker notes from every slide in one pass. If you need selective removal, split the deck first, remove notes from the relevant portion, and re-merge.'
		}
	];
</script>

<ToolShell
	path="/pptx/remove-notes"
	tagline="Strip all speaker notes before sharing a deck externally."
	seoTitle="Remove Speaker Notes from PowerPoint Free | nah.tools"
	description="Strip all speaker notes from a PowerPoint presentation before sharing. Free, no upload — processed in your browser."
	{faqs}
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
				<div class="mt-4 rounded-lg bg-success/10 px-4 py-3">
					<p class="text-sm font-medium text-success">Speaker notes removed successfully</p>
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
						Removing notes...
					{:else if !file}
						Upload a PPTX
					{:else}
						Remove Notes & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why remove speaker notes before sharing?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Speaker notes are written for the presenter, not the audience. They often contain internal
				context, talking points with candid language, or references to information that should not
				be part of the public record — sales strategy, competitive positioning, staffing decisions.
				Sharing a deck externally without stripping notes is a common source of accidental
				information disclosure.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				PowerPoint does not surface notes visibly in Slide Show mode, which makes it easy to forget
				they are in the file. This tool removes them at the file level — the notes are gone from
				the PPTX itself, not just hidden from view.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				The operation is irreversible on the output file, so keep a copy of the original if you
				need the notes for future presentations. The tool processes your file locally without
				uploading anything, so the notes themselves never pass through an external service.
			</p>
		</div>
	</section>
</ToolShell>
