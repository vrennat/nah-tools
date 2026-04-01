<script lang="ts">
	import type { DrawAnnotation } from '$pdf/types';
	import { pdfToScreen } from '$pdf/coordinates';
	import type { PageTransform } from '$pdf/types';

	interface Props {
		drawAnnotations: DrawAnnotation[];
		transform: PageTransform;
		activeTool: string;
		pageIndex: number;
		onaddstroke: (stroke: { x: number; y: number }[], color: string, width: number) => void;
	}

	let { drawAnnotations, transform, activeTool, pageIndex, onaddstroke }: Props = $props();

	let svgEl: SVGSVGElement | undefined = $state();
	let drawing = $state(false);
	let currentPoints = $state<{ x: number; y: number }[]>([]);

	// Drawing settings
	let strokeColor = '#000000';
	let strokeWidth = 2;

	function handlePointerDown(e: PointerEvent) {
		if (activeTool !== 'draw') return;
		e.preventDefault();
		e.stopPropagation();
		drawing = true;

		const pt = getRelativePoint(e);
		currentPoints = [pt];

		(e.target as Element).setPointerCapture(e.pointerId);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!drawing) return;
		e.preventDefault();
		const pt = getRelativePoint(e);
		currentPoints = [...currentPoints, pt];
	}

	function handlePointerUp(e: PointerEvent) {
		if (!drawing) return;
		e.preventDefault();
		(e.target as Element).releasePointerCapture(e.pointerId);
		drawing = false;

		if (currentPoints.length >= 2) {
			// Convert screen points to PDF coordinates
			const pdfPoints = currentPoints.map((pt) => {
				const pdfX = pt.x / transform.scale;
				const pdfY = transform.pdfHeight - pt.y / transform.scale;
				return { x: pdfX, y: pdfY };
			});
			onaddstroke(pdfPoints, strokeColor, strokeWidth * (1 / transform.scale));
		}

		currentPoints = [];
	}

	function getRelativePoint(e: PointerEvent): { x: number; y: number } {
		if (!svgEl) return { x: 0, y: 0 };
		const rect = svgEl.getBoundingClientRect();
		return {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	function buildPathD(points: { x: number; y: number }[]): string {
		if (points.length < 2) return '';
		let d = `M ${points[0].x} ${points[0].y}`;
		for (let i = 1; i < points.length; i++) {
			d += ` L ${points[i].x} ${points[i].y}`;
		}
		return d;
	}

	function buildPdfPathD(pdfPoints: { x: number; y: number }[]): string {
		const screenPoints = pdfPoints.map((pt) =>
			pdfToScreen(pt.x, pt.y, transform)
		);
		return buildPathD(screenPoints);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svg
	bind:this={svgEl}
	class="absolute inset-0"
	style="width: {transform.canvasWidth}px; height: {transform.canvasHeight}px;
		   pointer-events: {activeTool === 'draw' ? 'auto' : 'none'};
		   cursor: {activeTool === 'draw' ? 'crosshair' : 'default'};"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerUp}
>
	<!-- Existing draw annotations -->
	{#each drawAnnotations as ann}
		{#each ann.paths as path}
			<path
				d={buildPdfPathD(path)}
				fill="none"
				stroke={ann.strokeColor}
				stroke-width={ann.strokeWidth * transform.scale}
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		{/each}
	{/each}

	<!-- Current stroke being drawn -->
	{#if currentPoints.length >= 2}
		<path
			d={buildPathD(currentPoints)}
			fill="none"
			stroke={strokeColor}
			stroke-width={strokeWidth}
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	{/if}
</svg>
