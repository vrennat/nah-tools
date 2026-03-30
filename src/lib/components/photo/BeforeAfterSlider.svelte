<script lang="ts">
	let {
		originalSrc,
		resultCanvas
	}: {
		originalSrc: string;
		resultCanvas: HTMLCanvasElement | null;
	} = $props();

	let container: HTMLDivElement;
	let position = $state(50); // percentage from left
	let dragging = $state(false);

	function updatePosition(clientX: number) {
		if (!container) return;
		const rect = container.getBoundingClientRect();
		const x = clientX - rect.left;
		position = Math.max(0, Math.min(100, (x / rect.width) * 100));
	}

	function handlePointerDown(e: PointerEvent) {
		dragging = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		updatePosition(e.clientX);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!dragging) return;
		updatePosition(e.clientX);
	}

	function handlePointerUp() {
		dragging = false;
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft') {
			position = Math.max(0, position - 2);
		} else if (e.key === 'ArrowRight') {
			position = Math.min(100, position + 2);
		}
	}

	let resultDataUrl = $state('');

	$effect(() => {
		if (resultCanvas) {
			resultDataUrl = resultCanvas.toDataURL('image/png');
		}
	});
</script>

<div
	bind:this={container}
	class="relative select-none overflow-hidden rounded-lg border border-border bg-surface-alt"
	role="slider"
	aria-label="Before and after comparison"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(position)}
	tabindex="0"
	onkeydown={handleKeyDown}
>
	<!-- Checkerboard background for transparent areas -->
	<div
		class="absolute inset-0"
		style="background-image: repeating-conic-gradient(#e0e0e0 0% 25%, #ffffff 0% 50%); background-size: 20px 20px;"
	></div>

	<!-- Result (processed) image — full width, clipped on right side -->
	{#if resultDataUrl}
		<img
			src={resultDataUrl}
			alt="Processed"
			class="relative block w-full"
			draggable="false"
		/>
	{/if}

	<!-- Original image — absolutely positioned, clipped to left portion -->
	<div
		class="absolute inset-0 overflow-hidden"
		style="clip-path: inset(0 {100 - position}% 0 0);"
	>
		<img
			src={originalSrc}
			alt="Original"
			class="block w-full"
			draggable="false"
		/>
	</div>

	<!-- Slider handle -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="absolute inset-y-0 z-10 -ml-0.5 w-1 cursor-ew-resize"
		style="left: {position}%;"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
	>
		<div class="absolute inset-y-0 -left-px w-0.5 bg-white shadow-md"></div>
		<div
			class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white p-1.5 shadow-lg"
		>
			<svg class="h-4 w-4 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
			</svg>
		</div>
	</div>

	<!-- Labels -->
	<div class="pointer-events-none absolute top-3 left-3 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
		Original
	</div>
	<div class="pointer-events-none absolute top-3 right-3 rounded bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
		Removed
	</div>
</div>
