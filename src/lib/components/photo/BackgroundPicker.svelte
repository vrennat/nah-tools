<script lang="ts">
	let {
		value = $bindable('transparent')
	}: {
		value?: string;
	} = $props();

	const presets = [
		{ id: 'transparent', label: 'Transparent', color: '' },
		{ id: '#ffffff', label: 'White', color: '#ffffff' },
		{ id: '#000000', label: 'Black', color: '#000000' }
	];

	let customColor = $state('#3b82f6');
	let isCustom = $derived(!presets.some((p) => p.id === value));
</script>

<div class="flex items-center gap-2">
	<span class="text-xs font-medium text-text-muted">Background:</span>

	{#each presets as preset}
		<button
			type="button"
			class="h-7 w-7 rounded-md border-2 transition-colors
				{value === preset.id ? 'border-accent' : 'border-border hover:border-accent/50'}"
			title={preset.label}
			onclick={() => (value = preset.id)}
		>
			{#if preset.id === 'transparent'}
				<div
					class="h-full w-full rounded-[4px]"
					style="background-image: repeating-conic-gradient(#d4d4d4 0% 25%, #ffffff 0% 50%); background-size: 8px 8px;"
				></div>
			{:else}
				<div
					class="h-full w-full rounded-[4px]"
					style="background-color: {preset.color};"
				></div>
			{/if}
		</button>
	{/each}

	<div class="relative">
		<button
			type="button"
			class="h-7 w-7 overflow-hidden rounded-md border-2 transition-colors
				{isCustom ? 'border-accent' : 'border-border hover:border-accent/50'}"
			title="Custom color"
			onclick={() => (value = customColor)}
		>
			<div class="h-full w-full rounded-[4px]" style="background-color: {customColor};"></div>
		</button>
		<input
			type="color"
			bind:value={customColor}
			oninput={() => (value = customColor)}
			class="absolute inset-0 cursor-pointer opacity-0"
		/>
	</div>
</div>
