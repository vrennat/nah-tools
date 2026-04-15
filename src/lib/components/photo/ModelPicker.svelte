<script lang="ts">
	import type { ModelInfo } from '$photo/types';
	import { AVAILABLE_MODELS } from '$photo/models';

	let {
		value = $bindable(AVAILABLE_MODELS[0].id),
		disabled = false
	}: {
		value?: string;
		disabled?: boolean;
	} = $props();

	let selected = $derived(AVAILABLE_MODELS.find((m) => m.id === value) || AVAILABLE_MODELS[0]);
</script>

{#if AVAILABLE_MODELS.length > 1}
<div class="flex items-center gap-2">
	<span class="text-xs font-medium text-text-muted">Model:</span>

	<div class="flex gap-1">
		{#each AVAILABLE_MODELS as model}
			<button
				type="button"
				{disabled}
				class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors
					{value === model.id
					? 'border-accent bg-accent/10 text-accent'
					: 'border-border text-text-muted hover:border-accent/50 hover:text-text'}
					{disabled ? 'cursor-not-allowed opacity-50' : ''}"
				title="{model.description} — Best for: {model.bestFor}"
				onclick={() => (value = model.id)}
			>
				{model.name}
			</button>
		{/each}
	</div>

	<span class="text-[10px] text-text-muted/70">{selected.bestFor}</span>
</div>
{/if}
