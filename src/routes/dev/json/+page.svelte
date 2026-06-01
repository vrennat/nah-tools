<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import JsonNode from '$components/dev/JsonNode.svelte';

	let input = $state('');
	let indent = $state(2);
	let view = $state<'formatted' | 'minified' | 'tree'>('formatted');

	let parsed = $state<{ ok: true; value: unknown } | { ok: false; error: string }>({
		ok: true,
		value: undefined
	});

	$effect(() => {
		const text = input.trim();
		if (!text) {
			parsed = { ok: true, value: undefined };
			return;
		}
		try {
			parsed = { ok: true, value: JSON.parse(text) };
		} catch (e) {
			parsed = { ok: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
		}
	});

	const formatted = $derived(
		parsed.ok && parsed.value !== undefined ? JSON.stringify(parsed.value, null, indent) : ''
	);
	const minified = $derived(
		parsed.ok && parsed.value !== undefined ? JSON.stringify(parsed.value) : ''
	);
	const output = $derived(view === 'minified' ? minified : formatted);

	const sizeInfo = $derived.by(() => {
		if (!parsed.ok || parsed.value === undefined) return null;
		const orig = new Blob([input]).size;
		const min = new Blob([minified]).size;
		return { orig, min, saved: orig > 0 ? Math.round(((orig - min) / orig) * 100) : 0 };
	});

	function loadSample() {
		input = JSON.stringify(
			{
				name: 'nah.tools',
				free: true,
				tools: ['json', 'base64', 'jwt'],
				meta: { stars: 1337, owner: { handle: 'vrennat' } }
			},
			null,
			2
		);
	}

	const faqs = [
		{
			question: 'Is my JSON uploaded anywhere?',
			answer:
				'No. Parsing, formatting, and validation all happen in your browser with the native JSON engine. Nothing is sent to a server.'
		},
		{
			question: 'How big a file can it handle?',
			answer:
				'It handles multi-megabyte documents comfortably. Very large files (tens of MB) may be slow to render in tree view — use formatted or minified view instead.'
		},
		{
			question: 'What does the validator check?',
			answer:
				'It runs the standard JSON parser and reports the exact error message and position when the document is not valid JSON.'
		}
	];
</script>

<DevToolShell
	slug="json"
	title="JSON Formatter & Validator"
	tagline="Format, validate, minify, and explore JSON — instantly, in your browser."
	description="Free JSON formatter, validator, and minifier with an interactive tree view. Beautify or minify JSON, catch syntax errors, and explore nested data. 100% client-side."
	{faqs}
>
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Input -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<label for="json-in" class="text-sm font-medium text-text">Input</label>
				<div class="flex gap-2">
					<button type="button" onclick={loadSample} class="text-xs font-medium text-accent hover:underline">Sample</button>
					<button type="button" onclick={() => (input = '')} class="text-xs font-medium text-text-muted hover:text-accent">Clear</button>
				</div>
			</div>
			<textarea
				id="json-in"
				bind:value={input}
				spellcheck="false"
				placeholder={'{ "paste": "your JSON here" }'}
				class="h-96 w-full resize-y rounded-xl border border-border bg-surface p-3 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>

			<div class="flex flex-wrap items-center gap-3">
				<label class="flex items-center gap-2 text-sm text-text-muted">
					Indent
					<select bind:value={indent} class="rounded-lg border border-border bg-surface px-2 py-1 text-sm focus:border-accent focus:outline-none">
						<option value={2}>2 spaces</option>
						<option value={4}>4 spaces</option>
						<option value={0}>Tab</option>
					</select>
				</label>
				{#if sizeInfo}
					<span class="text-xs text-text-muted">
						{sizeInfo.orig.toLocaleString()} → {sizeInfo.min.toLocaleString()} bytes
						{#if sizeInfo.saved > 0}<span class="text-success">(−{sizeInfo.saved}%)</span>{/if}
					</span>
				{/if}
			</div>
		</div>

		<!-- Output -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<div class="inline-flex rounded-lg border border-border p-0.5 text-sm">
					{#each ['formatted', 'minified', 'tree'] as const as v}
						<button
							type="button"
							onclick={() => (view = v)}
							class="rounded-md px-3 py-1 capitalize transition-colors {view === v ? 'bg-accent text-white' : 'text-text-muted hover:text-accent'}"
						>
							{v}
						</button>
					{/each}
				</div>
				{#if view !== 'tree' && output}
					<CopyButton text={() => output} small />
				{/if}
			</div>

			<div class="h-96 overflow-auto rounded-xl border border-border bg-surface p-3 font-mono text-sm">
				{#if !parsed.ok}
					<p class="text-error">{parsed.error}</p>
				{:else if parsed.value === undefined}
					<p class="text-text-muted">Output appears here.</p>
				{:else if view === 'tree'}
					<JsonNode value={parsed.value} />
				{:else}
					<pre class="whitespace-pre-wrap break-words">{output}</pre>
				{/if}
			</div>

			{#if parsed.ok && parsed.value !== undefined}
				<p class="inline-flex items-center gap-1.5 text-sm font-medium text-success">
					<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4" />
					</svg>
					Valid JSON
				</p>
			{/if}
		</div>
	</div>
</DevToolShell>
