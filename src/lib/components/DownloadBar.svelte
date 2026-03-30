<script lang="ts">
	import { onMount } from 'svelte';
	import type { QRStyleOptions } from '$qr/types';
	import { exportPNG, exportSVG } from '$qr/generator';
	import { downloadBlob, makeFilename, exportPDF } from '$qr/exporter';
	import { canShare, shareQR } from '$utils/share';

	let {
		data,
		qr,
		options
	}: {
		data: string;
		qr: any;
		options: QRStyleOptions;
	} = $props();

	let disabled = $derived(!data || !qr);
	let showShare = $state(false);

	onMount(() => {
		showShare = canShare();
	});

	async function downloadPNG() {
		if (disabled) return;
		const blob = await exportPNG(qr);
		downloadBlob(blob, makeFilename('nah-qr', 'png'));
	}

	async function downloadSVG() {
		if (disabled) return;
		const blob = await exportSVG(qr);
		downloadBlob(blob, makeFilename('nah-qr', 'svg'));
	}

	async function downloadPDF() {
		if (disabled) return;
		const svgBlob = await exportSVG(qr);
		const pdfBlob = await exportPDF(svgBlob);
		downloadBlob(pdfBlob, makeFilename('nah-qr', 'pdf'));
	}

	async function share() {
		if (disabled) return;
		const blob = await exportPNG(qr);
		await shareQR(blob, makeFilename('nah-qr', 'png'));
	}

	const primaryClass =
		'rounded-full px-5 py-2.5 text-sm font-medium transition-colors bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed';
	const secondaryClass =
		'rounded-full px-5 py-2.5 text-sm font-medium transition-colors border border-border text-text hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed';
</script>

<div class="flex flex-wrap items-center gap-2">
	<button type="button" class={primaryClass} {disabled} onclick={downloadPNG}>PNG</button>
	<button type="button" class={secondaryClass} {disabled} onclick={downloadSVG}>SVG</button>
	<button type="button" class={secondaryClass} {disabled} onclick={downloadPDF}>PDF</button>
	{#if showShare}
		<button type="button" class={secondaryClass} {disabled} onclick={share}>Share</button>
	{/if}
</div>
