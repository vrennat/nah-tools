<script lang="ts">
	import DevToolShell from '$components/dev/DevToolShell.svelte';
	import CopyButton from '$components/dev/CopyButton.svelte';
	import { generateLorem, type LoremUnit } from '$lib/dev/lorem';

	let count = $state(3);
	let unit = $state<LoremUnit>('paragraphs');
	let startWithLorem = $state(true);
	let seed = $state(1);

	const output = $derived(generateLorem(count, unit, startWithLorem, seed));

	const paragraphs = $derived(unit === 'paragraphs' ? output.split('\n\n') : null);

	const wordCount = $derived(output.split(/\s+/).filter(Boolean).length);
	const charCount = $derived(output.length);

	const units: { value: LoremUnit; label: string }[] = [
		{ value: 'paragraphs', label: 'Paragraphs' },
		{ value: 'sentences', label: 'Sentences' },
		{ value: 'words', label: 'Words' }
	];

	const faqs = [
		{
			question: 'Is anything sent to a server?',
			answer:
				'No. All text is generated in your browser using a seeded pseudo-random algorithm. Nothing leaves your machine.'
		},
		{
			question: 'Why does the output change when I click Regenerate?',
			answer:
				'Each click increments an internal seed value, producing a different but still deterministic sequence of words. The same seed always produces the same output.'
		},
		{
			question: 'What is lorem ipsum used for?',
			answer:
				'Lorem ipsum is placeholder text used in design and publishing to fill space before real copy is written. It approximates the appearance of natural language without distracting readers with meaningful content.'
		}
	];
</script>

<DevToolShell
	slug="lorem"
	title="Lorem Ipsum Generator"
	tagline="Generate placeholder text by paragraph, sentence, or word — instantly, in your browser."
	description="Free lorem ipsum generator. Choose paragraphs, sentences, or words, set a count, and copy the result. Deterministic output with a randomize option. 100% client-side."
	{faqs}
>
	<div class="space-y-6">
		<!-- Controls -->
		<div class="flex flex-wrap items-end gap-4">
			<!-- Count -->
			<div class="space-y-1.5">
				<label for="lorem-count" class="block text-sm font-medium text-text">Count</label>
				<input
					id="lorem-count"
					type="number"
					bind:value={count}
					min="1"
					max="100"
					class="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>

			<!-- Unit toggle -->
			<div class="space-y-1.5">
				<p class="text-sm font-medium text-text">Unit</p>
				<div class="inline-flex rounded-lg border border-border p-0.5">
					{#each units as u}
						<button
							type="button"
							onclick={() => (unit = u.value)}
							class="rounded-md px-3 py-1 text-sm transition-colors {unit === u.value
								? 'bg-accent text-white'
								: 'text-text-muted hover:text-accent'}"
						>
							{u.label}
						</button>
					{/each}
				</div>
			</div>

			<!-- Start with lorem -->
			<label class="flex cursor-pointer items-center gap-2 pb-2 text-sm text-text">
				<input
					type="checkbox"
					bind:checked={startWithLorem}
					class="h-4 w-4 rounded border-border accent-accent"
				/>
				Start with "Lorem ipsum..."
			</label>

			<!-- Regenerate -->
			<button
				type="button"
				onclick={() => seed++}
				class="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 hover:text-accent"
			>
				Regenerate
			</button>
		</div>

		<!-- Output -->
		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<p class="text-xs text-text-muted">
					{wordCount.toLocaleString()} words &middot; {charCount.toLocaleString()} characters
				</p>
				<CopyButton text={() => output} small />
			</div>

			<div class="rounded-xl border border-border bg-surface-alt p-5">
				{#if paragraphs}
					{#each paragraphs as para}
						<p class="mb-4 text-sm leading-relaxed text-text last:mb-0">{para}</p>
					{/each}
				{:else}
					<p class="text-sm leading-relaxed text-text">{output}</p>
				{/if}
			</div>
		</div>
	</div>
</DevToolShell>
