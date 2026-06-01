<script lang="ts">
	import TextToolShell from '$components/text/TextToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { summarize, type SummaryResult } from '$text/summarize';

	let input = $state('');
	let ratio = $state(30); // percent of sentences to keep
	let busy = $state(false);
	let result = $state<SummaryResult | null>(null);
	let error = $state('');

	const wordCount = $derived(input.trim() ? input.trim().split(/\s+/).length : 0);

	async function run() {
		if (!input.trim() || busy) return;
		busy = true;
		error = '';
		try {
			result = await summarize(input, ratio / 100);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not summarize this text.';
			result = null;
		} finally {
			busy = false;
		}
	}

	function loadSample() {
		input =
			'The printing press was invented by Johannes Gutenberg around 1440 in Mainz, Germany. ' +
			'It introduced movable metal type to Europe and dramatically lowered the cost of producing books. ' +
			'Before its invention, books were copied by hand, a slow and expensive process that kept literacy rare. ' +
			'Within decades, presses had spread across the continent, and millions of books were in circulation. ' +
			'The resulting explosion of printed material accelerated the spread of new ideas. ' +
			'It played a central role in the Renaissance, the Reformation, and the Scientific Revolution. ' +
			'Standardized printed texts also helped fix spelling and grammar, shaping modern national languages. ' +
			'Historians widely regard the press as one of the most influential inventions in human history.';
		result = null;
	}

	const faqs = [
		{
			question: 'Is my text sent to a server or an AI model?',
			answer:
				'No. The summary is produced entirely in your browser using a frequency-based extractive algorithm. Nothing is uploaded, so even confidential documents stay private.'
		},
		{
			question: 'How does the summarizer choose sentences?',
			answer:
				'It scores each sentence by how often its meaningful words appear across the whole text, favors information-dense sentences, then returns the top-scoring ones in their original order. It extracts existing sentences rather than rewriting them.'
		},
		{
			question: 'What length should I pick?',
			answer:
				'The slider sets the share of sentences to keep. 20–30% works well for articles; raise it for dense technical text where most sentences carry weight, lower it for a quick gist.'
		}
	];
</script>

<TextToolShell
	slug="summarize"
	title="Text Summarizer"
	tagline="Condense long articles, reports, or notes into their key sentences — instantly and privately."
	description="Free in-browser text summarizer. Extract the most important sentences from any text with an adjustable summary length. No AI account, no uploads, 100% client-side."
	{faqs}
>
	<div class="space-y-5">
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="sum-input" class="text-sm font-medium text-text">Your text</label>
				<div class="flex gap-3">
					<button type="button" onclick={loadSample} class="text-xs font-medium text-accent hover:underline">Sample</button>
					{#if input}
						<button type="button" onclick={() => { input = ''; result = null; }} class="text-xs font-medium text-text-muted hover:text-accent">Clear</button>
					{/if}
				</div>
			</div>
			<textarea
				id="sum-input"
				bind:value={input}
				spellcheck="false"
				placeholder="Paste an article, report, or any long text here..."
				class="h-64 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
			<p class="text-xs text-text-muted">{wordCount.toLocaleString()} words</p>
		</div>

		<div class="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-surface-alt p-4">
			<div class="flex-1 space-y-1">
				<label for="sum-ratio" class="flex items-center justify-between text-sm font-medium text-text">
					Summary length
					<span class="font-mono text-accent">{ratio}%</span>
				</label>
				<input id="sum-ratio" type="range" min="10" max="60" step="5" bind:value={ratio} class="w-full accent-accent" />
			</div>
			<button
				type="button"
				onclick={run}
				disabled={!input.trim() || busy}
				class="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
			>
				{busy ? 'Summarizing…' : 'Summarize'}
			</button>
		</div>

		{#if error}
			<p class="text-sm text-error">{error}</p>
		{/if}

		{#if result}
			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<h2 class="font-display text-lg font-700 text-text">Summary</h2>
					<CopyButton text={() => result?.summary ?? ''} small />
				</div>
				<div class="rounded-xl border border-border bg-surface p-4 text-sm leading-relaxed text-text">
					{result.summary}
				</div>
				<p class="text-xs text-text-muted">
					Kept {result.summaryCount} of {result.sentenceCount} sentences
					{#if result.reductionPct > 0}<span class="text-success">({result.reductionPct}% shorter)</span>{/if}
				</p>
			</div>
		{/if}
	</div>
</TextToolShell>
