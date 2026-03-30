<script lang="ts">
	let { current = 0, total = 0, label = '' } = $props();
	let percent = $derived(total > 0 ? Math.round((current / total) * 100) : 0);
</script>

<div class="space-y-1">
	{#if label}
		<p class="text-sm text-text-muted">{label}</p>
	{:else}
		<p class="text-sm text-text-muted">Processing {current} of {total}...</p>
	{/if}
	<div class="h-2 w-full overflow-hidden rounded-full bg-surface-alt">
		<div
			class="h-full rounded-full bg-accent transition-all duration-200"
			style="width: {percent}%"
		></div>
	</div>
</div>
