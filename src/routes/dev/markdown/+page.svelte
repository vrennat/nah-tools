<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { renderMarkdown } from '$dev/markdown';

	const SAMPLE = `# Welcome to Markdown

**Bold text** and *italic text* are supported, as is ~~strikethrough~~.

## Lists

- First item
- Second item
- Third item

1. Ordered first
2. Ordered second

## Code

Inline \`code\` renders with a monospace background.

\`\`\`js
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('world'));
\`\`\`

## Blockquote

> The best tools get out of your way.

## Link

Check out [nah.tools](https://nah.tools) for free browser tools.
`;

	let input = $state('');
	let viewMode = $state<'preview' | 'html'>('preview');

	const rendered = $derived(renderMarkdown(input));

	const wordCount = $derived.by(() => {
		const trimmed = input.trim();
		if (!trimmed) return 0;
		return trimmed.split(/\s+/).length;
	});

	const charCount = $derived(input.length);

	function loadSample() {
		input = SAMPLE;
	}

	const faqs = [
		{
			question: 'Is my content sent to a server?',
			answer:
				'No. Rendering happens entirely in your browser. Nothing you type is uploaded or processed remotely.'
		},
		{
			question: 'Does the renderer execute HTML in my input?',
			answer:
				'No. The renderer escapes all HTML in your source before processing, so pasting content with HTML tags will display them as literal text rather than executing them.'
		},
		{
			question: 'What Markdown features are supported?',
			answer:
				'Headings (h1–h6), bold, italic, strikethrough, inline code, fenced code blocks, blockquotes, ordered and unordered lists, links, images, and horizontal rules.'
		}
	];
</script>

<DevToolShell
	slug="markdown"
	title="Markdown Editor & Preview"
	tagline="Write Markdown and see a live preview side by side — no account, no upload."
	description="Free online Markdown editor with instant live preview and raw HTML output. Supports headings, lists, code blocks, links, and more. 100% client-side."
	{faqs}
>
	<!-- Toolbar -->
	<div class="flex flex-wrap items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<button
				type="button"
				onclick={loadSample}
				class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
			>
				Load sample
			</button>
			<button
				type="button"
				onclick={() => (input = '')}
				class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
			>
				Clear
			</button>
		</div>
		{#if input}
			<span class="text-xs text-text-muted">{wordCount} words · {charCount} chars</span>
		{/if}
	</div>

	<!-- Split layout -->
	<div class="grid gap-4 lg:grid-cols-2">
		<!-- Editor -->
		<div class="space-y-2">
			<span class="text-sm font-medium text-text">Markdown</span>
			<textarea
				bind:value={input}
				spellcheck="false"
				placeholder="# Start writing Markdown..."
				class="h-[32rem] w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
		</div>

		<!-- Preview / HTML -->
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<div class="inline-flex rounded-lg border border-border p-0.5 text-sm">
					{#each ['preview', 'html'] as const as mode}
						<button
							type="button"
							onclick={() => (viewMode = mode)}
							class="rounded-md px-3 py-1 capitalize transition-colors {viewMode === mode
								? 'bg-accent text-white'
								: 'text-text-muted hover:text-accent'}"
						>
							{mode === 'html' ? 'HTML' : 'Preview'}
						</button>
					{/each}
				</div>
				{#if viewMode === 'html' && rendered}
					<CopyButton text={() => rendered} small />
				{/if}
			</div>

			{#if viewMode === 'preview'}
				<div
					class="md-preview h-[32rem] overflow-y-auto rounded-lg border border-border bg-surface px-4 py-3 text-sm"
				>
					{#if input}
						{@html rendered}
					{:else}
						<p class="text-text-muted">Preview appears here.</p>
					{/if}
				</div>
			{:else}
				<div class="relative h-[32rem] overflow-auto rounded-lg border border-border bg-surface">
					{#if rendered}
						<pre
							class="p-3 font-mono text-xs text-text whitespace-pre-wrap break-words">{rendered}</pre>
					{:else}
						<p class="p-3 text-sm text-text-muted">HTML output appears here.</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</DevToolShell>

<style>
	:global(.md-preview h1) {
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 800;
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		color: var(--color-text);
	}
	:global(.md-preview h2) {
		font-family: var(--font-display);
		font-size: 1.375rem;
		font-weight: 700;
		margin-top: 1.25rem;
		margin-bottom: 0.4rem;
		color: var(--color-text);
	}
	:global(.md-preview h3) {
		font-family: var(--font-display);
		font-size: 1.125rem;
		font-weight: 700;
		margin-top: 1rem;
		margin-bottom: 0.35rem;
		color: var(--color-text);
	}
	:global(.md-preview h4),
	:global(.md-preview h5),
	:global(.md-preview h6) {
		font-family: var(--font-display);
		font-size: 1rem;
		font-weight: 600;
		margin-top: 0.75rem;
		margin-bottom: 0.25rem;
		color: var(--color-text);
	}
	:global(.md-preview p) {
		line-height: 1.625;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		color: var(--color-text);
	}
	:global(.md-preview ul) {
		list-style-type: disc;
		padding-left: 1.25rem;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
	:global(.md-preview ol) {
		list-style-type: decimal;
		padding-left: 1.25rem;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
	:global(.md-preview li) {
		margin-top: 0.25rem;
		margin-bottom: 0.25rem;
		color: var(--color-text);
	}
	:global(.md-preview a) {
		color: var(--color-accent);
		text-decoration: underline;
	}
	:global(.md-preview code) {
		font-family: var(--font-mono);
		background-color: var(--color-surface-alt);
		border-radius: 0.25rem;
		padding: 0.1em 0.35em;
		font-size: 0.875em;
	}
	:global(.md-preview pre) {
		background-color: var(--color-surface-alt);
		border-radius: 0.5rem;
		padding: 0.75rem;
		overflow-x: auto;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
	:global(.md-preview pre code) {
		background-color: transparent;
		padding: 0;
		font-size: 0.85em;
	}
	:global(.md-preview blockquote) {
		border-left: 4px solid var(--color-border);
		padding-left: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}
	:global(.md-preview hr) {
		border-color: var(--color-border);
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	:global(.md-preview img) {
		max-width: 100%;
		border-radius: 0.5rem;
	}
</style>
