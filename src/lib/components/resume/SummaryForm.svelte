<script lang="ts">
	let { summary = $bindable('') }: { summary: string } = $props();

	let charCount = $derived(summary.length);
	let countColor = $derived(
		charCount > 500 ? 'text-error' : charCount > 400 ? 'text-warning' : 'text-text-muted'
	);
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for="summary" class="block text-sm font-medium text-text">Professional Summary</label>
		<span class="text-xs {countColor}">
			{charCount} / 400
		</span>
	</div>
	<textarea
		id="summary"
		bind:value={summary}
		rows={4}
		placeholder="A brief summary of your professional background, key strengths, and career goals..."
		class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
	></textarea>
	{#if charCount > 400}
		<p class="text-xs {countColor}">
			{charCount > 500 ? 'Summary is quite long. Consider trimming for best results.' : 'Consider keeping your summary under 400 characters.'}
		</p>
	{/if}
</div>
