<script lang="ts">
	import type { MaskOptions } from '$photo/types';
	import { DEFAULT_MASK_OPTIONS } from '$photo/types';

	let {
		value = $bindable<MaskOptions>({ ...DEFAULT_MASK_OPTIONS }),
		onchange
	}: {
		value?: MaskOptions;
		onchange?: () => void;
	} = $props();

	let expanded = $state(false);

	function update(key: keyof MaskOptions, val: number) {
		value = { ...value, [key]: val };
		onchange?.();
	}

	function reset() {
		value = { ...DEFAULT_MASK_OPTIONS };
		onchange?.();
	}

	let isDefault = $derived(
		value.threshold === DEFAULT_MASK_OPTIONS.threshold &&
			value.softness === DEFAULT_MASK_OPTIONS.softness &&
			value.feather === DEFAULT_MASK_OPTIONS.feather
	);
</script>

<div class="space-y-2">
	<button
		type="button"
		class="flex items-center gap-1.5 text-xs font-medium text-text-muted transition-colors hover:text-text"
		onclick={() => (expanded = !expanded)}
	>
		<svg
			class="h-3.5 w-3.5 transition-transform {expanded ? 'rotate-90' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			stroke-width="2"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
		</svg>
		Refine edges
		{#if !isDefault}
			<span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
		{/if}
	</button>

	{#if expanded}
		<div class="space-y-3 rounded-lg border border-border bg-surface p-3">
			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<label for="threshold" class="text-xs text-text-muted">Edge detection</label>
					<span class="font-mono text-xs text-text-muted">{value.threshold.toFixed(2)}</span>
				</div>
				<input
					id="threshold"
					type="range"
					min="0"
					max="0.5"
					step="0.01"
					value={value.threshold}
					oninput={(e) => update('threshold', parseFloat(e.currentTarget.value))}
					class="slider w-full"
				/>
				<p class="text-[10px] text-text-muted/70">Lower = keep more detail, higher = cleaner edges</p>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<label for="softness" class="text-xs text-text-muted">Edge softness</label>
					<span class="font-mono text-xs text-text-muted">{value.softness.toFixed(2)}</span>
				</div>
				<input
					id="softness"
					type="range"
					min="0.5"
					max="1"
					step="0.01"
					value={value.softness}
					oninput={(e) => update('softness', parseFloat(e.currentTarget.value))}
					class="slider w-full"
				/>
				<p class="text-[10px] text-text-muted/70">
					Lower = softer semi-transparent edges, higher = sharper cutout
				</p>
			</div>

			<div class="space-y-1.5">
				<div class="flex items-center justify-between">
					<label for="feather" class="text-xs text-text-muted">Feathering</label>
					<span class="font-mono text-xs text-text-muted">{value.feather}px</span>
				</div>
				<input
					id="feather"
					type="range"
					min="0"
					max="20"
					step="1"
					value={value.feather}
					oninput={(e) => update('feather', parseInt(e.currentTarget.value))}
					class="slider w-full"
				/>
				<p class="text-[10px] text-text-muted/70">Blur the mask edges for a natural blend</p>
			</div>

			{#if !isDefault}
				<button
					type="button"
					class="text-xs text-accent transition-colors hover:text-accent-hover"
					onclick={reset}
				>
					Reset to defaults
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.slider {
		-webkit-appearance: none;
		appearance: none;
		height: 4px;
		border-radius: 2px;
		background: var(--color-border);
		outline: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-accent);
		cursor: pointer;
		border: 2px solid var(--color-surface);
		box-shadow: 0 0 0 1px var(--color-accent);
	}
</style>
