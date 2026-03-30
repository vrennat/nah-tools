<script lang="ts">
	import type { AdjustmentParams } from '$filters/types';
	import { PRESETS } from '$filters/presets';

	let {
		active = $bindable('none'),
		onapply
	}: {
		active: string;
		onapply: (params: AdjustmentParams) => void;
	} = $props();

	function selectPreset(id: string) {
		active = id;
		const preset = PRESETS.find((p) => p.id === id);
		if (preset) onapply(preset.params);
	}
</script>

<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
	{#each PRESETS as preset}
		<button
			type="button"
			class="shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors
				{active === preset.id
				? 'border-accent bg-accent/10 text-accent'
				: 'border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text'}"
			onclick={() => selectPreset(preset.id)}
		>
			{preset.name}
		</button>
	{/each}
</div>
