<script lang="ts">
	import type { DocumentType } from '$invoice/types';
	import { DOCUMENT_LABELS } from '$invoice/types';

	let { value = $bindable<DocumentType>('invoice') } = $props();

	const types: DocumentType[] = ['invoice', 'credit_note', 'estimate', 'receipt', 'proforma'];
</script>

<div class="flex flex-wrap gap-1 rounded-lg bg-surface-alt p-1">
	{#each types as docType}
		<button
			type="button"
			onclick={() => { value = docType; }}
			class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm {value === docType ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}"
		>
			{DOCUMENT_LABELS[docType]}
		</button>
	{/each}
</div>
