<script lang="ts">
	import type { BrokerFilters, SortBy } from '$remove/types';

	let {
		filters = $bindable(),
		sort = $bindable(),
	}: {
		filters: BrokerFilters;
		sort: SortBy;
	} = $props();

	const pillBase = 'rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer';
	const pillActive = 'bg-accent text-white';
	const pillInactive = 'bg-surface-alt text-text-muted hover:text-text';

	function toggleMethod(value: string) {
		filters.method = filters.method === value ? 'all' : value as BrokerFilters['method'];
	}

	function toggleDifficulty(value: string) {
		filters.difficulty = filters.difficulty === value ? 'all' : value as BrokerFilters['difficulty'];
	}

	function togglePriority(value: string) {
		filters.priority = filters.priority === value ? 'all' : value as BrokerFilters['priority'];
	}

	function toggleStatus(value: string) {
		filters.status = filters.status === value ? 'all' : value as BrokerFilters['status'];
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		<span class="text-xs font-medium text-text-muted">Method:</span>
		<button class="{pillBase} {filters.method === 'email' ? pillActive : pillInactive}" aria-pressed={filters.method === 'email'} onclick={() => toggleMethod('email')}>Email</button>
		<button class="{pillBase} {filters.method === 'form' ? pillActive : pillInactive}" aria-pressed={filters.method === 'form'} onclick={() => toggleMethod('form')}>Form</button>

		<span class="ml-2 text-xs font-medium text-text-muted">Difficulty:</span>
		<button class="{pillBase} {filters.difficulty === 'easy' ? pillActive : pillInactive}" aria-pressed={filters.difficulty === 'easy'} onclick={() => toggleDifficulty('easy')}>Easy</button>
		<button class="{pillBase} {filters.difficulty === 'medium' ? pillActive : pillInactive}" aria-pressed={filters.difficulty === 'medium'} onclick={() => toggleDifficulty('medium')}>Medium</button>
		<button class="{pillBase} {filters.difficulty === 'hard' ? pillActive : pillInactive}" aria-pressed={filters.difficulty === 'hard'} onclick={() => toggleDifficulty('hard')}>Hard</button>

		<span class="ml-2 text-xs font-medium text-text-muted">Priority:</span>
		<button class="{pillBase} {filters.priority === 'crucial' ? pillActive : pillInactive}" aria-pressed={filters.priority === 'crucial'} onclick={() => togglePriority('crucial')}>Crucial</button>
		<button class="{pillBase} {filters.priority === 'high' ? pillActive : pillInactive}" aria-pressed={filters.priority === 'high'} onclick={() => togglePriority('high')}>High</button>
	</div>

	<div class="flex flex-wrap items-center gap-2">
		<span class="text-xs font-medium text-text-muted">Status:</span>
		<button class="{pillBase} {filters.status === 'not-started' ? pillActive : pillInactive}" aria-pressed={filters.status === 'not-started'} onclick={() => toggleStatus('not-started')}>Not started</button>
		<button class="{pillBase} {filters.status === 'confirmed' ? pillActive : pillInactive}" aria-pressed={filters.status === 'confirmed'} onclick={() => toggleStatus('confirmed')}>Confirmed</button>
		<button class="{pillBase} {filters.status === 'skipped' ? pillActive : pillInactive}" aria-pressed={filters.status === 'skipped'} onclick={() => toggleStatus('skipped')}>Skipped</button>

		<div class="ml-auto flex items-center gap-2">
			<label for="sort-by" class="text-xs text-text-muted">Sort:</label>
			<select id="sort-by" bind:value={sort} class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent">
				<option value="priority">Priority</option>
				<option value="difficulty">Difficulty</option>
				<option value="name">Name</option>
				<option value="status">Status</option>
			</select>
		</div>
	</div>
</div>
