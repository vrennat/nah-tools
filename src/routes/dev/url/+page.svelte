<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';

	type Mode = 'encode' | 'decode' | 'parse';

	let mode = $state<Mode>('encode');
	let input = $state('');
	let fullUrlEncode = $state(false);

	type EncodeState = { ok: true; value: string } | { ok: false; error: string };

	const encodeOutput = $derived.by((): EncodeState => {
		if (!input.trim()) return { ok: true, value: '' };
		try {
			return { ok: true, value: fullUrlEncode ? encodeURI(input) : encodeURIComponent(input) };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Encode failed' };
		}
	});

	const decodeOutput = $derived.by((): EncodeState => {
		if (!input.trim()) return { ok: true, value: '' };
		try {
			return { ok: true, value: decodeURIComponent(input) };
		} catch (e) {
			return { ok: false, error: e instanceof Error ? e.message : 'Malformed percent-encoding' };
		}
	});

	interface ParsedUrl {
		parts: { label: string; value: string }[];
		params: { key: string; value: string }[];
	}

	const parsed = $derived.by((): { ok: true; result: ParsedUrl } | { ok: false; error: string } => {
		const raw = input.trim();
		if (!raw) return { ok: true, result: { parts: [], params: [] } };

		let url: URL | null = null;
		let searchStr = raw;

		try {
			url = new URL(raw);
		} catch {
			// treat as query string
		}

		const parts: { label: string; value: string }[] = [];
		if (url) {
			if (url.protocol) parts.push({ label: 'Protocol', value: url.protocol.replace(/:$/, '') });
			if (url.host) parts.push({ label: 'Host', value: url.host });
			if (url.pathname && url.pathname !== '/') parts.push({ label: 'Pathname', value: url.pathname });
			if (url.hash) parts.push({ label: 'Hash', value: url.hash });
			searchStr = url.search;
		}

		const params: { key: string; value: string }[] = [];
		try {
			const usp = new URLSearchParams(searchStr.replace(/^\?/, ''));
			usp.forEach((value, key) => params.push({ key, value }));
		} catch {
			// ignore malformed params
		}

		return { ok: true, result: { parts, params } };
	});

	const faqs = [
		{
			question: 'Is anything sent to a server?',
			answer:
				'No. Encoding, decoding, and URL parsing all run in your browser using native JavaScript APIs. No data leaves your device.'
		},
		{
			question: 'What is the difference between encodeURIComponent and encodeURI?',
			answer:
				'encodeURIComponent encodes everything except letters, digits, and - _ . ! ~ * \' ( ). encodeURI additionally leaves : / ? # [ ] @ & = + $ , ; % intact — it is meant for full URLs where you want to preserve URL structure. Use encodeURIComponent for individual query values; use encodeURI when encoding a complete URL.'
		},
		{
			question: 'Why does decoding sometimes show an error?',
			answer:
				'decodeURIComponent throws on malformed percent-sequences like a bare % or %xy where xy is not valid hex. The tool surfaces the browser\'s exact error so you can identify the offending character.'
		}
	];
</script>

<DevToolShell
	slug="url"
	title="URL Encoder / Decoder"
	tagline="Encode, decode, and parse URLs and query strings — instantly, in your browser."
	description="Free URL encoder, decoder, and query string parser. Supports encodeURIComponent, encodeURI, and full URL breakdown. 100% client-side, nothing uploaded."
	{faqs}
