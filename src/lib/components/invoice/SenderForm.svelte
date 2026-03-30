<script lang="ts">
	import type { ContactInfo, PaymentInfo, SenderProfile } from '$invoice/types';
	import { createEmptySenderProfile, createId } from '$invoice/types';
	import { listProfiles, saveProfile, deleteProfile } from '$invoice/storage';

	let {
		sender = $bindable<ContactInfo>(),
		logoDataUrl = $bindable(''),
		paymentInfo = $bindable<PaymentInfo>()
	} = $props();

	let profiles = $state<SenderProfile[]>([]);
	let showProfiles = $state(false);
	let saveName = $state('');
	let showSaveInput = $state(false);

	$effect(() => {
		loadProfiles();
	});

	async function loadProfiles() {
		profiles = await listProfiles();
	}

	function handleLogoUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) return; // Skip files over 5 MB

		const reader = new FileReader();
		reader.onload = () => {
			// Downscale if needed
			const img = new Image();
			img.onload = () => {
				const maxW = 400;
				const maxH = 200;
				let w = img.width;
				let h = img.height;
				if (w > maxW || h > maxH) {
					const ratio = Math.min(maxW / w, maxH / h);
					w = Math.round(w * ratio);
					h = Math.round(h * ratio);
				}
				const canvas = document.createElement('canvas');
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(img, 0, 0, w, h);
				logoDataUrl = canvas.toDataURL('image/png');
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function removeLogo() {
		logoDataUrl = '';
	}

	async function handleSaveProfile() {
		if (!saveName.trim()) return;
		const profile: SenderProfile = {
			id: createId(),
			name: saveName.trim(),
			sender: { ...sender },
			logoDataUrl,
			paymentInfo: { ...paymentInfo },
			defaultCurrency: 'USD',
			defaultTaxConfig: { mode: 'none', taxLines: [], pricesIncludeTax: false, reverseCharge: false }
		};
		await saveProfile(profile);
		saveName = '';
		showSaveInput = false;
		await loadProfiles();
	}

	function loadProfile(profile: SenderProfile) {
		sender = { ...profile.sender };
		logoDataUrl = profile.logoDataUrl;
		paymentInfo = { ...profile.paymentInfo };
		showProfiles = false;
	}

	async function handleDeleteProfile(id: string) {
		await deleteProfile(id);
		await loadProfiles();
	}
</script>

<div class="space-y-4">
	<!-- Profile management -->
	<div class="flex flex-wrap gap-2">
		{#if profiles.length > 0}
			<div class="relative">
				<button
					type="button"
					onclick={() => { showProfiles = !showProfiles; }}
					class="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
				>
					Load Profile
				</button>
				{#if showProfiles}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="fixed inset-0 z-40" onclick={() => { showProfiles = false; }} role="presentation"></div>
					<div class="absolute left-0 z-50 mt-1 w-56 rounded-lg border border-border bg-surface shadow-lg">
						{#each profiles as profile}
							<div class="flex items-center justify-between px-3 py-2 hover:bg-surface-alt">
								<button
									type="button"
									class="flex-1 text-left text-sm"
									onclick={() => loadProfile(profile)}
								>
									{profile.name}
								</button>
								<button
									type="button"
									class="ml-2 text-xs text-text-muted hover:text-error"
									onclick={() => handleDeleteProfile(profile.id)}
								>
									&times;
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		{#if showSaveInput}
			<div class="flex gap-1">
				<input
					type="text"
					bind:value={saveName}
					placeholder="Profile name..."
					class="rounded-md border border-border bg-surface px-2 py-1 text-xs focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					onkeydown={(e) => { if (e.key === 'Enter') handleSaveProfile(); }}
				/>
				<button
					type="button"
					onclick={handleSaveProfile}
					class="rounded-md bg-accent px-2 py-1 text-xs font-medium text-white hover:bg-accent-hover"
				>
					Save
				</button>
				<button
					type="button"
					onclick={() => { showSaveInput = false; }}
					class="rounded-md px-2 py-1 text-xs text-text-muted hover:text-text"
				>
					Cancel
				</button>
			</div>
		{:else}
			<button
				type="button"
				onclick={() => { showSaveInput = true; }}
				class="rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
			>
				Save as Profile
			</button>
		{/if}
	</div>

	<!-- Logo -->
	<div>
		<span class="mb-1 block text-xs font-medium text-text-muted">Logo</span>
		{#if logoDataUrl}
			<div class="flex items-center gap-3">
				<img src={logoDataUrl} alt="Logo" class="h-12 rounded border border-border object-contain" />
				<button
					type="button"
					onclick={removeLogo}
					class="text-xs text-text-muted hover:text-error"
				>
					Remove
				</button>
			</div>
		{:else}
			<input
				type="file"
				accept="image/*"
				onchange={handleLogoUpload}
				class="text-xs text-text-muted file:mr-2 file:rounded-md file:border-0 file:bg-surface-alt file:px-2.5 file:py-1 file:text-xs file:font-medium file:text-text hover:file:bg-accent/10"
			/>
		{/if}
	</div>

	<!-- Contact fields -->
	<div class="grid gap-3 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="sender-name" class="mb-1 block text-xs font-medium text-text-muted">Business / Name</label>
			<input id="sender-name" type="text" autocomplete="organization" bind:value={sender.name}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="Your business name" />
		</div>
		<div>
			<label for="sender-email" class="mb-1 block text-xs font-medium text-text-muted">Email</label>
			<input id="sender-email" type="email" autocomplete="email" bind:value={sender.email}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="you@example.com" />
		</div>
		<div>
			<label for="sender-phone" class="mb-1 block text-xs font-medium text-text-muted">Phone</label>
			<input id="sender-phone" type="tel" autocomplete="tel" bind:value={sender.phone}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="+1 (555) 000-0000" />
		</div>
		<div class="sm:col-span-2">
			<label for="sender-address" class="mb-1 block text-xs font-medium text-text-muted">Address</label>
			<input id="sender-address" type="text" autocomplete="street-address" bind:value={sender.address}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="123 Main St" />
		</div>
		<div>
			<label for="sender-city" class="mb-1 block text-xs font-medium text-text-muted">City</label>
			<input id="sender-city" type="text" autocomplete="address-level2" bind:value={sender.city}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="sender-state" class="mb-1 block text-xs font-medium text-text-muted">State</label>
				<input id="sender-state" type="text" autocomplete="address-level1" bind:value={sender.state}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
			</div>
			<div>
				<label for="sender-zip" class="mb-1 block text-xs font-medium text-text-muted">Postal Code</label>
				<input id="sender-zip" type="text" autocomplete="postal-code" bind:value={sender.postalCode}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
			</div>
		</div>
		<div>
			<label for="sender-country" class="mb-1 block text-xs font-medium text-text-muted">Country</label>
			<input id="sender-country" type="text" autocomplete="country-name" bind:value={sender.country}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div>
			<label for="sender-taxid" class="mb-1 block text-xs font-medium text-text-muted">Tax ID / VAT #</label>
			<input id="sender-taxid" type="text" bind:value={sender.taxId}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="e.g. EIN, VAT number" />
		</div>
		<div class="sm:col-span-2">
			<label for="sender-website" class="mb-1 block text-xs font-medium text-text-muted">Website</label>
			<input id="sender-website" type="url" autocomplete="url" bind:value={sender.website}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="https://yoursite.com" />
		</div>
	</div>
</div>
