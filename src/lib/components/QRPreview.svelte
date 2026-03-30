<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { QRStyleOptions } from '$qr/types';
	import { debounce } from '$utils/debounce';

	let {
		data,
		options,
		onQRReady
	}: {
		data: string;
		options: QRStyleOptions;
		onQRReady?: (qr: any) => void;
	} = $props();

	let container = $state<HTMLDivElement>();
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	onDestroy(() => {
		debouncedGenerate.cancel();
	});

	async function generateQR(d: string, opts: QRStyleOptions) {
		if (!container) return;
		const { createQRCode } = await import('$qr/generator');
		const qr = await createQRCode(d, opts, 1024);
		container.replaceChildren();
		qr.append(container);
		onQRReady?.(qr);
	}

	const debouncedGenerate = debounce((...args: unknown[]) => {
		generateQR(args[0] as string, args[1] as QRStyleOptions);
	}, 300);

	$effect(() => {
		if (!mounted) return;
		if (!data) {
			container?.replaceChildren();
			onQRReady?.(null);
			return;
		}
		debouncedGenerate(data, $state.snapshot(options));
	});
</script>

<div class="flex items-center justify-center rounded-xl border border-border bg-surface-alt p-4">
	{#if !data}
		<div class="flex h-[300px] w-[300px] items-center justify-center text-sm text-text-muted">
			Enter content to generate a QR code
		</div>
	{:else}
		<div
			bind:this={container}
			class="flex items-center justify-center [&>canvas]:max-h-[300px] [&>canvas]:max-w-[300px] [&>svg]:max-h-[300px] [&>svg]:max-w-[300px]"
		></div>
	{/if}
</div>