>
	<div class="space-y-4">
		<div class="flex flex-wrap items-center gap-2">
			{#each (['encode', 'decode', 'parse'] as const) as m}
				<button
					type="button"
					onclick={() => { mode = m; input = ''; }}
					class="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors {mode === m
						? 'border-accent bg-accent text-white'
						: 'border-border bg-surface text-text hover:border-accent/50 hover:text-accent'}"
				>
					{m.charAt(0).toUpperCase() + m.slice(1)}
				</button>
			{/each}
		</div>

		{#if mode === 'encode'}
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<label for="url-enc-in" class="text-sm font-medium text-text">Input</label>
						<label class="flex cursor-pointer items-center gap-2 text-xs text-text-muted">
							<input type="checkbox" bind:checked={fullUrlEncode} class="rounded accent-accent" />
							Encode full URL (preserve :/?&amp;=)
						</label>
					</div>
					<textarea
						id="url-enc-in"
						bind:value={input}
						spellcheck="false"
						placeholder="Text or URL to encode…"
						class="h-48 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-text">Encoded output</span>
						{#if encodeOutput.ok && encodeOutput.value}
							<CopyButton text={() => (encodeOutput.ok ? encodeOutput.value : '')} small />
						{/if}
					</div>
					<div class="h-48 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-sm">
						{#if !encodeOutput.ok}
							<p class="text-error">{encodeOutput.error}</p>
						{:else if encodeOutput.value}
							<pre class="whitespace-pre-wrap break-words">{encodeOutput.value}</pre>
						{:else}
							<p class="text-text-muted">Output appears here.</p>
						{/if}
					</div>
				</div>
			</div>

		{:else if mode === 'decode'}
			<div class="grid gap-4 lg:grid-cols-2">
				<div class="space-y-2">
					<label for="url-dec-in" class="block text-sm font-medium text-text">Encoded input</label>
					<textarea
						id="url-dec-in"
						bind:value={input}
						spellcheck="false"
						placeholder="Percent-encoded text to decode…"
						class="h-48 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				<div class="space-y-2">
					<div class="flex items-center justify-between">
						<span class="text-sm font-medium text-text">Decoded output</span>
						{#if decodeOutput.ok && decodeOutput.value}
							<CopyButton text={() => (decodeOutput.ok ? decodeOutput.value : '')} small />
						{/if}
					</div>
					<div class="h-48 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-sm">
						{#if !decodeOutput.ok}
							<p class="text-error">{decodeOutput.error}</p>
						{:else if decodeOutput.value}
							<pre class="whitespace-pre-wrap break-words">{decodeOutput.value}</pre>
						{:else}
							<p class="text-text-muted">Output appears here.</p>
						{/if}
					</div>
				</div>
			</div>

		{:else}
			<div class="space-y-4">
				<div class="space-y-2">
					<label for="url-parse-in" class="block text-sm font-medium text-text">
						Full URL or query string
					</label>
					<textarea
						id="url-parse-in"
						bind:value={input}
						spellcheck="false"
						placeholder="https://example.com/path?foo=bar&baz=qux  or  ?foo=bar&baz=qux"
						class="h-24 w-full resize-y rounded-xl border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				{#if parsed.ok && (parsed.result.parts.length > 0 || parsed.result.params.length > 0 || input.trim())}
					<div class="space-y-4">
						{#if parsed.result.parts.length > 0}
							<div class="overflow-hidden rounded-xl border border-border bg-surface-alt">
								<div class="border-b border-border px-4 py-2">
									<span class="text-xs font-700 uppercase tracking-wide text-text-muted">URL parts</span>
								</div>
								<div class="divide-y divide-border">
									{#each parsed.result.parts as part}
										<div class="flex items-baseline gap-4 px-4 py-2.5">
											<span class="w-24 shrink-0 text-xs font-medium text-text-muted">{part.label}</span>
											<span class="min-w-0 break-all font-mono text-sm text-text">{part.value}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}

						<div class="overflow-hidden rounded-xl border border-border bg-surface-alt">
							<div class="border-b border-border px-4 py-2">
								<span class="text-xs font-700 uppercase tracking-wide text-text-muted">Query parameters</span>
							</div>
							{#if parsed.result.params.length > 0}
								<div class="divide-y divide-border">
									{#each parsed.result.params as param}
										<div class="flex items-baseline gap-4 px-4 py-2.5">
											<span class="w-40 shrink-0 break-all font-mono text-sm font-medium text-text">{param.key}</span>
											<span class="min-w-0 break-all font-mono text-sm text-text-muted">{param.value}</span>
										</div>
									{/each}
								</div>
							{:else}
								<p class="px-4 py-3 text-sm text-text-muted">No query parameters found.</p>
							{/if}
						</div>
					</div>
				{:else if !input.trim()}
					<p class="text-sm text-text-muted">Paste a URL or query string above to parse it.</p>
				{/if}
			</div>
		{/if}
	</div>
</DevToolShell>
