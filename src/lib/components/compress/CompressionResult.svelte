<script lang="ts">
	import type { CompressionResult } from '$compress/types';

	let {
		originalSize,
		result,
		ondownload,
		onreset
	}: {
		originalSize: number;
		result: CompressionResult;
		ondownload: () => void;
		onreset: () => void;
	} = $props();

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}

	let savings = $derived(((1 - result.size / originalSize) * 100).toFixed(1));
	let isSmaller = $derived(result.size < originalSize);
</script>

<div class="space-y-4">
	<!-- Stats grid -->
	<div class="grid grid-cols-3 gap-3">
		<div class="rounded-lg border border-border bg-surface-alt p-3 text-center">
			<p class="text-xs text-text-muted">Original</p>
			<p class="mt-1 font-mono text-sm font-semibold text-text">{formatSize(originalSize)}</p>
		</div>
		<div class="rounded-lg border border-border bg-surface-alt p-3 text-center">
			<p class="text-xs text-text-muted">Compressed</p>
			<p class="mt-1 font-mono text-sm font-semibold text-text">{formatSize(result.size)}</p>
		</div>
		<div class="rounded-lg border p-3 text-center {isSmaller ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5'}">
			<p class="text-xs text-text-muted">Savings</p>
			<p class="mt-1 font-mono text-sm font-semibold {isSmaller ? 'text-success' : 'text-warning'}">
				{isSmaller ? '' : '+'}{savings}%
			</p>
		</div>
	</div>

	<!-- Encode time -->
	<p class="text-center text-xs text-text-muted">
		Encoded in {result.encodeTimeMs}ms as {result.codec.toUpperCase()}
	</p>

	<!-- Actions -->
	<div class="flex gap-3">
		<button
			type="button"
			class="flex-1 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			onclick={ondownload}
		>
			Download {result.extension.toUpperCase()}
		</button>
		<button
			type="button"
			class="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
			onclick={onreset}
		>
			New Image
		</button>
	</div>
</div>
