<script lang="ts">
	import type { ThirdPartyConfig, ThirdPartyService } from '$legalgen/types';

	interface Props {
		config: ThirdPartyConfig;
	}

	let { config = $bindable() }: Props = $props();

	let newCustomService: ThirdPartyService = $state({
		name: '',
		purpose: '',
		privacyUrl: ''
	});

	function addCustomService() {
		if (newCustomService.name && newCustomService.purpose && newCustomService.privacyUrl) {
			config.customServices = [...config.customServices, { ...newCustomService }];
			newCustomService = { name: '', purpose: '', privacyUrl: '' };
		}
	}

	function removeCustomService(index: number) {
		config.customServices = config.customServices.filter((_, i) => i !== index);
	}
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-sm font-semibold text-text mb-4">Third-Party Services</h3>
		<div class="space-y-3">
			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.usesGoogleAnalytics}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Google Analytics</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input type="checkbox" bind:checked={config.usesStripe} class="w-4 h-4 rounded border-border cursor-pointer" />
				<span class="text-sm text-text">Stripe</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.usesMailchimp}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Mailchimp</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.usesFacebookPixel}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Facebook Pixel</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.usesCloudflare}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Cloudflare</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input type="checkbox" bind:checked={config.usesAWS} class="w-4 h-4 rounded border-border cursor-pointer" />
				<span class="text-sm text-text">Amazon Web Services (AWS)</span>
			</label>

			<label class="flex items-center gap-3 cursor-pointer">
				<input
					type="checkbox"
					bind:checked={config.usesIntercom}
					class="w-4 h-4 rounded border-border cursor-pointer"
				/>
				<span class="text-sm text-text">Intercom</span>
			</label>
		</div>
	</div>

	<div class="border-t border-border pt-6">
		<h3 class="text-sm font-semibold text-text mb-4">Custom Third-Party Services</h3>

		{#if config.customServices.length > 0}
			<div class="space-y-3 mb-6">
				{#each config.customServices as service, index}
					<div class="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface-alt border border-border">
						<div class="flex-1">
							<div class="font-medium text-sm text-text">{service.name}</div>
							<div class="text-xs text-text-muted mt-1">{service.purpose}</div>
							<a href={service.privacyUrl} target="_blank" rel="noopener noreferrer" class="text-xs text-accent hover:underline">
								Privacy Policy
							</a>
						</div>
						<button
							onclick={() => removeCustomService(index)}
							class="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
						>
							Remove
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<div class="space-y-3 p-4 rounded-lg border border-border bg-surface-alt">
			<div>
				<label for="customServiceName" class="block text-sm font-medium text-text mb-2">
					Service Name
				</label>
				<input
					id="customServiceName"
					type="text"
					bind:value={newCustomService.name}
					placeholder="e.g., SendGrid"
					class="w-full px-3 py-2 border border-border rounded bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent text-sm"
				/>
			</div>

			<div>
				<label for="customServicePurpose" class="block text-sm font-medium text-text mb-2">
					Purpose
				</label>
				<input
					id="customServicePurpose"
					type="text"
					bind:value={newCustomService.purpose}
					placeholder="e.g., Email delivery and tracking"
					class="w-full px-3 py-2 border border-border rounded bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent text-sm"
				/>
			</div>

			<div>
				<label for="customServiceUrl" class="block text-sm font-medium text-text mb-2">
					Privacy Policy URL
				</label>
				<input
					id="customServiceUrl"
					type="url"
					bind:value={newCustomService.privacyUrl}
					placeholder="e.g., https://sendgrid.com/privacy"
					class="w-full px-3 py-2 border border-border rounded bg-surface text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent text-sm"
				/>
			</div>

			<button
				onclick={addCustomService}
				disabled={!newCustomService.name || !newCustomService.purpose || !newCustomService.privacyUrl}
				class="w-full px-4 py-2 bg-accent text-white rounded font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
			>
				Add Service
			</button>
		</div>
	</div>
</div>
