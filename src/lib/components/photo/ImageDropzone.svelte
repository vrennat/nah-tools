<script lang="ts">
	import { isHeic, convertHeicToJpeg } from '$lib/heic';

	let {
		onimage,
		disabled = false
	}: {
		onimage: (file: File) => void;
		disabled?: boolean;
	} = $props();

	let dragging = $state(false);
	let converting = $state(false);
	let fileInput: HTMLInputElement;

	function isImageFile(file: File): boolean {
		return file.type.startsWith('image/') || isHeic(file);
	}

	async function processFile(file: File) {
		if (isHeic(file)) {
			converting = true;
			try {
				const converted = await convertHeicToJpeg(file);
				onimage(converted);
			} catch {
				onimage(file); // Let downstream handle the error
			} finally {
				converting = false;
			}
		} else {
			onimage(file);
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (disabled || converting) return;

		const file = e.dataTransfer?.files[0];
		if (file && isImageFile(file)) {
			processFile(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled && !converting) dragging = true;
	}

	function handleDragLeave() {
		dragging = false;
	}

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			processFile(file);
			// Reset so the same file can be selected again
			(e.target as HTMLInputElement).value = '';
		}
	}

	function handlePaste(e: ClipboardEvent) {
		if (disabled || converting) return;
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					processFile(file);
					break;
				}
			}
		}
	}
</script>

<svelte:document onpaste={handlePaste} />

<button
	type="button"
	class="w-full rounded-xl border-2 border-dashed p-12 text-center transition-colors
		{dragging
		? 'border-accent bg-accent/5'
		: 'border-border hover:border-accent/50 hover:bg-surface-alt'}
		{disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}"
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	onclick={() => fileInput.click()}
	disabled={disabled || converting}
>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*,.heic,.heif"
		class="hidden"
		onchange={handleFileSelect}
	/>

	<div class="flex flex-col items-center gap-3">
		{#if converting}
			<div class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
				<div class="h-7 w-7 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
			</div>
			<div>
				<p class="text-base font-medium text-text">Converting HEIC...</p>
				<p class="mt-1 text-sm text-text-muted">This may take a moment for large files.</p>
			</div>
		{:else}
			<div class="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>

			<div>
				<p class="text-base font-medium text-text">Drop an image here</p>
				<p class="mt-1 text-sm text-text-muted">or click to browse. You can also paste from clipboard.</p>
			</div>

			<p class="text-xs text-text-muted">PNG, JPG, WebP, HEIC — any size</p>
		{/if}
	</div>
</button>
