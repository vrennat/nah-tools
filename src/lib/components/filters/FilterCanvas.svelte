<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { FilterRenderer } from '$filters/renderer';
	import type { AdjustmentParams, CurvesParams } from '$filters/types';

	let {
		image,
		params,
		curves,
		onrenderer
	}: {
		image: HTMLImageElement;
		params: AdjustmentParams;
		curves?: CurvesParams;
		onrenderer?: (renderer: FilterRenderer) => void;
	} = $props();

	let canvas: HTMLCanvasElement;
	let renderer: FilterRenderer | null = $state(null);

	onMount(() => {
		renderer = new FilterRenderer(canvas, image);
		renderer.render(params, curves);
		onrenderer?.(renderer);
	});

	// Re-render whenever params or curves change
	$effect(() => {
		if (renderer) {
			renderer.render(params, curves);
		}
	});

	onDestroy(() => {
		renderer?.destroy();
	});
</script>

<canvas
	bind:this={canvas}
	class="max-h-[60vh] w-full rounded-lg border border-border object-contain"
	style="image-rendering: auto;"
></canvas>
