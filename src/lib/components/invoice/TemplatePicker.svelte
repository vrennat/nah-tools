<script lang="ts">
	import type { InvoiceTemplateId } from '$invoice/types';
	import { getTemplateMeta } from '$invoice/pdf/index';

	let { value = $bindable<InvoiceTemplateId>('clean') } = $props();

	const templates = getTemplateMeta();
</script>

<div class="flex gap-2">
	{#each templates as tmpl}
		<button
			type="button"
			onclick={() => { value = tmpl.id; }}
			class="flex-1 rounded-lg border px-3 py-2 text-left transition-all {value === tmpl.id
				? 'border-accent bg-accent/5 shadow-sm'
				: 'border-border hover:border-accent/30'}"
		>
			<span class="block text-sm font-medium {value === tmpl.id ? 'text-accent' : 'text-text'}">{tmpl.name}</span>
			<span class="block text-xs text-text-muted">{tmpl.description}</span>
		</button>
	{/each}
</div>
