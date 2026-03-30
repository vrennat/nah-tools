<script lang="ts">
	import type { ContactInfo, SavedClient } from '$invoice/types';
	import { createEmptyClient } from '$invoice/types';
	import { listClients, saveClient, deleteClient } from '$invoice/storage';

	let { client = $bindable<ContactInfo>() } = $props();

	let savedClients = $state<SavedClient[]>([]);
	let showClients = $state(false);

	$effect(() => {
		loadClients();
	});

	async function loadClients() {
		savedClients = await listClients();
	}

	function loadSavedClient(saved: SavedClient) {
		client = { ...saved.client };
		showClients = false;
	}

	async function handleSaveClient() {
		if (!client.name.trim()) return;
		const saved = createEmptyClient();
		saved.client = { ...client };
		await saveClient(saved);
		await loadClients();
	}

	async function handleDeleteClient(id: string) {
		await deleteClient(id);
		await loadClients();
	}
</script>

<div class="space-y-4">
	<!-- Client directory -->
	<div class="flex flex-wrap gap-2">
		{#if savedClients.length > 0}
			<div class="relative">
				<button
					type="button"
					onclick={() => { showClients = !showClients; }}
					class="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
				>
					Load Client
				</button>
				{#if showClients}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="fixed inset-0 z-40" onclick={() => { showClients = false; }}></div>
					<div class="absolute left-0 z-50 mt-1 w-56 rounded-lg border border-border bg-surface shadow-lg">
						{#each savedClients as saved}
							<div class="flex items-center justify-between px-3 py-2 hover:bg-surface-alt">
								<button
									type="button"
									class="flex-1 text-left text-sm"
									onclick={() => loadSavedClient(saved)}
								>
									{saved.client.name || 'Unnamed'}
								</button>
								<button
									type="button"
									class="ml-2 text-xs text-text-muted hover:text-error"
									onclick={() => handleDeleteClient(saved.id)}
								>
									&times;
								</button>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		{#if client.name.trim()}
			<button
				type="button"
				onclick={handleSaveClient}
				class="rounded-md border border-dashed border-border px-2.5 py-1 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
			>
				Save to Directory
			</button>
		{/if}
	</div>

	<!-- Contact fields -->
	<div class="grid gap-3 sm:grid-cols-2">
		<div class="sm:col-span-2">
			<label for="client-name" class="mb-1 block text-xs font-medium text-text-muted">Client Name</label>
			<input id="client-name" type="text" bind:value={client.name}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				placeholder="Client or business name" />
		</div>
		<div>
			<label for="client-email" class="mb-1 block text-xs font-medium text-text-muted">Email</label>
			<input id="client-email" type="email" bind:value={client.email}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div>
			<label for="client-phone" class="mb-1 block text-xs font-medium text-text-muted">Phone</label>
			<input id="client-phone" type="tel" bind:value={client.phone}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div class="sm:col-span-2">
			<label for="client-address" class="mb-1 block text-xs font-medium text-text-muted">Address</label>
			<input id="client-address" type="text" bind:value={client.address}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div>
			<label for="client-city" class="mb-1 block text-xs font-medium text-text-muted">City</label>
			<input id="client-city" type="text" bind:value={client.city}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="client-state" class="mb-1 block text-xs font-medium text-text-muted">State</label>
				<input id="client-state" type="text" bind:value={client.state}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
			</div>
			<div>
				<label for="client-zip" class="mb-1 block text-xs font-medium text-text-muted">Postal Code</label>
				<input id="client-zip" type="text" bind:value={client.postalCode}
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
			</div>
		</div>
		<div>
			<label for="client-country" class="mb-1 block text-xs font-medium text-text-muted">Country</label>
			<input id="client-country" type="text" bind:value={client.country}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
		<div>
			<label for="client-taxid" class="mb-1 block text-xs font-medium text-text-muted">Tax ID / VAT #</label>
			<input id="client-taxid" type="text" bind:value={client.taxId}
				class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
		</div>
	</div>
</div>
