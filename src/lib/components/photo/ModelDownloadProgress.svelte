<script lang="ts">
	let {
		loaded,
		total
	}: {
		loaded: number;
		total: number;
	} = $props();

	let percentage = $derived(total > 0 ? Math.round((loaded / total) * 100) : 0);

	function formatMB(bytes: number): string {
		return (bytes / 1024 / 1024).toFixed(0);
	}
</script>

<div class="rounded-lg border border-border bg-surface-alt p-6 text-center">
	<div class="mb-3 text-sm font-medium text-text">
		One-time setup: downloading AI model ({formatMB(total)} MB)
	</div>

	<div class="mx-auto max-w-md">
		<div class="h-2 overflow-hidden rounded-full bg-border">
			<div
				class="h-full rounded-full bg-accent transition-all duration-150"
				style="width: {percentage}%"
			></div>
		</div>
		<div class="mt-2 text-xs text-text-muted">
			{formatMB(loaded)} / {formatMB(total)} MB — {percentage}%
		</div>
	</div>

	<p class="mt-3 text-xs text-text-muted">
		This won't happen again — the model is cached in your browser.
	</p>
</div>
