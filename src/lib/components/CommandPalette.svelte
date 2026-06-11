<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { searchTools } from '$lib/search/index';
	import { allFamilies } from '$lib/registry/index';
	import { debounce } from '$utils/debounce';
	import type { ToolEntry } from '$lib/registry/types';

	const RESULT_LIMIT = 10;

	let isOpen = $state(false);
	let query = $state('');
	let results: ToolEntry[] = $state([]);
	let activeIndex = $state(-1);
	let inputEl: HTMLInputElement | undefined = $state(undefined);
	let dialogEl: HTMLDivElement | undefined = $state(undefined);

	function familyLabel(entry: ToolEntry): string {
		return allFamilies.find((f) => f.id === entry.family)?.name ?? entry.family;
	}

	// Cast to satisfy the generic constraint — the function only receives strings.
	const runSearch = debounce(((q: string) => {
		results = searchTools(q, RESULT_LIMIT);
		activeIndex = -1;
	}) as (...args: unknown[]) => unknown, 100);

	function open() {
		isOpen = true;
		// Focus input on next frame after the DOM has rendered
		requestAnimationFrame(() => inputEl?.focus());
	}

	function close() {
		isOpen = false;
		query = '';
		results = [];
		activeIndex = -1;
	}

	function navigate(path: string) {
		close();
		goto(path);
	}

	function handleInput() {
		runSearch(query);
	}

	function handleKeydown(e: KeyboardEvent) {
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

	// Guard all document/window listeners for SSR — only run in the browser.
	onMount(() => {
		function handleGlobalKeydown(e: KeyboardEvent) {
			// Cmd+K / Ctrl+K opens the palette regardless of context.
			// Cmd+K does not insert text in any browser, so intercepting globally is safe.
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault();
				if (isOpen) {
					close();
				} else {
					open();
				}
			}
		}

		document.addEventListener('keydown', handleGlobalKeydown);
		return () => document.removeEventListener('keydown', handleGlobalKeydown);
	});

	// Prevent body scroll while the palette is open
	$effect(() => {
		if (typeof document === 'undefined') return;
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	});
</script>

<!-- Backdrop + modal — only rendered when open -->
{#if isOpen}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
		onclick={(e) => { if (e.target === e.currentTarget) close(); }}
	>
		<!-- Backdrop -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>

		<!-- Palette panel -->
		<div
			bind:this={dialogEl}
			role="dialog"
			aria-modal="true"
			aria-label="Command palette"
			class="relative z-10 w-full max-w-xl rounded-2xl border border-border bg-surface shadow-xl overflow-hidden"
		>
			<!-- Search input -->
			<div class="flex items-center gap-3 border-b border-border px-4 py-3">
				<svg
					class="h-5 w-5 shrink-0 text-text-muted"
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
					type="search"
					placeholder="Search tools..."
					class="flex-1 bg-transparent text-base text-text placeholder:text-text-muted focus:outline-none"
					autocomplete="off"
					spellcheck={false}
					role="combobox"
					aria-expanded={results.length > 0}
					aria-controls="cp-listbox"
					aria-autocomplete="list"
					aria-activedescendant={activeIndex >= 0 ? `cp-result-${activeIndex}` : undefined}
				/>

				<kbd
					class="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-text-muted sm:block"
					aria-label="Press Escape to close"
				>
					esc
				</kbd>
			</div>

			<!-- Results list -->
			{#if results.length > 0}
				<ul
					id="cp-listbox"
					role="listbox"
					aria-label="Search results"
					class="max-h-[min(60vh,400px)] overflow-y-auto py-2"
				>
					{#each results as result, i}
						<li role="none">
							<a
								id="cp-result-{i}"
								href={result.path}
								role="option"
								aria-selected={i === activeIndex}
								class="flex items-start gap-3 px-4 py-2.5 transition-colors duration-100 hover:bg-surface-alt {i === activeIndex ? 'bg-surface-alt' : ''}"
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
						</li>
					{/each}
				</ul>
			{:else if query.trim().length > 0}
				<div class="px-4 py-6 text-center text-sm text-text-muted">
					No tools found for "{query}".
				</div>
			{:else}
				<div class="px-4 py-6 text-center text-sm text-text-muted">
					Type to search 100+ free tools.
				</div>
			{/if}

			<!-- Footer hint -->
			<div class="flex items-center gap-4 border-t border-border px-4 py-2 text-[11px] text-text-muted">
				<span class="flex items-center gap-1">
					<kbd class="rounded border border-border px-1 py-0.5 font-mono">↑↓</kbd> navigate
				</span>
				<span class="flex items-center gap-1">
					<kbd class="rounded border border-border px-1 py-0.5 font-mono">↵</kbd> open
				</span>
				<span class="flex items-center gap-1">
					<kbd class="rounded border border-border px-1 py-0.5 font-mono">esc</kbd> close
				</span>
			</div>
		</div>
	</div>
{/if}
