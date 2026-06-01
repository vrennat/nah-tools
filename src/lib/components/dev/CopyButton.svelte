<script lang="ts">
	let {
		text,
		label = 'Copy',
		small = false,
		disabled = false
	}: { text: string | (() => string); label?: string; small?: boolean; disabled?: boolean } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		const value = typeof text === 'function' ? text() : text;
		if (!value) return;
		try {
			await navigator.clipboard.writeText(value);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1500);
		} catch {
			// Clipboard API can fail in insecure contexts; silently ignore.
		}
	}
</script>

<button
	type="button"
	onclick={copy}
	{disabled}
	class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface font-medium text-text transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 {small
		? 'px-2.5 py-1 text-xs'
		: 'px-3 py-1.5 text-sm'}"
>
	{#if copied}
		<svg class="h-4 w-4 text-success" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
		</svg>
		Copied
	{:else}
		<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
		</svg>
		{label}
	{/if}
</button>
