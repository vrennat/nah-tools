<script lang="ts">
	import type { QRType } from '$qr/types';

	const tabs: { type: QRType; label: string }[] = [
		{ type: 'url', label: 'URL' },
		{ type: 'text', label: 'Text' },
		{ type: 'wifi', label: 'WiFi' },
		{ type: 'vcard', label: 'vCard' },
		{ type: 'email', label: 'Email' },
		{ type: 'phone', label: 'Phone' },
		{ type: 'sms', label: 'SMS' }
	];

	let { selected = $bindable('url' as QRType) } = $props();
</script>

<div class="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
	{#each tabs as tab}
		<button
			type="button"
			class="shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors {selected === tab.type
				? 'bg-accent text-white'
				: 'text-text-muted hover:bg-surface-alt hover:text-text'}"
			onclick={() => (selected = tab.type)}
		>
			{tab.label}
		</button>
	{/each}
</div>
