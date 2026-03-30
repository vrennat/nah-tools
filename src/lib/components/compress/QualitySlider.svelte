<script lang="ts">
	import type { CodecName } from '$compress/types';
	import { getCodec } from '$compress/codecs';

	let {
		value = $bindable(80),
		codec,
		disabled = false
	}: {
		value: number;
		codec: CodecName;
		disabled?: boolean;
	} = $props();

	let codecInfo = $derived(getCodec(codec));
	let isLossless = $derived(!codecInfo.supportsQuality);
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<span class="text-sm font-medium text-text">
			{isLossless ? 'Optimization Level' : 'Quality'}
		</span>
		<span class="text-sm font-mono text-text-muted">{value}</span>
	</div>

	{#if isLossless}
		<p class="text-xs text-text-muted">Lossless format — no quality loss.</p>
	{:else}
		<input
			type="range"
			bind:value
			min={codecInfo.qualityRange[0]}
			max={codecInfo.qualityRange[1]}
			step={1}
			class="w-full accent-accent"
			{disabled}
		/>
		<div class="flex justify-between text-xs text-text-muted">
			<span>Smaller file</span>
			<span>Higher quality</span>
		</div>
	{/if}
</div>
