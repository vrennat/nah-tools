<script lang="ts">
	import type { CodecName } from '$compress/types';
	import { CODECS } from '$compress/codecs';

	let {
		value = $bindable('webp'),
		disabled = false
	}: {
		value: CodecName;
		disabled?: boolean;
	} = $props();
</script>

<div class="space-y-2">
	<span class="text-sm font-medium text-text">Format</span>
	<div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
		{#each CODECS as codec}
			<button
				type="button"
				class="rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors
					{value === codec.name
					? 'border-accent bg-accent/10 text-accent'
					: 'border-border bg-surface text-text-muted hover:border-accent/50 hover:text-text'}
					{disabled ? 'pointer-events-none opacity-50' : ''}"
				onclick={() => (value = codec.name)}
				{disabled}
				title={codec.description}
			>
				{codec.label}
			</button>
		{/each}
	</div>
</div>
