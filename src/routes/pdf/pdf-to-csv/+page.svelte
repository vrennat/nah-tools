<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ProgressBar from '$components/pdf/ProgressBar.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';
	import type { ExtractedTable } from '$pdf/types';

	let files = $state<File[]>([]);
	let tables = $state<ExtractedTable[]>([]);
	let loading = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let firstRowHeader = $state(true);
	let selectedTableIndex = $state(0);

	let file = $derived(files[0]);
	let selectedTable = $derived(tables[selectedTableIndex]);

	$effect(() => {
		// Track both file and firstRowHeader so changes to either re-extract
		const _header = firstRowHeader;
		if (!file) {
			tables = [];
			selectedTableIndex = 0;
			return;
		}
		extractData();
	});

	async function extractData() {
		if (!file) return;
		const currentFile = file;
		loading = true;
		error = '';
		tables = [];
		selectedTableIndex = 0;

		try {
			const buf = await currentFile.arrayBuffer();
			if (file !== currentFile) return;

			const { extractTables } = await import('$pdf/table-extractor');
			const result = await extractTables(
				buf,
				{ firstRowHeader },
				(current, total) => {
					progress = { current, total };
				}
			);

			if (file !== currentFile) return;
			tables = result;
		} catch (e) {
			if (file !== currentFile) return;
			error = e instanceof Error ? e.message : 'Failed to extract tables';
		} finally {
			if (file === currentFile) loading = false;
		}
	}

	async function downloadCSV() {
		if (!selectedTable) return;
		const { tableToCSV } = await import('$pdf/table-extractor');
		const { downloadBlob } = await import('$pdf/exporter');
		const csv = tableToCSV(selectedTable);
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
		const baseName = file?.name.replace(/\.pdf$/i, '') || 'table';
		downloadBlob(blob, `${baseName}_page${selectedTable.pageIndex + 1}.csv`);
	}

	async function downloadAllCSV() {
		if (tables.length === 0) return;
		const { tableToCSV } = await import('$pdf/table-extractor');
		const { downloadAsZip } = await import('$pdf/exporter');
		const baseName = file?.name.replace(/\.pdf$/i, '') || 'tables';

		const csvFiles = tables.map((table, i) => {
			const csv = tableToCSV(table);
			return {
				name: `${baseName}_page${table.pageIndex + 1}.csv`,
				data: new Blob([csv], { type: 'text/csv;charset=utf-8' })
			};
		});

		await downloadAsZip(csvFiles, `${baseName}_tables.zip`);
	}
</script>

<svelte:head>
	<title>PDF to CSV — Extract Tables from PDF | nah</title>
	<meta
		name="description"
		content="Extract tables from PDF files and download as CSV. Free, no upload — processed entirely in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="PDF to CSV"
	description="Extract tables from PDFs and download as spreadsheet data."
>
	<section class="mx-auto max-w-3xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if file}
				<div class="mt-4 flex items-center gap-3">
					<label class="flex items-center gap-2 text-sm text-text">
						<input
							type="checkbox"
							bind:checked={firstRowHeader}
							class="h-4 w-4 rounded border-border accent-accent"
						/>
						First row is header
					</label>
				</div>
			{/if}

			{#if loading}
				<div class="mt-4">
					<ProgressBar current={progress.current} total={progress.total} label="Analyzing pages..." />
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			{#if !loading && file && tables.length === 0 && !error}
				<div class="mt-4 rounded-lg border border-border bg-surface-alt px-4 py-3">
					<p class="text-sm text-text-muted">
						No tables detected in this PDF. This tool works best with PDFs that contain clearly structured tabular data with consistent columns.
					</p>
				</div>
			{/if}

			{#if tables.length > 0}
				{#if tables.length > 1}
					<div class="mt-4 flex items-center gap-2">
						<label for="tableSelect" class="text-sm font-medium text-text">Table:</label>
						<select
							id="tableSelect"
							bind:value={selectedTableIndex}
							class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						>
							{#each tables as table, i}
								<option value={i}>Page {table.pageIndex + 1} ({table.rows.length} rows)</option>
							{/each}
						</select>
					</div>
				{/if}

				{#if selectedTable}
					<div class="mt-4 max-h-80 overflow-auto rounded-lg border border-border">
						<table class="w-full text-left text-sm">
							<thead class="sticky top-0 bg-surface-alt">
								<tr>
									{#each selectedTable.headers as header}
										<th class="border-b border-border px-3 py-2 font-medium text-text">{header}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each selectedTable.rows as row, rowIdx}
									<tr class={rowIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-alt/50'}>
										{#each row as cell}
											<td class="border-b border-border/50 px-3 py-1.5 text-text-muted">{cell}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="mt-4 flex gap-3">
						<button
							type="button"
							class="flex-1 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
							onclick={downloadCSV}
						>
							Download CSV
						</button>

						{#if tables.length > 1}
							<button
								type="button"
								class="rounded-full border border-accent px-5 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/10"
								onclick={downloadAllCSV}
							>
								Download All ({tables.length} tables)
							</button>
						{/if}
					</div>
				{/if}
			{/if}
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
