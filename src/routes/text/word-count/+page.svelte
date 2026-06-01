<script lang="ts">
	import TextToolShell from '$components/text/TextToolShell.svelte';
	import { analyzeText, formatDuration } from '$text/word-count';

	let input = $state('');
	const stats = $derived(analyzeText(input));

	const primary = $derived([
		{ label: 'Words', value: stats.words.toLocaleString() },
		{ label: 'Characters', value: stats.characters.toLocaleString() },
		{ label: 'Characters (no spaces)', value: stats.charactersNoSpaces.toLocaleString() },
		{ label: 'Sentences', value: stats.sentences.toLocaleString() },
		{ label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
		{ label: 'Lines', value: stats.lines.toLocaleString() }
	]);

	const faqs = [
		{
			question: 'Is my text uploaded anywhere?',
			answer: 'No. All counting happens entirely in your browser. Nothing is sent to a server, so even sensitive drafts stay private.'
		},
		{
			question: 'How is reading time calculated?',
			answer: 'Reading time assumes 225 words per minute, the average adult silent reading speed for non-technical prose. Speaking time assumes 130 words per minute, a comfortable presentation pace.'
		},
		{
			question: 'How are sentences counted?',
			answer: 'Sentences are counted by terminal punctuation (period, question mark, exclamation point). Abbreviations like "Dr." or "e.g." can inflate the count slightly — treat it as an estimate.'
		}
	];
</script>

<TextToolShell
	slug="word-count"
	title="Word Counter"
	tagline="Count words, characters, sentences, and paragraphs — plus reading and speaking time — as you type."
	description="Free online word and character counter. Get word count, character count, sentence and paragraph counts, plus reading and speaking time estimates. 100% client-side."
	{faqs}
>
	<div class="space-y-5">
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="wc-input" class="text-sm font-medium text-text">Your text</label>
				{#if input}
					<button type="button" onclick={() => (input = '')} class="text-xs font-medium text-text-muted hover:text-accent">Clear</button>
				{/if}
			</div>
			<textarea
				id="wc-input"
				bind:value={input}
				spellcheck="false"
				placeholder="Type or paste your text here..."
				class="h-64 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-relaxed focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
		</div>

		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
			{#each primary as stat}
				<div class="rounded-xl border border-border bg-surface p-4">
					<div class="font-display text-2xl font-700 text-text">{stat.value}</div>
					<div class="mt-0.5 text-xs text-text-muted">{stat.label}</div>
				</div>
			{/each}
		</div>

		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
			<div class="flex items-center gap-3 rounded-xl border border-border bg-surface-alt p-4">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
				</div>
				<div>
					<div class="font-display text-lg font-700 text-text">{formatDuration(stats.readingTime)}</div>
					<div class="text-xs text-text-muted">Reading time</div>
				</div>
			</div>
			<div class="flex items-center gap-3 rounded-xl border border-border bg-surface-alt p-4">
				<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
				</div>
				<div>
					<div class="font-display text-lg font-700 text-text">{formatDuration(stats.speakingTime)}</div>
					<div class="text-xs text-text-muted">Speaking time</div>
				</div>
			</div>
		</div>
	</div>
</TextToolShell>
