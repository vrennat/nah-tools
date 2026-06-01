<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { md5 } from '$dev/md5';

	const ALGOS = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const;
	type Algo = (typeof ALGOS)[number];

	const toHex = (buf: ArrayBuffer) =>
		[...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

	async function computeAll(bytes: Uint8Array): Promise<Record<Algo, string>> {
		// crypto.subtle.digest requires ArrayBuffer (not Uint8Array<ArrayBufferLike>)
		const buf: ArrayBuffer = bytes.buffer instanceof ArrayBuffer ? bytes.buffer : (bytes.buffer.slice(0) as unknown as ArrayBuffer);
		const [sha1, sha256, sha384, sha512] = await Promise.all([
			crypto.subtle.digest('SHA-1', buf).then(toHex),
			crypto.subtle.digest('SHA-256', buf).then(toHex),
			crypto.subtle.digest('SHA-384', buf).then(toHex),
			crypto.subtle.digest('SHA-512', buf).then(toHex)
		]);
		return {
			MD5: md5(bytes),
			'SHA-1': sha1,
			'SHA-256': sha256,
			'SHA-384': sha384,
			'SHA-512': sha512
		};
	}

	// Text section
	let textInput = $state('');
	let uppercase = $state(false);
	let textHashes = $state<Record<Algo, string> | null>(null);

	$effect(() => {
		const t = textInput;
		if (!t) {
			textHashes = null;
			return;
		}
		const bytes = new TextEncoder().encode(t);
		computeAll(bytes).then((h) => {
			textHashes = h;
		});
	});

	function displayHash(h: string) {
		return uppercase ? h.toUpperCase() : h;
	}

	// File section
	let fileName = $state('');
	let fileSize = $state(0);
	let fileHashes = $state<Record<Algo, string> | null>(null);
	let fileLoading = $state(false);
	let compareValue = $state('');

	const compareResult = $derived.by(() => {
		if (!compareValue.trim() || !fileHashes) return null;
		const needle = compareValue.trim().toLowerCase();
		const match = Object.values(fileHashes).some((h) => h.toLowerCase() === needle);
		return match;
	});

	async function handleFile(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		fileName = file.name;
		fileSize = file.size;
		fileLoading = true;
		fileHashes = null;
		try {
			const buf = await file.arrayBuffer();
			fileHashes = await computeAll(new Uint8Array(buf));
		} finally {
			fileLoading = false;
		}
	}

	function formatBytes(n: number) {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / 1024 / 1024).toFixed(2)} MB`;
	}

	const faqs = [
		{
			question: 'Are MD5 and SHA-1 safe to use?',
			answer:
				'Not for security purposes. MD5 and SHA-1 are not collision-resistant — attackers can craft two different inputs that produce the same hash. They are fine for checksums and data integrity checks where there is no adversarial input, but you should use SHA-256 or higher for anything security-sensitive.'
		},
		{
			question: 'Is my text or file uploaded anywhere?',
			answer:
				'No. All hashing runs entirely in your browser using the Web Crypto API and a local MD5 implementation. No data leaves your device.'
		},
		{
			question: 'What is the file checksum feature for?',
			answer:
				'Paste the expected hash from a download page into the "Compare to" field and drop your file. The tool tells you whether the hashes match, so you can confirm the file has not been corrupted or tampered with.'
		}
	];
</script>

<DevToolShell
	slug="hash"
	title="Hash Generator"
	tagline="Compute MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes — for text or files."
	description="Free online hash generator. Compute MD5 and SHA-2 checksums for text or files instantly in your browser. Verify downloads, check integrity, no upload required."
	{faqs}
>
	<div class="space-y-8">
		<!-- Text hashing -->
		<section class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="font-display text-lg font-700">Text</h2>
				<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
					<input type="checkbox" bind:checked={uppercase} class="accent-[var(--color-accent)]" />
					Uppercase
				</label>
			</div>

			<textarea
				bind:value={textInput}
				spellcheck="false"
				placeholder="Type or paste text to hash…"
				class="h-32 w-full resize-y rounded-xl border border-border bg-surface p-3 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>

			{#if textHashes}
				<div class="space-y-2">
					{#each ALGOS as algo}
						<div class="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
							<span class="w-16 shrink-0 font-mono text-xs font-medium text-text-muted">{algo}</span>
							<span class="min-w-0 flex-1 break-all font-mono text-xs text-text"
								>{displayHash(textHashes[algo])}</span
							>
							<CopyButton text={() => displayHash(textHashes![algo])} small />
						</div>
					{/each}
				</div>
			{:else if textInput}
				<p class="text-sm text-text-muted">Computing…</p>
			{:else}
				<p class="text-sm text-text-muted">Hashes appear as you type.</p>
			{/if}
		</section>

		<hr class="border-border" />

		<!-- File hashing -->
		<section class="space-y-4">
			<h2 class="font-display text-lg font-700">File</h2>

			<label
				class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-accent/50 hover:bg-surface-alt"
			>
				<svg
					class="h-8 w-8 text-text-muted"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
					/>
				</svg>
				<span class="text-sm font-medium text-text">Drop a file or click to browse</span>
				<span class="text-xs text-text-muted">Any file type, any size</span>
				<input type="file" class="sr-only" onchange={handleFile} />
			</label>

			{#if fileLoading}
				<p class="text-sm text-text-muted">Computing hashes…</p>
			{/if}

			{#if fileHashes}
				<div class="space-y-3">
					<div class="flex items-center gap-2 text-sm text-text-muted">
						<svg
							class="h-4 w-4"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
							/>
						</svg>
						<span class="font-medium text-text">{fileName}</span>
						<span>({formatBytes(fileSize)})</span>
					</div>

					<div class="space-y-2">
						{#each ALGOS as algo}
							<div class="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3">
								<span class="w-16 shrink-0 font-mono text-xs font-medium text-text-muted">{algo}</span>
								<span class="min-w-0 flex-1 break-all font-mono text-xs text-text"
									>{displayHash(fileHashes[algo])}</span
								>
								<CopyButton text={() => displayHash(fileHashes![algo])} small />
							</div>
						{/each}
					</div>

					<!-- Compare field -->
					<div class="space-y-2 pt-2">
						<label for="compare" class="text-sm font-medium text-text">Compare to expected hash</label>
						<div class="flex items-center gap-3">
							<input
								id="compare"
								type="text"
								bind:value={compareValue}
								placeholder="Paste expected checksum here…"
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							{#if compareResult === true}
								<svg
									class="h-5 w-5 shrink-0 text-success"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
								</svg>
							{:else if compareResult === false}
								<svg
									class="h-5 w-5 shrink-0 text-error"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							{/if}
						</div>
						{#if compareResult === true}
							<p class="text-sm font-medium text-success">Match — hashes are identical.</p>
						{:else if compareResult === false}
							<p class="text-sm font-medium text-error">No match — hashes differ.</p>
						{/if}
					</div>
				</div>
			{/if}
		</section>
	</div>
</DevToolShell>
