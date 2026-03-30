<script lang="ts">
	import type { QRStyleOptions } from '$qr/types';
	import QRPreview from '$components/QRPreview.svelte';
	import DownloadBar from '$components/DownloadBar.svelte';
	import { debounce } from '$utils/debounce';
	import { normalizeUrl } from '$utils/url';

	let url = $state('');
	let alias = $state('');
	let passphrase = $state('');
	let label = $state('');
	let expiresAt = $state('');

	let utmSource = $state('');
	let utmMedium = $state('');
	let utmCampaign = $state('');
	let utmTerm = $state('');
	let utmContent = $state('');

	let aliasStatus = $state<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
	let aliasError = $state('');

	let result = $state<{
		short_code: string;
		short_url: string;
		manage_url: string | null;
	} | null>(null);

	let loading = $state(false);
	let error = $state('');
	let qrInstance: any = $state(null);
	let copied = $state(false);

	let styleOptions: QRStyleOptions = $state({
		foreground: '#000000',
		background: '#ffffff',
		dotStyle: 'square',
		cornerSquareStyle: 'square',
		cornerDotStyle: 'square',
		errorCorrection: 'M',
		logo: undefined,
		logoSize: 0.4
	});

	// Bulk creation state
	let bulkEntries: { url: string; alias?: string; label?: string }[] = $state([]);
	let bulkLoading = $state(false);
	let bulkProgress = $state({ current: 0, total: 0 });
	let bulkError = $state('');
	let bulkResults = $state<{ short_url: string; destination: string; error?: string }[]>([]);
	let bulkFileInput = $state<HTMLInputElement>(null!);

	let passphraseValid = $derived(!passphrase || passphrase.length >= 8);
	let canCreate = $derived(url && !loading && passphraseValid);
	let qrData = $derived(result ? result.short_url : '');

	let taggedUrl = $derived(() => {
		if (!url) return '';
		try {
			const u = new URL(normalizeUrl(url));
			if (utmSource) u.searchParams.set('utm_source', utmSource);
			if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
			if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
			if (utmTerm) u.searchParams.set('utm_term', utmTerm);
			if (utmContent) u.searchParams.set('utm_content', utmContent);
			return u.toString();
		} catch {
			return url;
		}
	});

	let hasUtm = $derived(utmSource || utmMedium || utmCampaign || utmTerm || utmContent);

	const debouncedCheckAlias = debounce(async (...args: unknown[]) => {
		const value = args[0] as string;
		if (!value) {
			aliasStatus = 'idle';
			aliasError = '';
			return;
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
			aliasStatus = 'invalid';
			aliasError = 'Only letters, numbers, hyphens, and underscores';
			return;
		}

		if (value.length < 3) {
			aliasStatus = 'invalid';
			aliasError = 'Must be at least 3 characters';
			return;
		}

		aliasStatus = 'checking';
		aliasError = '';

		try {
			const res = await fetch('/api/links/check-alias', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ alias: value })
			});
			const data = await res.json() as { available: boolean; message?: string };
			if (data.available) {
				aliasStatus = 'available';
				aliasError = '';
			} else {
				aliasStatus = 'taken';
				aliasError = data.message || 'This alias is already taken';
			}
		} catch {
			aliasStatus = 'idle';
			aliasError = 'Could not check availability';
		}
	}, 300);

	$effect(() => {
		debouncedCheckAlias(alias);
	});

	async function handleCreate() {
		if (!canCreate) return;
		loading = true;
		error = '';

		const destinationUrl = hasUtm ? taggedUrl() : normalizeUrl(url);

		try {
			const res = await fetch('/api/links', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: destinationUrl,
					alias: alias || undefined,
					passphrase: passphrase || undefined,
					label: label || undefined,
					expires_at: expiresAt || undefined
				})
			});
			const json = await res.json() as {
				short_code: string;
				short_url: string;
				manage_url: string | null;
				message?: string;
			};
			if (!res.ok) {
				error = json.message || 'Something went wrong';
				return;
			}
			result = json;
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		url = '';
		alias = '';
		passphrase = '';
		label = '';
		expiresAt = '';
		utmSource = '';
		utmMedium = '';
		utmCampaign = '';
		utmTerm = '';
		utmContent = '';
		aliasStatus = 'idle';
		aliasError = '';
		result = null;
		error = '';
		qrInstance = null;
		copied = false;
	}

	async function copyShortUrl() {
		if (!result) return;
		await navigator.clipboard.writeText(result.short_url);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}

	// Bulk helpers
	function downloadTemplate() {
		const csv = 'url,alias,label\nhttps://example.com,my-link,Example Site\nhttps://example.org,,Another Site\n';
		const blob = new Blob([csv], { type: 'text/csv' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = 'nah-tools-links-template.csv';
		a.click();
		URL.revokeObjectURL(a.href);
	}

	function parseCSV(text: string): { url: string; alias?: string; label?: string }[] {
		const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
		if (lines.length === 0) return [];

		let startIndex = 0;
		const firstLine = lines[0].toLowerCase();
		if (firstLine.includes('url') || firstLine.includes('link')) {
			startIndex = 1;
		}

		const results: { url: string; alias?: string; label?: string }[] = [];

		for (let i = startIndex; i < lines.length; i++) {
			const fields = parseCSVLine(lines[i]);
			const urlVal = fields[0]?.trim();
			if (!urlVal) continue;
			const aliasVal = fields[1]?.trim() || undefined;
			const labelVal = fields[2]?.trim() || undefined;
			results.push({ url: urlVal, alias: aliasVal, label: labelVal });
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

	function handleBulkFile(event: Event) {
		bulkError = '';
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		if (!file.name.endsWith('.csv')) {
			bulkError = 'Please upload a .csv file.';
			bulkEntries = [];
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result as string;
			const parsed = parseCSV(text);

			if (parsed.length === 0) {
				bulkError = 'No valid data rows found in the CSV.';
				bulkEntries = [];
				return;
			}

			if (parsed.length > 500) {
				bulkError = `CSV contains ${parsed.length} entries. Maximum is 500.`;
				bulkEntries = [];
				return;
			}

			bulkEntries = parsed;
		};
		reader.readAsText(file);
	}

	function removeBulkEntry(index: number) {
		bulkEntries = bulkEntries.filter((_, i) => i !== index);
	}

	function resetBulk() {
		bulkEntries = [];
		bulkError = '';
		bulkResults = [];
		bulkProgress = { current: 0, total: 0 };
		if (bulkFileInput) bulkFileInput.value = '';
	}

	async function handleBulkCreate() {
		if (bulkEntries.length === 0 || bulkLoading) return;
		bulkLoading = true;
		bulkError = '';
		bulkResults = [];
		bulkProgress = { current: 0, total: bulkEntries.length };

		try {
			const res = await fetch('/api/links/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ links: bulkEntries })
			});
			const json = await res.json() as { results: { short_url: string; destination: string; error?: string }[] };
			if (!res.ok) {
				bulkError = 'Bulk creation failed. Please try again.';
				return;
			}
			bulkResults = json.results;
			bulkProgress = { current: bulkEntries.length, total: bulkEntries.length };
		} catch {
			bulkError = 'Network error. Please try again.';
		} finally {
			bulkLoading = false;
		}
	}

	function handleBulkDrop(event: DragEvent) {
		event.preventDefault();
		const file = event.dataTransfer?.files[0];
		if (!file) return;

		if (bulkFileInput) {
			const dt = new DataTransfer();
			dt.items.add(file);
			bulkFileInput.files = dt.files;
			bulkFileInput.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}

	function handleBulkDragOver(event: DragEvent) {
		event.preventDefault();
	}
</script>

<svelte:head>
	<title>Nah Tools — Free Link Shortener</title>
	<meta name="description" content="Free, open-source link shortener with custom aliases, click analytics, UTM builder, and QR codes. No signup required." />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "Nah Tools — Free Link Shortener",
		"url": "https://nah.tools/links",
		"description": "Free, open-source link shortener with custom aliases, click analytics, UTM builder, and QR codes. No signup required.",
		"applicationCategory": "UtilityApplication",
		"operatingSystem": "Any",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"creator": {
			"@type": "Organization",
			"name": "Nah Tools",
			"url": "https://nah.tools"
		}
	})}</script>`}
</svelte:head>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
			Short links. <span class="text-accent">No catch.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Custom short links with click analytics and QR codes — no signup required.
		</p>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<div class="grid gap-8 lg:grid-cols-2">
			<div class="space-y-6">
				{#if !result}
					<!-- URL input -->
					<div>
						<label for="url" class="mb-1 block text-sm font-medium text-text">Destination URL</label>
						<input
							id="url"
							type="url"
							bind:value={url}
							required
							placeholder="https://example.com/your-long-url"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>

					<!-- Custom alias -->
					<div>
						<label for="alias" class="mb-1 block text-sm font-medium text-text">
							Custom alias <span class="text-text-muted">(optional)</span>
						</label>
						<div class="flex items-center overflow-hidden rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
							<span class="shrink-0 border-r border-border bg-surface-alt px-3 py-2 text-sm text-text-muted">go.nah.tools/</span>
							<input
								id="alias"
								type="text"
								bind:value={alias}
								placeholder="my-link"
								class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0"
							/>
							{#if aliasStatus === 'checking'}
								<span class="shrink-0 pr-3 text-sm text-text-muted">...</span>
							{:else if aliasStatus === 'available'}
								<svg class="mr-3 h-4 w-4 shrink-0 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
								</svg>
							{:else if aliasStatus === 'taken' || aliasStatus === 'invalid'}
								<svg class="mr-3 h-4 w-4 shrink-0 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							{/if}
						</div>
						{#if aliasError}
							<p class="mt-1 text-xs text-error">{aliasError}</p>
						{/if}
					</div>

					<!-- UTM parameters -->
					<details class="group">
						<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
							UTM parameters
						</summary>
						<div class="mt-4 space-y-3">
							<p class="text-xs text-text-muted">Tags appended to your URL so analytics tools (Google Analytics, etc.) can track where clicks came from.</p>
							<div class="grid gap-3 sm:grid-cols-2">
								<div>
									<label for="utm-source" class="mb-1 block text-xs font-medium text-text">Source</label>
									<input
										id="utm-source"
										type="text"
										bind:value={utmSource}
										placeholder="e.g. google, newsletter"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
								</div>
								<div>
									<label for="utm-medium" class="mb-1 block text-xs font-medium text-text">Medium</label>
									<input
										id="utm-medium"
										type="text"
										bind:value={utmMedium}
										placeholder="e.g. cpc, email, social"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
								</div>
							</div>
							<div>
								<label for="utm-campaign" class="mb-1 block text-xs font-medium text-text">Campaign</label>
								<input
									id="utm-campaign"
									type="text"
									bind:value={utmCampaign}
									placeholder="e.g. spring_sale"
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
							<div class="grid gap-3 sm:grid-cols-2">
								<div>
									<label for="utm-term" class="mb-1 block text-xs font-medium text-text">Term</label>
									<input
										id="utm-term"
										type="text"
										bind:value={utmTerm}
										placeholder="e.g. running+shoes"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
								</div>
								<div>
									<label for="utm-content" class="mb-1 block text-xs font-medium text-text">Content</label>
									<input
										id="utm-content"
										type="text"
										bind:value={utmContent}
										placeholder="e.g. logolink, textlink"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
								</div>
							</div>
							{#if hasUtm && url}
								<div class="rounded-lg bg-surface-alt p-3">
									<p class="mb-1 text-xs font-medium text-text-muted">Tagged URL preview</p>
									<p class="break-all font-mono text-xs text-text">{taggedUrl()}</p>
								</div>
							{/if}
						</div>
					</details>

					<!-- Advanced options -->
					<details class="group">
						<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
							Advanced options
						</summary>
						<div class="mt-4 space-y-3">
							<div>
								<label for="passphrase" class="mb-1 block text-sm font-medium text-text">
									Passphrase <span class="text-text-muted">(optional)</span>
								</label>
								<input
									id="passphrase"
									type="password"
									bind:value={passphrase}
									placeholder="At least 8 characters"
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
								{#if passphrase && !passphraseValid}
									<p class="mt-1 text-xs text-error">Must be at least 8 characters</p>
								{/if}
								<p class="mt-1 text-xs text-text-muted">Add a passphrase to edit and view click stats later</p>
							</div>
							<div>
								<label for="expires" class="mb-1 block text-sm font-medium text-text">
									Expiration date <span class="text-text-muted">(optional)</span>
								</label>
								<input
									id="expires"
									type="date"
									bind:value={expiresAt}
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
							<div>
								<label for="label" class="mb-1 block text-sm font-medium text-text">
									Label <span class="text-text-muted">(optional)</span>
								</label>
								<input
									id="label"
									type="text"
									bind:value={label}
									placeholder="e.g. Marketing campaign, Newsletter"
									class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
								/>
							</div>
						</div>
					</details>

					{#if error}
						<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
					{/if}

					<button
						type="button"
						disabled={!canCreate}
						onclick={handleCreate}
						class="w-full rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if loading}
							Creating...
						{:else}
							Shorten Link
						{/if}
					</button>
				{:else}
					<!-- Result card -->
					<div class="space-y-4">
						<div class="space-y-2 rounded-lg bg-success/10 p-4">
							<p class="text-sm font-medium text-success">Link created</p>
							<div class="flex items-center gap-2">
								<p class="break-all font-mono text-sm text-text">{result.short_url}</p>
								<button
									type="button"
									onclick={copyShortUrl}
									class="shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
								>
									{copied ? 'Copied!' : 'Copy'}
								</button>
							</div>
						</div>

						{#if result.manage_url}
							<div class="rounded-lg border border-border bg-surface-alt p-3">
								<p class="mb-1 text-xs font-medium text-text">Bookmark your manage link:</p>
								<a
									href={result.manage_url}
									class="break-all text-sm text-accent underline hover:text-accent-hover"
								>
									{result.manage_url}
								</a>
								<p class="mt-1 text-xs text-text-muted">You'll need your passphrase to access this later.</p>
							</div>
						{/if}

						<button
							type="button"
							onclick={resetForm}
							class="w-full rounded-full border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
						>
							Create another
						</button>
					</div>
				{/if}
			</div>

			<div class="space-y-4">
				{#if !result}
					<div class="flex items-center justify-center rounded-xl border border-border bg-surface-alt p-4">
						<div class="flex h-[300px] w-[300px] items-center justify-center text-sm text-text-muted">
							Enter a URL to shorten
						</div>
					</div>
				{:else}
					<QRPreview
						data={qrData}
						options={styleOptions}
						onQRReady={(qr) => (qrInstance = qr)}
					/>
					<DownloadBar data={qrData} qr={qrInstance} options={styleOptions} />
				{/if}
			</div>
		</div>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<details>
			<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
				Bulk creation — upload a CSV to shorten multiple links at once
			</summary>
			<div class="mt-4 space-y-4">
				{#if bulkEntries.length === 0 && bulkResults.length === 0}
					<button
						type="button"
						class="relative flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border px-6 py-10 text-center transition-colors hover:border-accent hover:bg-surface-alt"
						ondrop={handleBulkDrop}
						ondragover={handleBulkDragOver}
						onclick={() => bulkFileInput.click()}
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
							Columns: url, alias (optional), label (optional)
						</p>
						<input
							bind:this={bulkFileInput}
							type="file"
							accept=".csv"
							class="hidden"
							onchange={handleBulkFile}
						/>
					</button>
					<p class="text-center text-xs text-text-muted">
						or <button
							type="button"
							class="text-accent underline hover:text-accent-hover"
							onclick={downloadTemplate}
						>download a template CSV</button> to get started
					</p>
				{:else if bulkResults.length > 0}
					<!-- Bulk results -->
					<div class="rounded-lg border border-border bg-surface">
						<div class="flex items-center justify-between border-b border-border px-4 py-3">
							<span class="text-sm font-medium text-text">
								{bulkResults.filter(r => !r.error).length} of {bulkResults.length} links created
							</span>
							<button type="button" class="text-xs text-text-muted hover:text-text" onclick={resetBulk}>
								Clear
							</button>
						</div>
						<div class="max-h-60 overflow-y-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-border text-left text-xs text-text-muted">
										<th class="px-4 py-2 font-medium">Short URL</th>
										<th class="px-4 py-2 font-medium">Destination</th>
										<th class="px-4 py-2 font-medium">Status</th>
									</tr>
								</thead>
								<tbody>
									{#each bulkResults as row}
										<tr class="border-b border-border last:border-0 hover:bg-surface-alt">
											<td class="max-w-[200px] truncate px-4 py-2 font-mono text-xs text-text">{row.short_url || '—'}</td>
											<td class="max-w-[200px] truncate px-4 py-2 text-text-muted">{row.destination}</td>
											<td class="px-4 py-2">
												{#if row.error}
													<span class="text-xs text-error">{row.error}</span>
												{:else}
													<span class="text-xs text-success">Created</span>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>
					</div>
				{:else}
					<!-- Bulk preview -->
					<div class="rounded-lg border border-border bg-surface">
						<div class="flex items-center justify-between border-b border-border px-4 py-3">
							<span class="text-sm font-medium text-text">
								{bulkEntries.length} link{bulkEntries.length !== 1 ? 's' : ''} to create
							</span>
							<button type="button" class="text-xs text-text-muted hover:text-text" onclick={resetBulk}>
								Clear
							</button>
						</div>
						<div class="max-h-60 overflow-y-auto">
							<table class="w-full text-sm">
								<thead>
									<tr class="border-b border-border text-left text-xs text-text-muted">
										<th class="px-4 py-2 font-medium">#</th>
										<th class="px-4 py-2 font-medium">URL</th>
										<th class="px-4 py-2 font-medium">Alias</th>
										<th class="px-4 py-2 font-medium">Label</th>
										<th class="px-4 py-2"></th>
									</tr>
								</thead>
								<tbody>
									{#each bulkEntries as entry, i}
										<tr class="border-b border-border last:border-0 hover:bg-surface-alt">
											<td class="px-4 py-2 text-text-muted">{i + 1}</td>
											<td class="max-w-[200px] truncate px-4 py-2 text-text">{entry.url}</td>
											<td class="px-4 py-2 text-text-muted">{entry.alias ?? '—'}</td>
											<td class="px-4 py-2 text-text-muted">{entry.label ?? '—'}</td>
											<td class="px-4 py-2">
												<button
													type="button"
													class="text-text-muted hover:text-error"
													onclick={() => removeBulkEntry(i)}
													disabled={bulkLoading}
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
						<button
							type="button"
							class="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
							disabled={bulkLoading}
							onclick={handleBulkCreate}
						>
							{#if bulkLoading}
								Creating {bulkProgress.current}/{bulkProgress.total}...
							{:else}
								Create All Links
							{/if}
						</button>
						<button
							type="button"
							class="rounded-full border border-border px-5 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
							disabled={bulkLoading}
							onclick={resetBulk}
						>
							Reset
						</button>
					</div>
				{/if}

				{#if bulkError}
					<p class="text-sm text-error">{bulkError}</p>
				{/if}
			</div>
		</details>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<h2 class="mb-4 text-sm font-medium text-text">Manage an existing link</h2>
		<form
			class="flex gap-3"
			onsubmit={(e: SubmitEvent) => {
				e.preventDefault();
				const form = e.target as HTMLFormElement;
				const code = (form.elements.namedItem('manage-code') as HTMLInputElement).value.trim();
				if (code) window.location.href = `/links/manage/${code}`;
			}}
		>
			<div class="flex flex-1 items-center overflow-hidden rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
				<span class="shrink-0 border-r border-border bg-surface-alt px-3 py-2 text-sm text-text-muted">go.nah.tools/</span>
				<input
					name="manage-code"
					type="text"
					placeholder="your-code"
					class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0"
				/>
			</div>
			<button
				type="submit"
				class="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			>
				Manage
			</button>
		</form>
		<p class="mt-2 text-xs text-text-muted">Enter your short code to view stats, edit the destination, or deactivate.</p>
	</section>
</div>
