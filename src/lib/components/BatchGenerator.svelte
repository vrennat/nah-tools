<script lang="ts">
	import type { QRStyleOptions } from '$qr/types';
	import { createQRCode, exportPNG } from '$qr/generator';
	import { exportBatchZIP, downloadBlob, makeFilename } from '$qr/exporter';

	let { options }: { options: QRStyleOptions } = $props();

	let entries: { data: string; label?: string }[] = $state([]);
	let loading = $state(false);
	let progress = $state({ current: 0, total: 0 });
	let error = $state('');
	let fileInput = $state<HTMLInputElement>(null!);

	const MAX_ENTRIES = 500;

	function downloadTemplate() {
		const csv = 'data,label\nhttps://example.com,Example Site\nhttps://example.org,Another Site\nHello World,Plain Text QR\n';
		downloadBlob(new Blob([csv], { type: 'text/csv' }), 'nah-tools-batch-template.csv');
	}

	function parseCSV(text: string): { data: string; label?: string }[] {
		const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
		if (lines.length === 0) return [];

		let startIndex = 0;
		const firstLine = lines[0].toLowerCase();
		if (firstLine.includes('data') || firstLine.includes('url')) {
			startIndex = 1;
		}

		const results: { data: string; label?: string }[] = [];

		for (let i = startIndex; i < lines.length; i++) {
			const fields = parseCSVLine(lines[i]);
			const data = fields[0]?.trim();
			if (!data) continue;
			const label = fields[1]?.trim() || undefined;
			results.push({ data, label });
		}

		return results;
	}

	function parseCSVLine(line: string): string[] {
		const fields: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (inQuotes) {
				if (ch === '"' && line[i + 1] === '"') {
					current += '"';
					i++;
				} else if (ch === '"') {
					inQuotes = false;
				} else {
					current += ch;
				}
			} else {
				if (ch === '"') {
					inQuotes = true;
				} else if (ch === ',') {
					fields.push(current);
					current = '';
				} else {
					current += ch;
				}
			}
		}
		fields.push(current);
		return fields;
	}

	function handleFile(event: Event) {
		error = '';
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.csv')) {
			error = 'Please upload a .csv file.';
			entries = [];
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const parsed = parseCSV(text);

			if (parsed.length === 0) {
				error = 'No valid data rows found in the CSV.';
				entries = [];
				return;
			}

			if (parsed.length > MAX_ENTRIES) {
				error = `CSV contains ${parsed.length} entries. Maximum is ${MAX_ENTRIES}.`;
				entries = [];
				return;
			}

			entries = parsed;
		};
		reader.readAsText(file);
	}

	function removeEntry(index: number) {
		entries = entries.filter((_, i) => i !== index);
	}

	function reset() {
		entries = [];
		error = '';
		progress = { current: 0, total: 0 };
		if (fileInput) fileInput.value = '';
	}

	async function generate() {
		if (entries.length === 0 || loading) return;
		loading = true;
		error = '';
		progress = { current: 0, total: entries.length };

		try {
			const blob = await exportBatchZIP(entries, async (data) => {
				const qr = await createQRCode(data, options);
				const png = await exportPNG(qr);
				progress.current++;
				return png;
			});
			downloadBlob(blob, makeFilename('nah-qr-batch', 'zip'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to generate QR codes.';
		} finally {
			loading = false;
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (!file) return;

		if (fileInput) {
			const dt = new DataTransfer();
			dt.items.add(file);
			fileInput.files = dt.files;
			fileInput.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
	}

	const primaryClass =
		'rounded-full px-5 py-2 text-sm font-medium transition-colors bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed';
	const secondaryClass =
		'rounded-full px-5 py-2 text-sm font-medium transition-colors border border-border text-text hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed';
</script>

<div class="space-y-4">
	{#if entries.length === 0}
		<button
			type="button"
			class="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-accent hover:bg-surface-alt"
			ondrop={handleDrop}
			ondragover={handleDragOver}
			onclick={() => fileInput.click()}
		>
			<svg
				class="mx-auto mb-3 h-10 w-10 text-text-muted"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
			<p class="text-sm font-medium text-text">Click or drag to upload CSV</p>
			<p class="mt-1 text-xs text-text-muted">
				Columns: data, label (optional)
			</p>
			<input
				bind:this={fileInput}
				type="file"
				accept=".csv"
				class="hidden"
				onchange={handleFile}
			/>
		</button>
		<p class="text-center text-xs text-text-muted">
			or <button
				type="button"
				class="text-accent underline hover:text-accent-hover"
				onclick={downloadTemplate}
			>download a template CSV</button> to get started
		</p>
	{:else}
		<div class="rounded-lg border border-border bg-surface">
			<div class="flex items-center justify-between border-b border-border px-4 py-3">
				<span class="text-sm font-medium text-text">
					{entries.length} QR code{entries.length !== 1 ? 's' : ''} to generate
				</span>
				<button type="button" class="text-xs text-text-muted hover:text-text" onclick={reset}>
					Clear
				</button>
			</div>
			<div class="max-h-60 overflow-y-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-border text-left text-xs text-text-muted">
							<th class="px-4 py-2 font-medium">#</th>
							<th class="px-4 py-2 font-medium">Data</th>
							<th class="px-4 py-2 font-medium">Label</th>
							<th class="px-4 py-2"></th>
						</tr>
					</thead>
					<tbody>
						{#each entries as entry, i}
							<tr class="border-b border-border last:border-0 hover:bg-surface-alt">
								<td class="px-4 py-2 text-text-muted">{i + 1}</td>
								<td class="max-w-[200px] truncate px-4 py-2 text-text">{entry.data}</td>
								<td class="px-4 py-2 text-text-muted">{entry.label ?? '—'}</td>
								<td class="px-4 py-2">
									<button
										type="button"
										class="text-text-muted hover:text-error"
										onclick={() => removeEntry(i)}
										disabled={loading}
										aria-label="Remove entry"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<button type="button" class={primaryClass} disabled={loading} onclick={generate}>
				{#if loading}
					Generating {progress.current}/{progress.total}...
				{:else}
					Generate ZIP
				{/if}
			</button>
			<button type="button" class={secondaryClass} disabled={loading} onclick={reset}>
				Reset
			</button>
		</div>
	{/if}

	{#if error}
		<p class="text-sm text-error">{error}</p>
	{/if}
</div>
