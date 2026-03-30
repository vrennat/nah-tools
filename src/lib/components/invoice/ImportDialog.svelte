<script lang="ts">
	import type { InvoiceData } from '$invoice/types';
	import { importInvoiceJSON } from '$invoice/storage';

	let { onimport }: { onimport: (data: InvoiceData) => void } = $props();

	let showDialog = $state(false);
	let error = $state<string | null>(null);
	let importing = $state(false);

	async function handleFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		importing = true;
		error = null;
		try {
			const text = await file.text();
			const data = await importInvoiceJSON(text);
			onimport(data);
			showDialog = false;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Import failed';
		} finally {
			importing = false;
		}
	}
</script>

<button
	type="button"
	onclick={() => { showDialog = true; error = null; }}
	class="rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
>
	Import JSON
</button>

{#if showDialog}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onclick={() => { showDialog = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="mx-4 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl" onclick={(e) => e.stopPropagation()}>
			<h3 class="text-lg font-semibold text-text">Import Invoice</h3>
			<p class="mt-1 text-sm text-text-muted">Select a JSON file exported from this tool.</p>

			<div class="mt-4">
				<input
					type="file"
					accept=".json"
					onchange={handleFile}
					disabled={importing}
					class="text-sm text-text-muted file:mr-2 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover disabled:opacity-40"
				/>
			</div>

			{#if error}
				<p class="mt-2 text-xs text-error">{error}</p>
			{/if}

			<div class="mt-4 flex justify-end">
				<button
					type="button"
					onclick={() => { showDialog = false; }}
					class="rounded-md px-3 py-1.5 text-sm text-text-muted hover:text-text"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}
