<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';
	import type { PptxMetadata } from '$pptx/types';

	let files = $state<File[]>([]);
	let processing = $state(false);
	let saving = $state(false);
	let error = $state('');
	let metadata = $state<PptxMetadata | null>(null);

	let file = $derived(files[0]);

	$effect(() => {
		if (!file) {
			metadata = null;
			return;
		}
		const currentFile = file;
		metadata = null;
		error = '';
		currentFile.arrayBuffer().then(async (buf) => {
			if (file !== currentFile) return;
			const { getMetadata } = await import('$pptx/processor');
			const meta = await getMetadata(buf);
			if (file !== currentFile) return;
			metadata = meta;
		}).catch((e) => {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to read metadata';
		});
	});

	async function save() {
		if (!file || !metadata) return;
		saving = true;
		error = '';

		try {
			const { updateMetadata } = await import('$pptx/processor');
			const { downloadPPTX, makeFilename } = await import('$pptx/exporter');

			const buf = await file.arrayBuffer();
			const result = await updateMetadata(buf, metadata);

			downloadPPTX(result, makeFilename('updated-metadata', 'pptx'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update metadata';
		} finally {
			saving = false;
		}
	}

	const faqs = [
		{
			question: 'Are my files uploaded to edit metadata?',
			answer:
				'No. Both reading and writing metadata happen entirely in your browser. The PPTX is processed in memory and offered as a download — nothing is sent to any server.'
		},
		{
			question: 'Which metadata fields can I edit?',
			answer:
				'Title, author (creator), subject, description, category, and keywords. These are the Dublin Core and OOXML core properties stored in docProps/core.xml inside the PPTX. Created and modified timestamps are read-only and are not editable through this tool.'
		},
		{
			question: 'Why would I want to edit presentation metadata?',
			answer:
				'Common reasons include: removing the original author\'s name before sharing externally, setting a title and keywords for document management systems that index file properties, or cleaning up default values left by presentation templates.'
		},
		{
			question: 'Does editing metadata affect the slide content?',
			answer:
				'No. Only the docProps/core.xml file is modified. Slide content, layouts, themes, animations, and media are all untouched.'
		},
		{
			question: 'Is the modification date updated when I save?',
			answer:
				'Yes. The tool automatically sets the dcterms:modified field to the current date and time when you save, which is standard behavior for any application that writes a PPTX file.'
		}
	];
</script>

<ToolShell
	path="/pptx/metadata"
	tagline="View and edit the title, author, and document properties stored inside your PPTX."
	seoTitle="Edit PowerPoint Metadata Free — Title, Author | nah.tools"
	description="View and edit PowerPoint file metadata — title, author, subject, keywords, and more. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pptx" bind:files label="Drop a PPTX file here or click to browse" />

			{#if metadata}
				<div class="mt-6 space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="metaTitle" class="mb-1 block text-sm font-medium text-text">Title</label>
							<input
								id="metaTitle"
								type="text"
								bind:value={metadata.title}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
						<div>
							<label for="metaCreator" class="mb-1 block text-sm font-medium text-text">Author</label>
							<input
								id="metaCreator"
								type="text"
								bind:value={metadata.creator}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<label for="metaSubject" class="mb-1 block text-sm font-medium text-text">Subject</label>
							<input
								id="metaSubject"
								type="text"
								bind:value={metadata.subject}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
						<div>
							<label for="metaCategory" class="mb-1 block text-sm font-medium text-text">Category</label>
							<input
								id="metaCategory"
								type="text"
								bind:value={metadata.category}
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
					</div>

					<div>
						<label for="metaDescription" class="mb-1 block text-sm font-medium text-text">Description</label>
						<textarea
							id="metaDescription"
							bind:value={metadata.description}
							rows="2"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						></textarea>
					</div>

					<div>
						<label for="metaKeywords" class="mb-1 block text-sm font-medium text-text">Keywords</label>
						<input
							id="metaKeywords"
							type="text"
							bind:value={metadata.keywords}
							placeholder="Comma-separated keywords"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>

					{#if metadata.created || metadata.modified || metadata.lastModifiedBy}
						<div class="rounded-lg border border-border bg-surface-alt px-4 py-3">
							<p class="mb-1 text-xs font-medium text-text-muted">Read-only properties</p>
							<div class="space-y-1 text-xs text-text-muted">
								{#if metadata.created}
									<p>Created: {new Date(metadata.created).toLocaleString()}</p>
								{/if}
								{#if metadata.modified}
									<p>Modified: {new Date(metadata.modified).toLocaleString()}</p>
								{/if}
								{#if metadata.lastModifiedBy}
									<p>Last modified by: {metadata.lastModifiedBy}</p>
								{/if}
								{#if metadata.revision}
									<p>Revision: {metadata.revision}</p>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}

			{#if error}
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!metadata || saving}
					onclick={save}
				>
					{#if saving}
						Saving...
					{:else if !file}
						Upload a PPTX to edit metadata
					{:else if !metadata}
						Loading metadata...
					{:else}
						Save Metadata & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">What is stored in PPTX metadata?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Every PPTX file contains a docProps/core.xml file that stores document-level properties
				defined by the Dublin Core and OOXML specifications. This includes the title, subject,
				author, description, keywords, category, and timestamps for creation and last modification.
				These fields are set automatically by PowerPoint when a file is created or saved, and they
				persist when the file is shared.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Metadata travels with the file and is often indexed by document management systems, email
				servers, and search tools. A presentation saved under one person's name and shared with a
				client will still carry that author's name in the properties panel. Cleaning up these fields
				before distribution is a simple housekeeping step that is easy to overlook.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool reads and writes only the core properties. Slide content, themes, animations, and
				media are not touched. Your file is processed entirely in the browser — no server, no
				upload, no account.
			</p>
		</div>
	</section>
</ToolShell>
