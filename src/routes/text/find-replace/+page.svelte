<script lang="ts">
	import TextToolShell from '$components/text/TextToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { downloadBlob } from '$qr/exporter';

	let input = $state('');
	let find = $state('');
	let replace = $state('');
	let useRegex = $state(false);
	let caseSensitive = $state(false);
	let wholeWord = $state(false);

	function escapeRegex(s: string): string {
		return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	}

	// Build the search regex (or an error). Recomputed reactively.
	const compiled = $derived.by<{ regex: RegExp | null; error: string }>(() => {
		if (find === '') return { regex: null, error: '' };
		try {
			let pattern = useRegex ? find : escapeRegex(find);
			if (wholeWord && !useRegex) pattern = `\\b${pattern}\\b`;
			const flags = 'g' + (caseSensitive ? '' : 'i');
			return { regex: new RegExp(pattern, flags), error: '' };
		} catch (e) {
			return { regex: null, error: e instanceof Error ? e.message : 'Invalid regular expression' };
		}
	});

	const matchCount = $derived.by(() => {
		if (!compiled.regex || input === '') return 0;
		const matches = input.match(compiled.regex);
		return matches ? matches.length : 0;
	});

	const output = $derived.by(() => {
		if (!compiled.regex) return input;
		// Allow $1-style backreferences only in regex mode; otherwise treat $ literally.
		const replacement = useRegex ? replace : replace.replace(/\$/g, '$$$$');
		return input.replace(compiled.regex, replacement);
	});

	function download() {
		downloadBlob(new Blob([output], { type: 'text/plain' }), 'replaced.txt');
	}

	const faqs = [
		{
			question: 'Is my text uploaded anywhere?',
			answer: 'No. Find and replace runs entirely in your browser. Nothing is sent to a server.'
		},
		{
			question: 'How do I use capture groups?',
			answer: 'Turn on "Regex" and reference capture groups in the replacement with $1, $2, and so on. For example, find (\\w+)@(\\w+) and replace with $2.$1 to swap around an @ sign.'
		},
		{
			question: 'What does "whole word" do?',
			answer: 'It wraps your search term in word boundaries so "cat" matches the word cat but not "category". It applies in plain-text mode; in regex mode, add \\b yourself.'
		}
	];
</script>

<TextToolShell
	slug="find-replace"
	title="Find & Replace"
	tagline="Bulk find and replace across any text, with regex, case sensitivity, and whole-word matching."
	description="Free online find and replace tool. Bulk substitute text with optional regular expressions, case-sensitive matching, and whole-word matching. 100% client-side."
	{faqs}
>
	<div class="space-y-5">
		<div class="grid gap-3 sm:grid-cols-2">
			<label class="space-y-1.5">
				<span class="text-sm font-medium text-text">Find</span>
				<input
					bind:value={find}
					spellcheck="false"
					placeholder={useRegex ? 'pattern' : 'text to find'}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					class:border-error={compiled.error !== ''}
				/>
			</label>
			<label class="space-y-1.5">
				<span class="text-sm font-medium text-text">Replace with</span>
				<input
					bind:value={replace}
					spellcheck="false"
					placeholder="replacement"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</label>
		</div>

		<div class="flex flex-wrap gap-x-5 gap-y-2">
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={useRegex} class="accent-accent" />
				<span class="text-text">Regex</span>
			</label>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={caseSensitive} class="accent-accent" />
				<span class="text-text">Case sensitive</span>
			</label>
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={wholeWord} disabled={useRegex} class="accent-accent disabled:opacity-40" />
				<span class="text-text" class:opacity-40={useRegex}>Whole word</span>
			</label>
		</div>

		{#if compiled.error}
			<div class="rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
				Invalid regex: {compiled.error}
			</div>
		{/if}

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="fr-input" class="text-sm font-medium text-text">Input</label>
				{#if input}
					<button type="button" onclick={() => (input = '')} class="text-xs font-medium text-text-muted hover:text-accent">Clear</button>
				{/if}
			</div>
			<textarea
				id="fr-input"
				bind:value={input}
				spellcheck="false"
				placeholder="Type or paste your text here..."
				class="h-56 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
			{#if find && !compiled.error}
				<p class="text-xs text-text-muted">
					{matchCount.toLocaleString()} match{matchCount === 1 ? '' : 'es'} found
				</p>
			{/if}
		</div>

		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-text">Result</span>
				<div class="flex items-center gap-2">
					<CopyButton text={() => output} small disabled={!input} />
					<button
						type="button"
						onclick={download}
						disabled={!input}
						class="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-text transition-colors hover:border-accent/50 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
					>
						Download
					</button>
				</div>
			</div>
			<textarea
				readonly
				value={output}
				placeholder="Result appears here"
				class="h-56 w-full resize-y rounded-lg border border-border bg-surface-alt px-3 py-2 font-mono text-sm text-text-muted focus:outline-none"
			></textarea>
		</div>
	</div>
</TextToolShell>
