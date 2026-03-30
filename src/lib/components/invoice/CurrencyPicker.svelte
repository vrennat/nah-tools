<script lang="ts">
	import { CURRENCIES } from '$invoice/currency';

	let { value = $bindable('USD') } = $props();
	let open = $state(false);
	let search = $state('');

	const filtered = $derived(
		search
			? CURRENCIES.filter(
					(c) =>
						c.code.toLowerCase().includes(search.toLowerCase()) ||
						c.name.toLowerCase().includes(search.toLowerCase())
				)
			: CURRENCIES
	);

	function select(code: string) {
		value = code;
		open = false;
		search = '';
	}
</script>

<div class="relative">
	<button
		type="button"
		onclick={() => { open = !open; }}
		class="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm transition-colors hover:border-accent/50"
	>
		<span class="font-medium">{value}</span>
		<svg class="h-3.5 w-3.5 text-text-muted" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="fixed inset-0 z-40" onclick={() => { open = false; }} role="presentation"></div>
		<div class="absolute right-0 z-50 mt-1 w-64 rounded-lg border border-border bg-surface shadow-lg">
			<div class="p-2">
				<input
					type="text"
					bind:value={search}
					placeholder="Search currencies..."
					class="w-full rounded-md border border-border bg-surface-alt px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>
			<div class="max-h-60 overflow-y-auto px-1 pb-1">
				{#each filtered as currency}
					<button
						type="button"
						onclick={() => select(currency.code)}
						class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-surface-alt {value === currency.code ? 'bg-accent/10 text-accent' : 'text-text'}"
					>
						<span class="w-10 font-mono font-medium">{currency.code}</span>
						<span class="text-text-muted">{currency.symbol}</span>
						<span class="truncate text-text-muted">{currency.name}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
