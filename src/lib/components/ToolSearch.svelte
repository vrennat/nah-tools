<script lang="ts">
	import { goto } from '$app/navigation';
	import { searchTools, popularTools } from '$lib/search/index';
	import { allFamilies } from '$lib/registry/index';
	import { debounce } from '$utils/debounce';
	import type { ToolEntry } from '$lib/registry/types';

	const RESULT_LIMIT = 8;

	let inputEl: HTMLInputElement | undefined = $state(undefined);
	let query = $state('');
	let results: ToolEntry[] = $state([]);
	let isOpen = $state(false);
	let activeIndex = $state(-1);
	let listboxId = 'tool-search-listbox';

	const popular = popularTools().slice(0, 5);

	function familyLabel(entry: ToolEntry): string {
		return allFamilies.find((f) => f.id === entry.family)?.name ?? entry.family;
	}

	// Debounced search — update results after user stops typing for 120ms.
	// Small delay keeps the UI snappy while avoiding a search on every keystroke.
	// Cast to satisfy debounce's generic constraint; the function only receives strings.
	const runSearch = debounce(((q: string) => {
		results = searchTools(q, RESULT_LIMIT);
		isOpen = q.trim().length > 0;
		activeIndex = -1;
	}) as (...args: unknown[]) => unknown, 120);

	function handleInput() {
		runSearch(query);
	}

	function close() {
		isOpen = false;
		activeIndex = -1;
	}

	function navigate(path: string) {
		close();
		query = '';
		results = [];
		goto(path);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!isOpen) return;

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				activeIndex = Math.min(activeIndex + 1, results.length - 1);
				break;
			case 'ArrowUp':
				e.preventDefault();
				activeIndex = Math.max(activeIndex - 1, -1);
				break;
			case 'Enter':
				e.preventDefault();
				if (activeIndex >= 0 && results[activeIndex]) {
					navigate(results[activeIndex].path);
				}
				break;
			case 'Escape':
				e.preventDefault();
				close();
				break;
		}
	}

	function handleBlur(e: FocusEvent) {
		// Close unless focus moved into the results list
		const related = e.relatedTarget as HTMLElement | null;
		if (!related?.closest('[data-tool-search-dropdown]')) {
			close();
		}
	}
</script>

<div class="relative w-full" role="search">
	<!-- Search input with ARIA combobox semantics -->
	<div class="relative">
		<svg
			class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
		</svg>

		<input
			bind:this={inputEl}
			bind:value={query}
			oninput={handleInput}
			onkeydown={handleKeydown}
			onblur={handleBlur}
			type="search"
			placeholder="Search 100+ free tools..."
			class="w-full rounded-xl border border-border bg-surface-alt py-3.5 pl-12 pr-4 text-base text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors duration-150"
			autocomplete="off"
			spellcheck={false}
			role="combobox"
			aria-expanded={isOpen}
			aria-controls={listboxId}
			aria-autocomplete="list"
			aria-activedescendant={activeIndex >= 0 ? `tool-result-${activeIndex}` : undefined}
		/>

		{#if query.length > 0}
			<button
				class="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text transition-colors"
				onclick={() => { query = ''; results = []; isOpen = false; inputEl?.focus(); }}
				aria-label="Clear search"
				tabindex="-1"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		{/if}
	</div>

	<!-- Results dropdown -->
	{#if isOpen && results.length > 0}
		<div
			data-tool-search-dropdown
			id={listboxId}
			role="listbox"
			aria-label="Tool search results"
			class="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-surface shadow-lg overflow-hidden"
		>
			{#each results as result, i}
				<a
					id="tool-result-{i}"
					href={result.path}
					role="option"
					aria-selected={i === activeIndex}
					class="flex items-start gap-3 px-4 py-3 transition-colors duration-100 hover:bg-surface-alt {i === activeIndex ? 'bg-surface-alt' : ''}"
					onclick={(e) => { e.preventDefault(); navigate(result.path); }}
					onmouseenter={() => { activeIndex = i; }}
				>
					<div class="min-w-0 flex-1">
						<div class="flex items-center gap-2">
							<span class="text-sm font-medium text-text truncate">{result.name}</span>
							<span class="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] text-text-muted border border-border">
								{familyLabel(result)}
							</span>
						</div>
						<p class="mt-0.5 text-xs text-text-muted truncate">{result.description}</p>
					</div>
				</a>
			{/each}
		</div>
	{/if}

	{#if isOpen && query.trim().length > 0 && results.length === 0}
		<div
			data-tool-search-dropdown
			class="absolute left-0 right-0 top-full z-50 mt-2 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg"
		>
			<p class="text-sm text-text-muted">No tools found for "{query}".</p>
		</div>
	{/if}

	<!-- Popular tools chips — shown when there's no active query -->
	{#if popular.length > 0}
		<div class="mt-3 flex flex-wrap gap-2" aria-label="Popular tools">
			{#each popular as tool}
				<a
					href={tool.path}
					class="rounded-full border border-border bg-surface-alt px-3 py-1 text-xs font-medium text-text-muted transition-colors duration-150 hover:border-accent/50 hover:text-accent"
				>
					{tool.name}
				</a>
			{/each}
		</div>
	{/if}
</div>
