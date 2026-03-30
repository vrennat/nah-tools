<script lang="ts">
	import type { PaymentInfo, DiscountType } from '$invoice/types';

	let {
		notes = $bindable(''),
		terms = $bindable(''),
		paymentInfo = $bindable<PaymentInfo>(),
		discountType = $bindable<DiscountType>('percentage'),
		discountValue = $bindable(0),
		currency
	}: {
		notes: string;
		terms: string;
		paymentInfo: PaymentInfo;
		discountType: DiscountType;
		discountValue: number;
		currency: string;
	} = $props();

	let showPayment = $state(false);
</script>

<div class="space-y-4">
	<!-- Document-level discount -->
	<div>
		<label for="invoice-discount" class="mb-1 block text-xs font-medium text-text-muted">Document Discount</label>
		<div class="flex items-center gap-2">
			<input
				id="invoice-discount"
				type="number"
				bind:value={discountValue}
				min="0"
				step="any"
				class="w-24 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="0"
			/>
			<select
				bind:value={discountType}
				class="rounded-lg border border-border bg-surface px-2 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			>
				<option value="percentage">%</option>
				<option value="fixed">{currency}</option>
			</select>
		</div>
	</div>

	<!-- Notes -->
	<div>
		<label for="invoice-notes" class="mb-1 block text-xs font-medium text-text-muted">Notes</label>
		<textarea
			id="invoice-notes"
			bind:value={notes}
			rows="2"
			placeholder="Thank you for your business!"
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</div>

	<!-- Terms -->
	<div>
		<label for="invoice-terms" class="mb-1 block text-xs font-medium text-text-muted">Terms & Conditions</label>
		<textarea
			id="invoice-terms"
			bind:value={terms}
			rows="2"
			placeholder="Payment due within 30 days..."
			class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
		></textarea>
	</div>

	<!-- Payment Info -->
	<div>
		<button
			type="button"
			onclick={() => { showPayment = !showPayment; }}
			class="flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text"
		>
			<svg class="h-3.5 w-3.5 transition-transform {showPayment ? 'rotate-90' : ''}" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
			Payment Information
		</button>

		{#if showPayment}
			<div class="mt-3 grid gap-3 sm:grid-cols-2">
				<div>
					<label for="bank-name" class="mb-1 block text-xs font-medium text-text-muted">Bank Name</label>
					<input id="bank-name" type="text" bind:value={paymentInfo.bankName}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="acct-name" class="mb-1 block text-xs font-medium text-text-muted">Account Name</label>
					<input id="acct-name" type="text" bind:value={paymentInfo.accountName}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="acct-num" class="mb-1 block text-xs font-medium text-text-muted">Account #</label>
					<input id="acct-num" type="text" bind:value={paymentInfo.accountNumber}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="routing" class="mb-1 block text-xs font-medium text-text-muted">Routing # / Sort Code</label>
					<input id="routing" type="text" bind:value={paymentInfo.routingNumber}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="iban" class="mb-1 block text-xs font-medium text-text-muted">IBAN</label>
					<input id="iban" type="text" bind:value={paymentInfo.iban}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="swift" class="mb-1 block text-xs font-medium text-text-muted">SWIFT / BIC</label>
					<input id="swift" type="text" bind:value={paymentInfo.swift}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div>
					<label for="paypal" class="mb-1 block text-xs font-medium text-text-muted">PayPal Email</label>
					<input id="paypal" type="email" bind:value={paymentInfo.paypalEmail}
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
				</div>
				<div class="sm:col-span-2">
					<label for="custom-pay" class="mb-1 block text-xs font-medium text-text-muted">Custom Instructions</label>
					<textarea id="custom-pay" bind:value={paymentInfo.customInstructions} rows="2"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						placeholder="Additional payment instructions..."></textarea>
				</div>
			</div>
		{/if}
	</div>
</div>
