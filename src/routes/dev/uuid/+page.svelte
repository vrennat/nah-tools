<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	type IdType = 'v4' | 'v7' | 'nano';

	let idType = $state<IdType>('v4');
	let count = $state(1);
	let uppercase = $state(false);
	let nanoSize = $state(21);
	let results = $state<string[]>([]);

	// UUID v4 using Web Crypto
	function uuidV4(): string {
		return crypto.randomUUID();
	}

	// UUID v7: time-sortable — 48-bit ms timestamp + version nibble + random
	function uuidV7(): string {
		const bytes = new Uint8Array(16);
		crypto.getRandomValues(bytes);
		const ms = Date.now();
		// Write 48-bit big-endian timestamp into first 6 bytes
		bytes[0] = (ms / 2 ** 40) & 0xff;
		bytes[1] = (ms / 2 ** 32) & 0xff;
		bytes[2] = (ms / 2 ** 24) & 0xff;
		bytes[3] = (ms / 2 ** 16) & 0xff;
		bytes[4] = (ms / 2 ** 8) & 0xff;
		bytes[5] = ms & 0xff;
		// Version nibble: byte 6 high nibble = 7
		bytes[6] = (bytes[6] & 0x0f) | 0x70;
		// Variant bits: byte 8 high bits = 10
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		const h = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
		return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
	}

	// Nano ID using Web Crypto with the standard alphabet
	const NANO_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

	function nanoId(size: number): string {
		const mask = 63; // alphabet length - 1, works because 64 is a power of 2
		let id = '';
		while (id.length < size) {
			const chunk = new Uint8Array(size * 2);
			crypto.getRandomValues(chunk);
			for (let i = 0; i < chunk.length && id.length < size; i++) {
				const idx = chunk[i] & mask;
				id += NANO_ALPHABET[idx];
			}
		}
		return id;
	}

	function generate() {
		const n = Math.max(1, Math.min(1000, count));
		const ids: string[] = [];
		for (let i = 0; i < n; i++) {
			if (idType === 'v4') ids.push(uuidV4());
			else if (idType === 'v7') ids.push(uuidV7());
			else ids.push(nanoId(Math.max(1, Math.min(256, nanoSize))));
		}
		results = ids;
	}

	function formatId(id: string): string {
		if (idType !== 'nano' && uppercase) return id.toUpperCase();
		return id;
	}

	const allText = $derived(results.map(formatId).join('\n'));

	function downloadTxt() {
		const blob = new Blob([allText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${idType}-ids.txt`;
		a.click();
		URL.revokeObjectURL(url);
	}

	// Generate one on mount
	$effect(() => {
		generate();
	});

	const faqs = [
		{
			question: 'What is the difference between UUID v4 and UUID v7?',
			answer:
				'UUID v4 is entirely random — 122 random bits with no inherent ordering. UUID v7 embeds a 48-bit millisecond timestamp in the first 6 bytes, making the IDs lexicographically sortable by creation time. This matters for database primary keys: v7 inserts at the end of a B-tree index (good for performance) while v4 inserts randomly (causing index fragmentation).'
		},
		{
			question: 'What is Nano ID and when should I use it?',
			answer:
				'Nano ID produces URL-safe random IDs using a 64-character alphabet. A 21-character Nano ID has roughly the same collision probability as a UUID v4 but is shorter and has no dashes. Use it when you want compact, URL-friendly IDs and do not need the timestamp-sortable property of UUID v7.'
		},
		{
			question: 'Are the IDs generated securely?',
			answer:
				'Yes. All IDs use crypto.getRandomValues, the Web Crypto API, which is cryptographically secure. Nothing is sent to a server — generation happens entirely in your browser.'
		}
	];
</script>

<DevToolShell
	slug="uuid"
	title="UUID & Nano ID Generator"
	tagline="Generate UUID v4, UUID v7, and Nano IDs in bulk — instantly in your browser."
	description="Free online UUID and Nano ID generator. Create UUID v4, UUID v7 (time-sortable), and Nano IDs in bulk. 100% client-side, no signup required."
	{faqs}
>
	<div class="space-y-6">
		<!-- Controls -->
		<div class="flex flex-wrap items-end gap-4">
			<!-- Type toggle -->
			<div class="space-y-1">
				<span class="text-sm font-medium text-text">Type</span>
				<div class="inline-flex rounded-lg border border-border p-0.5 text-sm">
					{#each [['v4', 'UUID v4'], ['v7', 'UUID v7'], ['nano', 'Nano ID']] as const as [val, label]}
						<button
							type="button"
							onclick={() => {
								idType = val;
								results = [];
							}}
							class="rounded-md px-3 py-1 transition-colors {idType === val
								? 'bg-accent text-white'
								: 'text-text-muted hover:text-accent'}"
						>
							{label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Count -->
			<div class="space-y-1">
				<label for="id-count" class="text-sm font-medium text-text">Count</label>
				<input
					id="id-count"
					type="number"
					bind:value={count}
					min="1"
					max="1000"
					class="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>

			<!-- Nano size or Uppercase toggle -->
			{#if idType === 'nano'}
				<div class="space-y-1">
					<label for="nano-size" class="text-sm font-medium text-text">Size</label>
					<input
						id="nano-size"
						type="number"
						bind:value={nanoSize}
						min="1"
						max="256"
						class="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			{:else}
				<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm text-text-muted select-none">
					<input
						type="checkbox"
						bind:checked={uppercase}
						class="accent-[var(--color-accent)]"
					/>
					Uppercase
				</label>
			{/if}

			<!-- Generate button -->
			<button
				type="button"
				onclick={generate}
				class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			>
				Generate
			</button>
		</div>

		<!-- Output -->
		{#if results.length === 1}
			<div class="flex items-center gap-3 rounded-xl border border-border bg-surface px-5 py-4">
				<span class="min-w-0 flex-1 break-all font-mono text-base text-text"
					>{formatId(results[0])}</span
				>
				<CopyButton text={() => formatId(results[0])} />
			</div>
		{:else if results.length > 1}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<span class="text-sm text-text-muted">{results.length} IDs</span>
					<div class="flex items-center gap-2">
						<CopyButton text={() => allText} />
						<button
							type="button"
							onclick={downloadTxt}
							class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
						>
							Download .txt
						</button>
					</div>
				</div>
				<textarea
					readonly
					value={allText}
					class="h-64 w-full resize-y rounded-xl border border-border bg-surface p-3 font-mono text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				></textarea>
			</div>
		{/if}
	</div>
</DevToolShell>
