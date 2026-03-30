<script lang="ts">
	import type { AdjustmentName, AdjustmentParams } from '$filters/types';
	import { ADJUSTMENT_RANGES } from '$filters/types';

	let {
		params = $bindable({})
	}: {
		params: AdjustmentParams;
	} = $props();

	interface AdjustmentGroup {
		label: string;
		items: AdjustmentName[];
	}

	const groups: AdjustmentGroup[] = [
		{
			label: 'Light',
			items: ['exposure', 'brightness', 'contrast', 'highlights', 'shadows']
		},
		{
			label: 'Color',
			items: ['temperature', 'tint', 'saturation', 'vibrance']
		},
		{
			label: 'Effects',
			items: ['vignette', 'grain']
		}
	];

	function displayName(name: AdjustmentName): string {
		return name.charAt(0).toUpperCase() + name.slice(1);
	}

	function displayValue(name: AdjustmentName): string {
		const val = params[name] ?? ADJUSTMENT_RANGES[name].default;
		if (val === 0) return '0';
		return val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2);
	}

	function handleInput(name: AdjustmentName, e: Event) {
		const value = parseFloat((e.target as HTMLInputElement).value);
		params = { ...params, [name]: value };
	}

	function resetAll() {
		params = {};
	}

	let hasAdjustments = $derived(Object.values(params).some((v) => v !== undefined && v !== 0));
</script>

<div class="space-y-5">
	{#each groups as group}
		<div>
			<h3 class="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
				{group.label}
			</h3>
			<div class="space-y-3">
				{#each group.items as name}
					{@const range = ADJUSTMENT_RANGES[name]}
					<div class="space-y-1">
						<div class="flex items-center justify-between">
							<span class="text-sm text-text">{displayName(name)}</span>
							<span class="font-mono text-xs text-text-muted">{displayValue(name)}</span>
						</div>
						<input
							type="range"
							value={params[name] ?? range.default}
							min={range.min}
							max={range.max}
							step={range.step}
							class="w-full accent-accent"
							oninput={(e) => handleInput(name, e)}
						/>
					</div>
				{/each}
			</div>
		</div>
	{/each}

	{#if hasAdjustments}
		<button
			type="button"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:bg-surface-alt"
			onclick={resetAll}
		>
			Reset All
		</button>
	{/if}
</div>
