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
			class="h-6 w-6 rounded-md border transition-transform hover:scale-110
				{value === preset.id ? 'border-accent ring-1 ring-accent' : 'border-border'}"
			title={preset.label}
			onclick={() => (value = preset.id)}
			style={preset.id === 'transparent'
				? 'background-image: repeating-conic-gradient(#d4d4d4 0% 25%, #ffffff 0% 50%); background-size: 8px 8px;'
				: `background-color: ${preset.color};`}
		></button>
	{/each}

	<div class="relative">
		<button
			type="button"
			class="h-6 w-6 rounded-md border transition-transform hover:scale-110
				{isCustom ? 'border-accent ring-1 ring-accent' : 'border-border'}"
			title="Custom color"
			onclick={() => (value = customColor)}
			style="background-color: {customColor};"
		></button>
		<input
			type="color"
			bind:value={customColor}
			oninput={() => (value = customColor)}
			class="absolute inset-0 cursor-pointer opacity-0"
		/>
	</div>
</div>
