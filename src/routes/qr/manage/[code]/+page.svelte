<svelte:head>
	<title>Manage QR Code — Nah Tools</title>
</svelte:head>

<script lang="ts">
	let { data } = $props();

	let passphrase = $state('');
	let authError = $state('');
	let authLoading = $state(false);
	let authenticated = $state(false);

	let destinationUrl = $state('');
	let scanCount = $state(0);
	let createdAt = $state('');
	let isActive = $state(true);
	let labelText = $state('');

	let newUrl = $state('');
	let updateError = $state('');
	let updateSuccess = $state('');
	let updateLoading = $state(false);

	let deactivateLoading = $state(false);
	let showDeactivateConfirm = $state(false);

	async function handleAuth(e: SubmitEvent) {
		e.preventDefault();
		authError = '';
		authLoading = true;

		try {
			const res = await fetch('/api/dynamic/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ short_code: data.code, passphrase })
			});

			if (res.status === 403) {
				authError = 'Invalid passphrase';
				return;
			}

			if (res.status === 404) {
				authError = 'QR code not found';
				return;
			}

			if (!res.ok) {
				authError = 'Failed to load code details';
				return;
			}

			const info = await res.json() as { destination_url: string; scan_count: number; created_at: string; is_active: number; label: string | null };
			destinationUrl = info.destination_url;
			newUrl = info.destination_url;
			scanCount = info.scan_count;
			createdAt = info.created_at;
			isActive = info.is_active === 1;
			labelText = info.label || '';
			authenticated = true;
		} catch {
			authError = 'Network error. Please try again.';
		} finally {
			authLoading = false;
		}
	}

	async function handleUpdate(e: SubmitEvent) {
		e.preventDefault();
		updateError = '';
		updateSuccess = '';
		updateLoading = true;

		try {
			const res = await fetch('/api/dynamic', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ short_code: data.code, passphrase, url: newUrl })
			});
			const body = await res.json() as { success?: boolean; message?: string };

			if (!res.ok) {
				updateError = body.message || 'Failed to update';
				return;
			}

			destinationUrl = newUrl;
			updateSuccess = 'URL updated successfully';
			setTimeout(() => { updateSuccess = ''; }, 3000);
		} catch {
			updateError = 'Network error. Please try again.';
		} finally {
			updateLoading = false;
		}
	}

	async function handleDeactivate() {
		deactivateLoading = true;

		try {
			const res = await fetch('/api/dynamic', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ short_code: data.code, passphrase })
			});

			if (!res.ok) {
				const body = await res.json() as { message?: string };
				updateError = body.message || 'Failed to deactivate';
				return;
			}

			isActive = false;
			showDeactivateConfirm = false;
		} catch {
			updateError = 'Network error. Please try again.';
		} finally {
			deactivateLoading = false;
		}
	}
</script>

<div class="mx-auto max-w-xl space-y-8">
	<section class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Manage <span class="text-accent">QR Code</span>
		</h1>
		<p class="mt-1 font-mono text-sm text-text-muted">{data.code}</p>
	</section>

	{#if !authenticated}
		<form onsubmit={handleAuth} class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<div>
				<label for="passphrase" class="block text-sm font-medium text-text mb-1">Passphrase</label>
				<input
					id="passphrase"
					type="password"
					bind:value={passphrase}
					required
					placeholder="Enter your passphrase"
					class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>

			{#if authError}
				<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{authError}</p>
			{/if}

			<button
				type="submit"
				disabled={!passphrase || authLoading}
				class="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{#if authLoading}
					Verifying...
				{:else}
					Unlock
				{/if}
			</button>
		</form>
	{:else}
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
			<div class="grid grid-cols-3 gap-4 text-center">
				<div>
					<p class="text-xs font-medium text-text-muted">Scans</p>
					<p class="mt-0.5 text-lg font-semibold text-text">{scanCount}</p>
				</div>
				<div>
					<p class="text-xs font-medium text-text-muted">Created</p>
					<p class="mt-0.5 text-sm text-text">{new Date(createdAt).toLocaleDateString()}</p>
				</div>
				<div>
					<p class="text-xs font-medium text-text-muted">Status</p>
					<p class="mt-0.5 text-sm font-medium" class:text-success={isActive} class:text-error={!isActive}>
						{isActive ? 'Active' : 'Inactive'}
					</p>
				</div>
			</div>

			{#if labelText}
				<div>
					<p class="text-xs font-medium text-text-muted">Label</p>
					<p class="mt-0.5 text-sm text-text">{labelText}</p>
				</div>
			{/if}

			{#if isActive}
				<form onsubmit={handleUpdate} class="space-y-4 border-t border-border pt-4">
					<div>
						<label for="newUrl" class="block text-sm font-medium text-text mb-1">Destination URL</label>
						<input
							id="newUrl"
							type="url"
							bind:value={newUrl}
							required
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>

					{#if updateError}
						<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{updateError}</p>
					{/if}

					{#if updateSuccess}
						<p class="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{updateSuccess}</p>
					{/if}

					<button
						type="submit"
						disabled={updateLoading || newUrl === destinationUrl}
						class="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if updateLoading}
							Updating...
						{:else}
							Update URL
						{/if}
					</button>
				</form>

				<div class="border-t border-border pt-4">
					{#if !showDeactivateConfirm}
						<button
							onclick={() => { showDeactivateConfirm = true; }}
							class="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
						>
							Deactivate QR Code
						</button>
					{:else}
						<div class="space-y-2">
							<p class="text-sm text-text-muted">This will permanently deactivate this QR code. It will no longer redirect.</p>
							<div class="flex gap-2">
								<button
									onclick={() => { showDeactivateConfirm = false; }}
									class="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
								>
									Cancel
								</button>
								<button
									onclick={handleDeactivate}
									disabled={deactivateLoading}
									class="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
								>
									{#if deactivateLoading}
										Deactivating...
									{:else}
										Confirm Deactivate
									{/if}
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="border-t border-border pt-4 text-center">
					<p class="text-sm text-text-muted">This QR code has been deactivated and will no longer redirect.</p>
				</div>
			{/if}
		</div>
	{/if}
</div>
