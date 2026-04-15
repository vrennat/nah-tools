<script lang="ts">
	type Props = {
		accept: string;
		onFileSelect: (file: File) => void;
		label?: string;
	};

	let { accept, onFileSelect, label = 'Drop your file here or click to browse' }: Props = $props();

	let isDragging = $state(false);
	let inputRef: HTMLInputElement | null = $state(null);

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;

		const files = e.dataTransfer?.files;
		if (files?.length) {
			onFileSelect(files[0]);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleInputChange(e: Event) {
		const files = (e.target as HTMLInputElement).files;
		if (files?.length) {
			onFileSelect(files[0]);
		}
	}
</script>

<div
	class="rounded-xl border-2 border-dashed transition-all duration-200"
	class:border-accent={isDragging}
	class:border-border={!isDragging}
	style={isDragging ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
	ondrop={handleDrop}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	role="button"
	tabindex="0"
>
	<input
		bind:this={inputRef}
		type="file"
		accept={accept}
		onchange={handleInputChange}
		class="hidden"
		aria-label="Select file"
	/>

	<button
		type="button"
		onclick={() => inputRef?.click()}
		class="w-full p-8 text-center"
	>
		<div class="mb-3 flex justify-center">
			<svg
				class="h-12 w-12 text-text-muted"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z"
				/>
			</svg>
		</div>
		<h3 class="font-display font-600 text-text">
			{label}
		</h3>
		<p class="mt-1 text-sm text-text-muted">
			Maximum 4GB file size
		</p>
	</button>
</div>
