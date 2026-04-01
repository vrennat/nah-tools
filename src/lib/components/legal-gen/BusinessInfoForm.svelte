<script lang="ts">
	import type { BusinessInfo, EntityType, Jurisdiction } from '$legalgen/types';

	interface Props {
		business: BusinessInfo;
	}

	let { business = $bindable() }: Props = $props();

	const entityTypes: { value: EntityType; label: string }[] = [
		{ value: 'individual', label: 'Individual / Sole Proprietor' },
		{ value: 'llc', label: 'Limited Liability Company (LLC)' },
		{ value: 'corporation', label: 'Corporation' },
		{ value: 'nonprofit', label: 'Nonprofit Organization' },
		{ value: 'other', label: 'Other' }
	];

	const jurisdictions: { value: Jurisdiction; label: string }[] = [
		{ value: 'us-california', label: 'California, USA' },
		{ value: 'us-general', label: 'General USA' },
		{ value: 'eu-gdpr', label: 'European Union (GDPR)' },
		{ value: 'uk', label: 'United Kingdom' },
		{ value: 'canada', label: 'Canada' },
		{ value: 'australia', label: 'Australia' },
		{ value: 'other', label: 'Other' }
	];
</script>

<div class="space-y-6">
	<div>
		<label for="businessName" class="block text-sm font-medium text-text mb-2">
			Business Name
		</label>
		<input
			id="businessName"
			type="text"
			bind:value={business.businessName}
			placeholder="e.g., Acme Corporation"
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="websiteUrl" class="block text-sm font-medium text-text mb-2">
			Website URL
		</label>
		<input
			id="websiteUrl"
			type="url"
			bind:value={business.websiteUrl}
			placeholder="e.g., https://example.com"
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="contactEmail" class="block text-sm font-medium text-text mb-2">
			Contact Email
		</label>
		<input
			id="contactEmail"
			type="email"
			bind:value={business.contactEmail}
			placeholder="e.g., legal@example.com"
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
		/>
	</div>

	<div>
		<label for="contactAddress" class="block text-sm font-medium text-text mb-2">
			Contact Address
		</label>
		<textarea
			id="contactAddress"
			bind:value={business.contactAddress}
			placeholder="123 Main St, City, State 12345"
			rows="2"
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
		></textarea>
	</div>

	<div>
		<label for="entityType" class="block text-sm font-medium text-text mb-2">
			Entity Type
		</label>
		<select
			id="entityType"
			bind:value={business.entityType}
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
		>
			{#each entityTypes as type}
				<option value={type.value}>{type.label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="jurisdiction" class="block text-sm font-medium text-text mb-2">
			Jurisdiction
		</label>
		<select
			id="jurisdiction"
			bind:value={business.jurisdiction}
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
		>
			{#each jurisdictions as jur}
				<option value={jur.value}>{jur.label}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="effectiveDate" class="block text-sm font-medium text-text mb-2">
			Effective Date
		</label>
		<input
			id="effectiveDate"
			type="date"
			bind:value={business.effectiveDate}
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
		/>
	</div>
</div>
