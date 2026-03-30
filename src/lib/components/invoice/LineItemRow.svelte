<script lang="ts">
	import type { LineItem, DiscountType, LineItemCategory, UnitType } from '$invoice/types';
	import { UNIT_LABELS } from '$invoice/types';
	import { calculateLineItem } from '$invoice/calculations';
	import { formatCurrency } from '$invoice/currency';

	let {
		item = $bindable<LineItem>(),
		currency,
		onremove,
		ondragstart,
		ondragover,
		ondrop
	}: {
		item: LineItem;
		currency: string;
		onremove: () => void;
		ondragstart: (e: DragEvent) => void;
		ondragover: (e: DragEvent) => void;
		ondrop: (e: DragEvent) => void;
	} = $props();

	let showAdvanced = $state(false);
	const result = $derived(calculateLineItem(item));

	const unitTypes: UnitType[] = ['hours', 'days', 'pieces', 'items', 'units', 'pages', 'words', 'kg', 'lbs', 'meters', 'feet', 'custom'];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group rounded-lg border border-border bg-surface p-3 transition-colors hover:border-border"
	draggable="true"
	ondragstart={ondragstart}
	ondragover={ondragover}
	ondrop={ondrop}
>
	<!-- Main row -->
	<div class="flex items-start gap-2">
		<!-- Drag handle -->
		<button type="button" class="mt-2.5 cursor-grab text-text-muted opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
			<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
				<circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/>
				<circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
				<circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
			</svg>
		</button>

		<!-- Description -->
		<div class="min-w-0 flex-1">
			<input
				type="text"
				bind:value={item.description}
				placeholder="Item description"
				class="w-full rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<!-- Qty -->
		<div class="w-16 shrink-0">
			<input
				type="number"
				bind:value={item.quantity}
				min="0"
				step="any"
				class="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-right text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<!-- Unit -->
		<div class="w-20 shrink-0">
			<select
				bind:value={item.unitType}
				class="w-full rounded-md border border-border bg-surface px-1.5 py-1.5 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			>
				{#each unitTypes as ut}
					<option value={ut}>{ut === 'custom' ? 'custom' : UNIT_LABELS[ut]}</option>
				{/each}
			</select>
		</div>

		<!-- Price -->
		<div class="w-24 shrink-0">
			<input
				type="number"
				bind:value={item.unitPrice}
				min="0"
				step="any"
				placeholder="0.00"
				class="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-right text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>

		<!-- Amount -->
		<div class="w-24 shrink-0 py-1.5 text-right text-sm font-medium">
			{formatCurrency(result.amount, currency)}
		</div>

		<!-- Actions -->
		<div class="flex shrink-0 items-center gap-1">
			<button
				type="button"
				onclick={() => { showAdvanced = !showAdvanced; }}
				class="rounded p-1 text-text-muted transition-colors hover:text-accent"
				title="More options"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
				</svg>
			</button>
			<button
				type="button"
				onclick={onremove}
				class="rounded p-1 text-text-muted transition-colors hover:text-error"
				title="Remove item"
			>
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			</button>
		</div>
	</div>

	<!-- Custom unit input -->
	{#if item.unitType === 'custom'}
		<div class="ml-6 mt-2">
			<input
				type="text"
				bind:value={item.customUnit}
				placeholder="Custom unit name"
				class="w-32 rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
		</div>
	{/if}

	<!-- Advanced options -->
	{#if showAdvanced}
		<div class="ml-6 mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
			<!-- Discount -->
			<div>
				<label class="mb-1 block text-xs text-text-muted">Discount</label>
				<div class="flex gap-1">
					<input
						type="number"
						bind:value={item.discountValue}
						min="0"
						step="any"
						class="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<select
						bind:value={item.discountType}
						class="rounded-md border border-border bg-surface px-1 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="percentage">%</option>
						<option value="fixed">{currency}</option>
					</select>
				</div>
			</div>

			<!-- Tax override -->
			<div>
				<label class="mb-1 block text-xs text-text-muted">Tax Rate Override</label>
				<div class="flex items-center gap-2">
					<input
						type="number"
						value={item.taxRateOverride ?? ''}
						min="0"
						step="any"
						placeholder="Default"
						onchange={(e) => {
							const v = (e.target as HTMLInputElement).value;
							item.taxRateOverride = v === '' ? null : parseFloat(v);
						}}
						class="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<span class="text-xs text-text-muted">%</span>
				</div>
			</div>

			<!-- Category -->
			<div>
				<label class="mb-1 block text-xs text-text-muted">Category</label>
				<select
					bind:value={item.category}
					class="w-full rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				>
					<option value="other">General</option>
					<option value="labor">Labor</option>
					<option value="materials">Materials</option>
				</select>
			</div>
		</div>
	{/if}
</div>
