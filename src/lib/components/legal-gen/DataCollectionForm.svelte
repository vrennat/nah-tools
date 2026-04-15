<script lang="ts">
	import type { DataCollectionConfig } from '$legalgen/types';

	interface Props {
		config: DataCollectionConfig;
	}

	let { config = $bindable() }: Props = $props();
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-sm font-semibold text-text mb-4">Data Collection</h3>
		<div class="space-y-3">
			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsPersonalInfo}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Collects personal information</span>
			</label>

			{#if config.collectsPersonalInfo}
				<div class="ml-6 space-y-3 border-l border-border pl-4">
					<label class="flex items-center gap-3 cursor-pointer">
						<input type="checkbox" bind:checked={config.collectsName} class="w-4 h-4 rounded border-border cursor-pointer" />
						<span class="text-sm text-text">Name</span>
					</label>

					<label class="flex items-center gap-3 cursor-pointer">
						<input type="checkbox" bind:checked={config.collectsEmail} class="w-4 h-4 rounded border-border cursor-pointer" />
						<span class="text-sm text-text">Email address</span>
					</label>

					<label class="flex items-center gap-3 cursor-pointer">
						<input type="checkbox" bind:checked={config.collectsPaymentInfo} class="w-4 h-4 rounded border-border cursor-pointer" />
						<span class="text-sm text-text">Payment information</span>
					</label>

					<label class="flex items-center gap-3 cursor-pointer">
						<input type="checkbox" bind:checked={config.collectsLocation} class="w-4 h-4 rounded border-border cursor-pointer" />
						<span class="text-sm text-text">Location data</span>
					</label>
				</div>
			{/if}

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsDeviceInfo}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Device information</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsUsageData}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Usage data</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsCookies}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Cookies</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsAnalytics}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Analytics data</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.collectsChildrenData}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Children's data (under 13)</span>
			</label>
		</div>
	</div>

	<div>
		<label for="dataRetention" class="block text-sm font-medium text-text mb-2">
			Data Retention Period
		</label>
		<input
			id="dataRetention"
			type="text"
			bind:value={config.dataRetentionPeriod}
			placeholder="e.g., 2 years, indefinitely, until account deletion"
			class="w-full px-4 py-2 border border-border rounded-lg bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
		/>
	</div>

	<div>
		<label class="flex items-center gap-3 cursor-pointer">
			<input
				type="checkbox"
				bind:checked={config.allowsDeletion}
				class="w-4 h-4 rounded border-border cursor-pointer"
			/>
			<span class="text-sm font-medium text-text">Users can request data deletion</span>
		</label>
	</div>
</div>
