<script lang="ts">
	import type { ConversionResult } from '$convert/types';

	let { results } = $props<{ results: ConversionResult[] }>();

	function downloadFile(result: ConversionResult) {
		const url = URL.createObjectURL(result.blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = result.filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	async function downloadAll() {
		if (results.length === 0) return;

		const JSZip = await import('jszip');
		const zip = new JSZip.default();

		for (const result of results) {
			zip.file(result.filename, result.blob);
		}

		const blob = await zip.generateAsync({ type: 'blob' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `converted-images.zip`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	function formatPercent(reduction: number): string {
		return `${reduction > 0 ? '-' : '+'}${Math.abs(reduction).toFixed(0)}%`;
	}
</script>

{#if results.length > 0}
	<div class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="text-lg font-semibold text-text">Conversion Results</h2>
			{#if results.length > 1}
				<button
					type="button"
					onclick={downloadAll}
					class="rounded-full bg-accent px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Download All as ZIP
				</button>
			{/if}
		</div>

		<ul class="space-y-3">
			{#each results as result}
				{@const percent = formatPercent(
					((result.originalSize - result.convertedSize) / result.originalSize) * 100
				)}
				<li
					class="flex items-center justify-between rounded-lg border border-border bg-surface-alt p-4"
				>
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium text-text">{result.filename}</p>
						<div class="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
							<span>{formatSize(result.originalSize)}</span>
							<span>→</span>
							<span>{formatSize(result.convertedSize)}</span>
							<span class={percent.startsWith('-') ? 'text-success' : 'text-error'}>
								{percent}
							</span>
						</div>
					</div>
					<button
						type="button"
						onclick={() => downloadFile(result)}
						class="ml-4 flex-shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
					>
						Download
					</button>
				</li>
			{/each}
		</ul>
	</div>
{/if}
