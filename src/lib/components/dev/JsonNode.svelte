<script lang="ts">
	import Self from './JsonNode.svelte';

	let { value, keyName = null, last = true }: { value: unknown; keyName?: string | null; last?: boolean } = $props();

	const isObject = $derived(value !== null && typeof value === 'object' && !Array.isArray(value));
	const isArray = $derived(Array.isArray(value));
	const isExpandable = $derived(isObject || isArray);

	let open = $state(true);

	const entries = $derived(
		isArray
			? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
			: isObject
				? Object.entries(value as Record<string, unknown>)
				: []
	);

	function valueClass(v: unknown): string {
		if (typeof v === 'string') return 'text-success';
		if (typeof v === 'number') return 'text-accent';
		if (typeof v === 'boolean') return 'text-warning';
		return 'text-text-muted';
	}

	function valueText(v: unknown): string {
		if (typeof v === 'string') return `"${v}"`;
		return String(v);
	}
</script>

<div class="leading-relaxed">
	{#if isExpandable}
		<button
			type="button"
			onclick={() => (open = !open)}
			class="inline-flex items-center gap-1 hover:text-accent"
		>
			<svg class="h-3 w-3 shrink-0 text-text-muted transition-transform {open ? 'rotate-90' : ''}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
			{#if keyName !== null}<span class="text-text">{keyName}:</span>{/if}
			<span class="text-text-muted">{isArray ? `[${entries.length}]` : `{${entries.length}}`}</span>
		</button>
		{#if open}
			<div class="ml-4 border-l border-border pl-3">
				{#each entries as [k, v], i}
					<Self value={v} keyName={k} last={i === entries.length - 1} />
				{/each}
			</div>
		{/if}
	{:else}
		<div class="pl-4">
			{#if keyName !== null}<span class="text-text">{keyName}:</span> {/if}<span class={valueClass(value)}>{valueText(value)}</span>{#if !last}<span class="text-text-muted">,</span>{/if}
		</div>
	{/if}
</div>
