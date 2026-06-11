<script lang="ts">
	import { onMount } from 'svelte';
	import { consumePendingFile } from '$lib/file-transfer';

	let {
		accept = '.pdf',
		multiple = false,
		files = $bindable<File[]>([]),
		maxSizeMB = 100,
		label = 'Drop files here or click to browse',
		/**
		 * When true, check for a pending file on mount and inject it as if the user
		 * dropped it. Only set this on PDF tool pages — FileDropZone is also used by
		 * PPTX and image-convert flows where chaining is not wired up.
		 */
		acceptPendingFile = false
	} = $props();

	let dragging = $state(false);
	let fileInput: HTMLInputElement;
	let error = $state('');
	/** Set when a file arrived via the chaining mechanism, cleared when dismissed. */
	let chainedFrom = $state<string | null>(null);

	onMount(() => {
		if (!acceptPendingFile) return;
		const pending = consumePendingFile();
		if (!pending) return;

		// Synthesise a File and run it through the same validation path as a normal drop.
		// Cast via Uint8Array so the File constructor receives an unambiguous ArrayBuffer.
		const syntheticFile = new File([new Uint8Array(pending.bytes)], pending.name, { type: 'application/pdf' });
		const list = makeFileList([syntheticFile]);
		validateAndAdd(list);

		if (pending.sourceLabel) {
			chainedFrom = pending.sourceLabel;
		}
	});

	/** Build a minimal FileList-compatible object from an array of Files. */
	function makeFileList(arr: File[]): FileList {
		const dt = new DataTransfer();
		for (const f of arr) dt.items.add(f);
		return dt.files;
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function validateAndAdd(newFiles: FileList | null) {
		if (!newFiles) return;
		error = '';

		const accepted = accept.split(',').map((a) => a.trim().toLowerCase());
		const valid: File[] = [];

		for (const file of newFiles) {
			const ext = '.' + file.name.split('.').pop()?.toLowerCase();
			if (!accepted.includes(ext)) {
				error = `Invalid file type: ${file.name}. Accepted: ${accept}`;
				continue;
			}
			if (file.size > maxSizeMB * 1024 * 1024) {
				error = `File too large: ${file.name} (${formatSize(file.size)}). Max: ${maxSizeMB}MB`;
				continue;
			}
			valid.push(file);
		}

		if (valid.length > 0) {
			files = multiple ? [...files, ...valid] : [valid[0]];
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		validateAndAdd(e.dataTransfer?.files ?? null);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragging = true;
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-3">
	{#if chainedFrom}
		<div class="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/5 px-3 py-2">
			<p class="text-sm text-text">
				Continuing with <span class="font-medium">"{files[0]?.name}"</span> from {chainedFrom}
			</p>
			<button
				type="button"
				aria-label="Dismiss"
				class="ml-3 text-text-muted transition-colors hover:text-text"
				onclick={() => (chainedFrom = null)}
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	{/if}

	<button
		type="button"
		class="w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors {dragging
			? 'border-accent bg-accent/5'
			: 'border-border hover:border-accent/50'}"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={() => (dragging = false)}
		onclick={() => fileInput.click()}
	>
		<svg
			class="mx-auto mb-3 h-10 w-10 text-text-muted"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="1.5"
				d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
			/>
		</svg>
		<p class="text-sm font-medium text-text">{label}</p>
		<p class="mt-1 text-xs text-text-muted">
			{accept === '.pdf' ? 'PDF files' : accept.replace(/\./g, '').toUpperCase()} up to {maxSizeMB}MB
		</p>
	</button>

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		class="hidden"
		onchange={(e) => {
			const target = e.target as HTMLInputElement;
			validateAndAdd(target.files);
			target.value = '';
		}}
	/>

	{#if error}
		<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
	{/if}

	{#if files.length > 0}
		<ul class="space-y-2">
			{#each files as file, i}
				<li
					class="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2"
				>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-text">{file.name}</p>
						<p class="text-xs text-text-muted">{formatSize(file.size)}</p>
					</div>
					<button
						type="button"
						aria-label="Remove {file.name}"
						class="ml-3 text-text-muted transition-colors hover:text-error"
						onclick={() => removeFile(i)}
					>
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
