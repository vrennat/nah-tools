<script lang="ts">
	import type { TaxConfig, TaxMode } from '$invoice/types';
	import { createId } from '$invoice/types';

	let { config = $bindable<TaxConfig>() } = $props();

	const modes: { value: TaxMode; label: string }[] = [
		{ value: 'none', label: 'No Tax' },
		{ value: 'single', label: 'Single Rate' },
		{ value: 'multi', label: 'Multiple Rates' },
		{ value: 'compound', label: 'Compound' }
	];

	function addTaxLine() {
		config.taxLines = [...config.taxLines, { id: createId(), name: 'Tax', rate: 0, isCompound: false }];
	}

	function removeTaxLine(idx: number) {
		config.taxLines = config.taxLines.filter((_: any, i: number) => i !== idx);
	}
</script>

<div class="space-y-4">
	<!-- Tax mode -->
	<div>
		<label class="mb-2 block text-xs font-medium text-text-muted">Tax Mode</label>
		<div class="flex flex-wrap gap-1 rounded-lg bg-surface-alt p-1">
			{#each modes as mode}
				<button
					type="button"
					onclick={() => { config.mode = mode.value; }}
					class="rounded-md px-3 py-1.5 text-xs font-medium transition-colors {config.mode === mode.value ? 'bg-surface text-text shadow-sm' : 'text-text-muted hover:text-text'}"
				>
					{mode.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Tax lines -->
	{#if config.mode !== 'none'}
		<div class="space-y-2">
			{#each config.taxLines as line, idx (line.id)}
				<div class="flex items-center gap-2">
					<input
						type="text"
						bind:value={config.taxLines[idx].name}
						placeholder="Tax name"
						class="flex-1 rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<div class="flex items-center gap-1">
						<input
							type="number"
							bind:value={config.taxLines[idx].rate}
							min="0"
							step="any"
							class="w-20 rounded-md border border-border bg-surface px-2 py-1.5 text-right text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
						<span class="text-sm text-text-muted">%</span>
					</div>
					{#if config.mode === 'compound' && idx > 0}
						<label class="flex items-center gap-1.5 text-xs text-text-muted">
							<input
								type="checkbox"
								bind:checked={config.taxLines[idx].isCompound}
								class="rounded border-border accent-accent"
							/>
							Compound
						</label>
					{/if}
					{#if config.taxLines.length > 1}
						<button
							type="button"
							onclick={() => removeTaxLine(idx)}
							class="rounded p-1 text-text-muted hover:text-error"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>
			{/each}

			{#if config.mode === 'multi' || config.mode === 'compound'}
				<button
					type="button"
					onclick={addTaxLine}
					class="text-xs font-medium text-accent hover:text-accent-hover"
				>
					+ Add tax line
				</button>
			{/if}
		</div>

		<!-- Toggles -->
		<div class="flex flex-wrap gap-4">
			<label class="flex items-center gap-2 text-sm text-text">
				<input
					type="checkbox"
					bind:checked={config.pricesIncludeTax}
					class="rounded border-border accent-accent"
				/>
				Prices include tax
			</label>
			<label class="flex items-center gap-2 text-sm text-text">
				<input
					type="checkbox"
					bind:checked={config.reverseCharge}
					class="rounded border-border accent-accent"
				/>
				VAT Reverse Charge
			</label>
		</div>
	{/if}
</div>
