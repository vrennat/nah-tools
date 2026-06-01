<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { caseDefs, convertCase } from '$dev/case';

	let input = $state('');

	const charCount = $derived(input.length);
	const wordCount = $derived(
		input.trim() === '' ? 0 : input.trim().split(/\s+/).filter(Boolean).length
	);

	const faqs = [
		{
			question: 'Is my text uploaded anywhere?',
			answer: 'No. All conversions happen entirely in your browser. Nothing is sent to a server.'
		},
		{
			question: 'How does word splitting work for camelCase and snake_case?',
			answer: 'The converter splits on whitespace, punctuation, underscores, hyphens, and camelCase boundaries (detected via regex). This means "myVar_name" and "MyVarName" both produce the same word tokens before rejoining in the target format.'
		},
		{
			question: 'What is the difference between Title Case and Capitalize Each Word?',
			answer: 'Title Case follows editorial conventions: minor words (a, an, and, the, of, etc.) stay lowercase unless they are the first or last word. Capitalize Each Word uppercases the first letter of every word without exception.'
		}
	];
</script>

<DevToolShell
	slug="case"
	title="Text Case Converter"
	tagline="Convert text between camelCase, snake_case, CONSTANT_CASE, Title Case, and 13 more formats instantly."
	description="Free online text case converter. Paste any text and get camelCase, PascalCase, snake_case, kebab-case, Title Case, and more. 100% client-side."
	{faqs}
>
	<div class="space-y-5">
		<!-- Input -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="case-input" class="text-sm font-medium text-text">Input</label>
				{#if input}
					<button
						type="button"
						onclick={() => (input = '')}
						class="text-xs font-medium text-text-muted hover:text-accent"
					>Clear</button>
				{/if}
			</div>
			<textarea
				id="case-input"
				bind:value={input}
				spellcheck="false"
				placeholder="Type or paste text here..."
				class="h-28 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
			<p class="text-xs text-text-muted">
				{charCount.toLocaleString()} character{charCount !== 1 ? 's' : ''}
				&middot;
				{wordCount.toLocaleString()} word{wordCount !== 1 ? 's' : ''}
			</p>
		</div>

		<!-- Results grid -->
		<div class="grid gap-3 sm:grid-cols-2">
			{#each caseDefs as def}
				{@const output = input ? convertCase(input, def.id) : ''}
				<div class="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface p-4">
					<div class="min-w-0 flex-1 space-y-1">
						<p class="font-mono text-xs text-text-muted">{def.name}</p>
						{#if output}
							<p class="break-words text-sm text-text">{output}</p>
						{:else}
							<p class="text-sm text-text-muted/50 italic">{def.example}</p>
						{/if}
					</div>
					<CopyButton text={() => output} small disabled={!input} />
				</div>
			{/each}
		</div>
	</div>
</DevToolShell>
