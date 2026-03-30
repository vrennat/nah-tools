<svelte:head>
	<title>Manage Link — nah</title>
</svelte:head>

<script lang="ts">
	import type { QRStyleOptions } from '$qr/types';
	import QRPreview from '$components/QRPreview.svelte';
	import DownloadBar from '$components/DownloadBar.svelte';

	let { data } = $props();

	let passphrase = $state('');
	let authError = $state('');
	let authLoading = $state(false);
	let authenticated = $state(false);

	let destinationUrl = $state('');
	let totalClicks = $state(0);
	let clicksByDay = $state<{ date: string; count: number }[]>([]);
	let topCountries = $state<{ country: string; count: number }[]>([]);
	let deviceBreakdown = $state<{ device: string; count: number }[]>([]);
	let topReferers = $state<{ referer: string; count: number }[]>([]);
	let createdAt = $state('');
	let isActive = $state(true);
	let labelText = $state('');
	let expiresAt = $state('');
	let shortUrl = $state('');

	let newUrl = $state('');
	let updateError = $state('');
	let updateSuccess = $state('');
	let updateLoading = $state(false);

	let deactivateLoading = $state(false);
	let showDeactivateConfirm = $state(false);

	let copied = $state(false);
	let qrInstance: any = $state(null);

	let reportReason = $state('');
	let reportLoading = $state(false);
	let reportSuccess = $state(false);
	let reportError = $state('');

	let styleOptions: QRStyleOptions = $state({
		foreground: '#000000',
		background: '#ffffff',
		dotStyle: 'square',
		cornerSquareStyle: 'square',
		cornerDotStyle: 'square',
		errorCorrection: 'M',
		logo: undefined,
		logoSize: 0.4
	});

	let qrData = $derived(`https://go.nah.tools/${data.code}`);

	async function handleAuth(e: SubmitEvent) {
		e.preventDefault();
		authError = '';
		authLoading = true;

		try {
			const res = await fetch('/api/links/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ short_code: data.code, passphrase })
			});

			if (res.status === 403) {
				authError = 'Invalid passphrase';
				return;
			}

			if (res.status === 404) {
				authError = 'Link not found';
				return;
			}

			if (!res.ok) {
				authError = 'Failed to load link details';
				return;
			}

			const info = await res.json() as {
				destination_url: string;
				total_clicks: number;
				clicks_by_day: { date: string; count: number }[];
				top_countries: { country: string; count: number }[];
				device_breakdown: { device: string; count: number }[];
				top_referers: { referer: string; count: number }[];
				created_at: string;
				is_active: number;
				label: string | null;
				expires_at: string | null;
				short_url: string;
			};
			destinationUrl = info.destination_url;
			newUrl = info.destination_url;
			totalClicks = info.total_clicks;
			clicksByDay = info.clicks_by_day || [];
			topCountries = info.top_countries || [];
			deviceBreakdown = info.device_breakdown || [];
			topReferers = info.top_referers || [];
			createdAt = info.created_at;
			isActive = info.is_active === 1;
			labelText = info.label || '';
			expiresAt = info.expires_at || '';
			shortUrl = info.short_url;
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
			const res = await fetch('/api/links', {
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
			const res = await fetch('/api/links', {
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

	async function copyShortUrl() {
		await navigator.clipboard.writeText(shortUrl || qrData);
		copied = true;
		setTimeout(() => { copied = false; }, 2000);
	}

	async function handleReport(e: SubmitEvent) {
		e.preventDefault();
		if (!reportReason) return;
		reportLoading = true;
		reportError = '';

		try {
			const res = await fetch('/api/links/report', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ short_code: data.code, reason: reportReason })
			});

			if (!res.ok) {
				reportError = 'Failed to submit report. Please try again.';
				return;
			}

			reportSuccess = true;
		} catch {
			reportError = 'Network error. Please try again.';
		} finally {
			reportLoading = false;
		}
	}

	function maxCount(items: { count: number }[]): number {
		return Math.max(...items.map((i) => i.count), 1);
	}
</script>

<div class="mx-auto max-w-2xl space-y-8">
	<section class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Manage <span class="text-accent">Link</span>
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
				class="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
			>
				{#if authLoading}
					Verifying...
				{:else}
					Unlock
				{/if}
			</button>
		</form>
	{:else}
		<!-- Stats section -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
			<div class="text-center">
				<p class="text-xs font-medium text-text-muted">Total Clicks</p>
				<p class="mt-1 text-4xl font-bold text-text">{totalClicks.toLocaleString()}</p>
			</div>

			{#if clicksByDay.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Clicks by day (last 30 days)</h3>
					<div class="space-y-1.5">
						{#each clicksByDay as day}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 text-text-muted">{day.date}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(day.count / maxCount(clicksByDay)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{day.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if topCountries.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Top countries</h3>
					<div class="space-y-1.5">
						{#each topCountries as country}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 text-text-muted">{country.country}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(country.count / maxCount(topCountries)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{country.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if deviceBreakdown.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Devices</h3>
					<div class="space-y-1.5">
						{#each deviceBreakdown as device}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 text-text-muted">{device.device}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(device.count / maxCount(deviceBreakdown)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{device.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if topReferers.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Top referers</h3>
					<div class="space-y-1.5">
						{#each topReferers as referer}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 truncate text-text-muted" title={referer.referer}>{referer.referer}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(referer.count / maxCount(topReferers)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{referer.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Link details -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">Link details</h3>

			<div class="space-y-3">
				<div>
					<p class="text-xs font-medium text-text-muted">Short URL</p>
					<div class="mt-0.5 flex items-center gap-2">
						<p class="break-all font-mono text-sm text-text">{shortUrl || qrData}</p>
						<button
							type="button"
							onclick={copyShortUrl}
							class="shrink-0 rounded-lg border border-border px-3 py-1 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
						>
							{copied ? 'Copied!' : 'Copy'}
						</button>
					</div>
				</div>

				<div>
					<p class="text-xs font-medium text-text-muted">Destination</p>
					<p class="mt-0.5 break-all text-sm text-text">{destinationUrl}</p>
				</div>

				<div class="grid grid-cols-3 gap-4">
					{#if labelText}
						<div>
							<p class="text-xs font-medium text-text-muted">Label</p>
							<p class="mt-0.5 text-sm text-text">{labelText}</p>
						</div>
					{/if}
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
					{#if expiresAt}
						<div>
							<p class="text-xs font-medium text-text-muted">Expires</p>
							<p class="mt-0.5 text-sm text-text">{new Date(expiresAt).toLocaleDateString()}</p>
						</div>
					{/if}
				</div>
			</div>

			{#if isActive}
				<form onsubmit={handleUpdate} class="space-y-4 border-t border-border pt-4">
					<div>
						<label for="newUrl" class="block text-sm font-medium text-text mb-1">Update destination URL</label>
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
						class="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					>
						{#if updateLoading}
							Updating...
						{:else}
							Save Changes
						{/if}
					</button>
				</form>
			{/if}
		</div>

		<!-- QR code -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">QR Code</h3>
			<QRPreview
				data={qrData}
				options={styleOptions}
				onQRReady={(qr) => (qrInstance = qr)}
			/>
			<DownloadBar data={qrData} qr={qrInstance} options={styleOptions} />
		</div>

		<!-- Danger zone -->
		{#if isActive}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<h3 class="mb-4 text-sm font-medium text-error">Danger zone</h3>
				{#if !showDeactivateConfirm}
					<button
						onclick={() => { showDeactivateConfirm = true; }}
						class="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
					>
						Deactivate Link
					</button>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-text-muted">This will permanently deactivate this link. It will no longer redirect.</p>
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
								class="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-40"
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
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm text-center">
				<p class="text-sm text-text-muted">This link has been deactivated and will no longer redirect.</p>
			</div>
		{/if}
	{/if}

	<!-- Report section (no auth required) -->
	<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
		<h3 class="text-sm font-medium text-text">Report this link</h3>
		{#if reportSuccess}
			<p class="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
				Report submitted. Thank you for helping keep the web safe.
			</p>
		{:else}
			<form onsubmit={handleReport} class="space-y-3">
				<div>
					<label for="report-reason" class="mb-1 block text-sm font-medium text-text">Reason</label>
					<select
						id="report-reason"
						bind:value={reportReason}
						required
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					>
						<option value="">Select a reason</option>
						<option value="spam">Spam</option>
						<option value="phishing">Phishing</option>
						<option value="malware">Malware</option>
						<option value="inappropriate">Inappropriate content</option>
						<option value="other">Other</option>
					</select>
				</div>

				{#if reportError}
					<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{reportError}</p>
				{/if}

				<button
					type="submit"
					disabled={!reportReason || reportLoading}
					class="w-full rounded-lg border border-border px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:opacity-40 disabled:cursor-not-allowed"
				>
					{#if reportLoading}
						Submitting...
					{:else}
						Submit Report
					{/if}
				</button>
			</form>
		{/if}
	</div>
</div>
