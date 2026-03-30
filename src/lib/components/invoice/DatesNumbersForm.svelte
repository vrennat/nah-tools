<script lang="ts">
	let {
		documentNumber = $bindable(''),
		referenceNumber = $bindable(''),
		issueDate = $bindable(''),
		dueDate = $bindable('')
	} = $props();
</script>

<div class="grid gap-3 sm:grid-cols-2">
	<div>
		<label for="doc-number" class="mb-1 block text-xs font-medium text-text-muted">Document #</label>
		<input id="doc-number" type="text" bind:value={documentNumber}
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			placeholder="INV-0001" />
	</div>
	<div>
		<label for="ref-number" class="mb-1 block text-xs font-medium text-text-muted">Reference / PO #</label>
		<input id="ref-number" type="text" bind:value={referenceNumber}
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			placeholder="Optional" />
	</div>
	<div>
		<label for="issue-date" class="mb-1 block text-xs font-medium text-text-muted">Issue Date</label>
		<input id="issue-date" type="date" bind:value={issueDate}
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
	</div>
	<div>
		<label for="due-date" class="mb-1 block text-xs font-medium text-text-muted">Due Date</label>
		<input id="due-date" type="date" bind:value={dueDate}
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
	</div>
</div>
