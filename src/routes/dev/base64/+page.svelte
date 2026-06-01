<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	type Mode = 'encode' | 'decode';

	let mode = $state<Mode>('encode');
	let input = $state('');
	let urlSafe = $state(false);

	// File section
	let fileName = $state('');
	let fileSize = $state(0);
	let fileMime = $state('');
	let fileB64 = $state('');

	function encodeUtf8(str: string): string {
		const bytes = new TextEncoder().encode(str);
		let binary = '';
		for (let i = 0; i < bytes.length; i += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
		}
		let b64 = btoa(binary);
		if (urlSafe) {
			b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
		}
		return b64;
	}

	function decodeUtf8(b64: string): string {
		let normalized = b64.trim();
		if (urlSafe) {
			normalized = normalized.replace(/-/g, '+').replace(/_/g, '/');
			const pad = normalized.length % 4;
			if (pad) normalized += '='.repeat(4 - pad);
		}
		const binary = atob(normalized);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		return new TextDecoder().decode(bytes);
	}

	type OutputState = { ok: true; value: string } | { ok: false; error: string };

	const output = $derived.by((): OutputState => {
		if (!input.trim()) return { ok: true, value: '' };
		try {
			if (mode === 'encode') {
				return { ok: true, value: encodeUtf8(input) };
			} else {
				return { ok: true, value: decodeUtf8(input) };
			}
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Invalid input' };
		}
	});

	function encodeBytes(bytes: Uint8Array): string {
		let binary = '';
		for (let i = 0; i < bytes.length; i += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
		}
		return btoa(binary);
	}

	function handleFileChange(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		fileName = file.name;
		fileSize = file.size;
		fileMime = file.type || 'application/octet-stream';
		const reader = new FileReader();
		reader.onload = () => {
			const buf = reader.result as ArrayBuffer;
			fileB64 = encodeBytes(new Uint8Array(buf));
		};
		reader.readAsArrayBuffer(file);
	}

	function formatBytes(n: number): string {
		if (n < 1024) return `${n} B`;
		if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
		return `${(n / (1024 * 1024)).toFixed(1)} MB`;
	}

	const dataUri = $derived(fileB64 ? `data:${fileMime};base64,${fileB64}` : '');

	const faqs = [
		{
			question: 'Is my data uploaded anywhere?',
			answer:
				'No. All encoding and decoding runs entirely in your browser using built-in JavaScript APIs. Nothing leaves your device.'
		},
		{
			question: 'What is URL-safe Base64?',
			answer:
				'Standard Base64 uses + and / characters that have special meaning in URLs. URL-safe Base64 replaces + with - and / with _, and strips = padding — making the output safe to include in query strings and path segments without further escaping.'
		},
		{
			question: 'Why does naive btoa() break on non-ASCII text?',
			answer:
				'btoa() only handles Latin-1 (byte values 0–255). Multi-byte UTF-8 characters like emoji or CJK glyphs have code points above 255, which throws. This tool first encodes text to a UTF-8 byte array, then Base64-encodes those bytes — so any Unicode string works correctly.'
		}
	];
</script>

<DevToolShell
	slug="base64"
	title="Base64 Encoder / Decoder"
	tagline="Encode or decode Base64 for text and files — UTF-8 safe, URL-safe option, fully in-browser."
	description="Free Base64 encoder and decoder. Supports UTF-8 text, URL-safe mode, and file encoding with data URI output. 100% client-side, nothing uploaded."
	{faqs}
>
	<div class="space-y-6">
		<!-- Text section -->
		<div class="space-y-3 rounded-2xl border border-border bg-surface p-5">
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div class="inline-flex rounded-lg border border-border p-0.5 text-sm">
					{#each (['encode', 'decode'] as const) as m}
						<button
							type="button"
							onclick={() => { mode = m; input = ''; }}
							class="rounded-md px-3 py-1 capitalize transition-colors {mode === m ? 'bg-accent text-white' : 'text-text-muted hover:text-accent'}"
						>
							{m}
						</button>
					{/each}
				</div>
				<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
					<input type="checkbox" bind:checked={urlSafe} class="rounded accent-accent" />
					URL-safe
				</label>
			</div>

			<div class="grid gap-4 lg:grid-cols-2">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label for="b64-input" class="text-sm font-medium text-text">
							{mode === 'encode' ? 'Plain text' : 'Base64 input'}
						</label>
						<button
							type="button"
							onclick={() => (input = '')}
							class="text-xs font-medium text-text-muted hover:text-accent"
						>
							Clear
						</button>
					</div>
					<textarea
						id="b64-input"
						bind:value={input}
						spellcheck="false"
						placeholder={mode === 'encode' ? 'Text to encode…' : 'Base64 to decode…'}
						class="h-48 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-text">
							{mode === 'encode' ? 'Base64 output' : 'Decoded text'}
						</span>
						{#if output.ok && output.value}
							<CopyButton text={() => (output.ok ? output.value : '')} small />
						{/if}
					</div>
					<div class="h-48 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-sm">
						{#if !output.ok}
							<p class="text-error">{output.error}</p>
						{:else if output.value}
							<pre class="whitespace-pre-wrap break-words">{output.value}</pre>
						{:else}
							<p class="text-text-muted">Output appears here.</p>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- File section -->
		<div class="space-y-4 rounded-2xl border border-border bg-surface p-5">
			<h2 class="text-sm font-700 text-text">Encode a file</h2>

			<div class="space-y-1.5">
				<label for="b64-file" class="block text-sm text-text-muted">Select a file to Base64-encode</label>
				<input
					id="b64-file"
					type="file"
					onchange={handleFileChange}
					class="w-full cursor-pointer rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:border-accent/50"
				/>
			</div>

			{#if fileB64}
				<div class="space-y-4">
					<p class="text-xs text-text-muted">
						{fileName} &mdash; {formatBytes(fileSize)} &mdash; {fileMime}
					</p>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-text">Raw Base64</span>
							<CopyButton text={() => fileB64} small />
						</div>
						<div class="h-32 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-xs break-all">
							{fileB64}
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-text">Data URI</span>
							<CopyButton text={() => dataUri} small />
						</div>
						<div class="h-24 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-xs break-all">
							{dataUri}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</DevToolShell>
