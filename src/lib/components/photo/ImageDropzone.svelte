<script lang="ts">
	let {
		onimage,
		disabled = false
	}: {
		onimage: (file: File) => void;
		disabled?: boolean;
	} = $props();

	let dragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		if (disabled) return;

		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			onimage(file);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled) dragging = true;
	}

	function handleDragLeave() {
		dragging = false;
	}

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) {
			onimage(file);
			// Reset so the same file can be selected again
			(e.target as HTMLInputElement).value = '';
		}
	}

	function handlePaste(e: ClipboardEvent) {
		if (disabled) return;
		const items = e.clipboardData?.items;
		if (!items) return;

		for (const item of items) {
			if (item.type.startsWith('image/')) {
				const file = item.getAsFile();
				if (file) {
					onimage(file);
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
	{disabled}
>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={handleFileSelect}
	/>

	<div class="flex flex-col items-center gap-3">
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

		<p class="text-xs text-text-muted">PNG, JPG, WebP — any size</p>
	</div>
</button>
