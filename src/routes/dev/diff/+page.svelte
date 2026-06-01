<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import { diffLines } from '$dev/diff';

	let original = $state('');
	let changed = $state('');
	let ignoreWhitespace = $state(false);
	let ignoreCase = $state(false);

	const result = $derived.by(() => {
		if (!original && !changed) return null;
		return diffLines(original, changed, { ignoreWhitespace, ignoreCase });
	});

	const faqs = [
		{
			question: 'Is my text sent to a server?',
			answer:
				'No. The diff runs entirely in your browser using a longest-common-subsequence algorithm. Nothing you paste is uploaded anywhere.'
		},
		{
			question: 'What does "Ignore whitespace" do?',
			answer:
				'When enabled, leading/trailing whitespace is trimmed and runs of whitespace are collapsed to a single space before comparison. Lines that differ only in whitespace will be treated as equal.'
		},
		{
			question: 'How does the line number display work?',
			answer:
				'Left numbers track lines in the original text; right numbers track lines in the changed text. Removed lines show only a left number; added lines show only a right number; equal lines show both.'
		}
	];
</script>

<DevToolShell
	slug="diff"
	title="Text Diff Checker"
	tagline="Paste two texts and see exactly what changed — line by line, instantly."
	description="Free online text diff tool. Compare two texts line-by-line with added/removed highlighting, line numbers, and whitespace/case options. 100% client-side."
	{faqs}
>
	<!-- Options -->
	<div class="flex flex-wrap gap-4">
		<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
			<input
				type="checkbox"
				bind:checked={ignoreWhitespace}
				class="h-4 w-4 rounded border-border accent-accent"
			/>
			Ignore whitespace
		</label>
		<label class="flex cursor-pointer items-center gap-2 text-sm text-text-muted">
			<input
				type="checkbox"
				bind:checked={ignoreCase}
				class="h-4 w-4 rounded border-border accent-accent"
			/>
			Ignore case
		</label>
	</div>

	<!-- Inputs -->
	<div class="grid gap-4 lg:grid-cols-2">
		<div class="space-y-2">
			<label for="diff-original" class="text-sm font-medium text-text">Original</label>
			<textarea
				id="diff-original"
				bind:value={original}
				spellcheck="false"
				placeholder="Paste original text here..."
				class="h-48 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
		</div>
		<div class="space-y-2">
			<label for="diff-changed" class="text-sm font-medium text-text">Changed</label>
			<textarea
				id="diff-changed"
				bind:value={changed}
				spellcheck="false"
				placeholder="Paste changed text here..."
				class="h-48 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			></textarea>
		</div>
	</div>

	<!-- Output -->
	{#if result === null}
		<p class="text-sm text-text-muted">Paste text in both fields to see the diff.</p>
	{:else}
		<!-- Stats -->
		<div class="flex flex-wrap gap-3 text-sm font-medium">
			<span class="text-success">+{result.added} added</span>
			<span class="text-error">-{result.removed} removed</span>
			<span class="text-text-muted">{result.unchanged} unchanged</span>
		</div>

		<!-- Diff view -->
		<div class="overflow-x-auto rounded-lg border border-border bg-surface font-mono text-sm">
			<table class="w-full border-collapse">
				<tbody>
					{#each result.rows as row}
						{@const isAdd = row.op === 'add'}
						{@const isRemove = row.op === 'remove'}
						<tr
							class={isAdd
								? 'bg-success/10'
								: isRemove
									? 'bg-error/10'
									: ''}
						>
							<!-- Left line number -->
							<td
								class="w-8 select-none border-r border-border py-0.5 pr-2 text-right text-xs text-text-muted"
								>{row.leftNo ?? ''}</td
							>
							<!-- Right line number -->
							<td
								class="w-8 select-none border-r border-border py-0.5 pr-2 text-right text-xs text-text-muted"
								>{row.rightNo ?? ''}</td
							>
							<!-- Gutter symbol -->
							<td
								class="w-5 select-none py-0.5 pl-2 pr-1 font-bold {isAdd
									? 'text-success'
									: isRemove
										? 'text-error'
										: 'text-transparent'}"
							>
								{isAdd ? '+' : isRemove ? '-' : ' '}
							</td>
							<!-- Line text -->
							<td
								class="py-0.5 pl-1 pr-4 {isAdd
									? 'text-success'
									: isRemove
										? 'text-error'
										: 'text-text'} whitespace-pre-wrap break-all"
							>
								{row.text}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</DevToolShell>
