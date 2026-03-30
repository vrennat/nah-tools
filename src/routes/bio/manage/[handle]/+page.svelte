<svelte:head>
	<title>Manage Bio — nah</title>
</svelte:head>

<script lang="ts">
	import type { BioLink, BioClickStats } from '$bio/types';
	import { themes } from '$bio/themes';
	import type { QRStyleOptions } from '$qr/types';
	import QRPreview from '$components/QRPreview.svelte';
	import DownloadBar from '$components/DownloadBar.svelte';

	let { data } = $props();

	// Auth state
	let passphrase = $state('');
	let authError = $state('');
	let authLoading = $state(false);
	let authenticated = $state(false);

	// Profile state
	let displayName = $state('');
	let bioText = $state('');
	let avatarUrl = $state('');
	let selectedTheme = $state('minimal');
	let isActive = $state(true);
	let createdAt = $state('');

	// Links state
	let profileLinks = $state<BioLink[]>([]);

	// Stats state
	let stats = $state<BioClickStats>({
		totalViews: 0,
		totalClicks: 0,
		clicksByLink: [],
		clicksByDay: [],
		topCountries: [],
		topReferers: []
	});

	// Edit profile state
	let editName = $state('');
	let editBio = $state('');
	let editAvatar = $state('');
	let editTheme = $state('minimal');
	let profileSaving = $state(false);
	let profileSuccess = $state('');
	let profileError = $state('');

	// Add link state
	let newLinkUrl = $state('');
	let newLinkTitle = $state('');
	let addingLink = $state(false);
	let addLinkError = $state('');

	// Edit link state
	let editingLinkId = $state<number | null>(null);
	let editLinkUrl = $state('');
	let editLinkTitle = $state('');
	let savingLink = $state(false);

	// Deactivate state
	let deactivateLoading = $state(false);
	let showDeactivateConfirm = $state(false);

	// QR state
	let copied = $state(false);
	let qrInstance: any = $state(null);
	let profileUrl = $derived(`https://nah.tools/bio/${data.handle}`);
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

	async function handleAuth(e: SubmitEvent) {
		e.preventDefault();
		authError = '';
		authLoading = true;

		try {
			const res = await fetch('/api/bio/lookup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handle: data.handle, passphrase })
			});

			if (res.status === 403) {
				authError = 'Invalid passphrase';
				return;
			}
			if (res.status === 404) {
				authError = 'Profile not found';
				return;
			}
			if (!res.ok) {
				authError = 'Failed to load profile';
				return;
			}

			const info = (await res.json()) as {
				display_name: string;
				bio: string | null;
				avatar_url: string | null;
				theme: string;
				is_active: number;
				created_at: string;
				links: BioLink[];
				stats: BioClickStats;
			};

			displayName = info.display_name;
			bioText = info.bio || '';
			avatarUrl = info.avatar_url || '';
			selectedTheme = info.theme;
			isActive = info.is_active === 1;
			createdAt = info.created_at;
			profileLinks = info.links;
			stats = info.stats;

			// Init edit fields
			editName = displayName;
			editBio = bioText;
			editAvatar = avatarUrl;
			editTheme = selectedTheme;

			authenticated = true;
		} catch {
			authError = 'Network error. Please try again.';
		} finally {
			authLoading = false;
		}
	}

	async function saveProfile(e: SubmitEvent) {
		e.preventDefault();
		profileSaving = true;
		profileError = '';
		profileSuccess = '';

		try {
			const res = await fetch('/api/bio', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					handle: data.handle,
					passphrase,
					display_name: editName,
					bio: editBio || null,
					avatar_url: editAvatar || null,
					theme: editTheme
				})
			});

			if (!res.ok) {
				const body = (await res.json()) as { message?: string };
				profileError = body.message || 'Failed to update';
				return;
			}

			displayName = editName;
			bioText = editBio;
			avatarUrl = editAvatar;
			selectedTheme = editTheme;
			profileSuccess = 'Profile updated';
			setTimeout(() => {
				profileSuccess = '';
			}, 3000);
		} catch {
			profileError = 'Network error. Please try again.';
		} finally {
			profileSaving = false;
		}
	}

	async function addLink(e: SubmitEvent) {
		e.preventDefault();
		addingLink = true;
		addLinkError = '';

		try {
			const res = await fetch('/api/bio/links', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					handle: data.handle,
					passphrase,
					url: newLinkUrl,
					title: newLinkTitle,
					order_index: profileLinks.length
				})
			});

			if (!res.ok) {
				const body = (await res.json()) as { message?: string };
				addLinkError = body.message || 'Failed to add link';
				return;
			}

			const { link } = (await res.json()) as { link: BioLink };
			profileLinks = [...profileLinks, link];
			newLinkUrl = '';
			newLinkTitle = '';
		} catch {
			addLinkError = 'Network error. Please try again.';
		} finally {
			addingLink = false;
		}
	}

	function startEditLink(link: BioLink) {
		editingLinkId = link.id;
		editLinkUrl = link.url;
		editLinkTitle = link.title;
	}

	function cancelEditLink() {
		editingLinkId = null;
	}

	async function saveLink() {
		if (!editingLinkId) return;
		savingLink = true;

		try {
			const res = await fetch('/api/bio/links', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					handle: data.handle,
					passphrase,
					link_id: editingLinkId,
					url: editLinkUrl,
					title: editLinkTitle
				})
			});

			if (res.ok) {
				profileLinks = profileLinks.map((l) =>
					l.id === editingLinkId ? { ...l, url: editLinkUrl, title: editLinkTitle } : l
				);
				editingLinkId = null;
			}
		} catch {
			// silent
		} finally {
			savingLink = false;
		}
	}

	async function deleteLink(linkId: number) {
		try {
			const res = await fetch('/api/bio/links', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handle: data.handle, passphrase, link_id: linkId })
			});

			if (res.ok) {
				profileLinks = profileLinks.filter((l) => l.id !== linkId);
			}
		} catch {
			// silent
		}
	}

	async function moveLink(index: number, direction: -1 | 1) {
		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= profileLinks.length) return;

		const reordered = [...profileLinks];
		[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
		profileLinks = reordered;

		// Persist order
		try {
			await fetch('/api/bio/links/reorder', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					handle: data.handle,
					passphrase,
					ordered_ids: profileLinks.map((l) => l.id)
				})
			});
		} catch {
			// silent
		}
	}

	async function handleDeactivate() {
		deactivateLoading = true;
		try {
			const res = await fetch('/api/bio', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handle: data.handle, passphrase })
			});

			if (res.ok) {
				isActive = false;
				showDeactivateConfirm = false;
			}
		} catch {
			// silent
		} finally {
			deactivateLoading = false;
		}
	}

	async function copyUrl() {
		await navigator.clipboard.writeText(profileUrl);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}

	function maxCount(items: { count: number }[]): number {
		return Math.max(...items.map((i) => i.count), 1);
	}
</script>

<div class="mx-auto max-w-2xl space-y-8">
	<section class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
			Manage <span class="text-accent">Bio</span>
		</h1>
		<p class="mt-1 font-mono text-sm text-text-muted">{data.handle}</p>
	</section>

	{#if !authenticated}
		<form
			onsubmit={handleAuth}
			class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4"
		>
			<div>
				<label for="passphrase" class="mb-1 block text-sm font-medium text-text">Passphrase</label
				>
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
				class="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
			>
				{#if authLoading}
					Verifying...
				{:else}
					Unlock
				{/if}
			</button>
		</form>
	{:else}
		<!-- Share -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">Share your page</h3>
			<div class="flex items-center gap-2">
				<input
					type="text"
					value={profileUrl}
					readonly
					class="flex-1 rounded-lg border border-border bg-surface-alt px-3 py-2 font-mono text-sm text-text"
				/>
				<button
					type="button"
					onclick={copyUrl}
					class="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					{copied ? 'Copied!' : 'Copy'}
				</button>
			</div>
			<div class="text-center">
				<a
					href={`/bio/${data.handle}`}
					target="_blank"
					rel="noopener"
					class="text-sm text-accent hover:underline">View live page</a
				>
			</div>
		</div>

		<!-- Analytics -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
			<div class="grid grid-cols-2 gap-4 text-center">
				<div>
					<p class="text-xs font-medium text-text-muted">Page Views</p>
					<p class="mt-1 text-3xl font-bold text-text">{stats.totalViews.toLocaleString()}</p>
				</div>
				<div>
					<p class="text-xs font-medium text-text-muted">Link Clicks</p>
					<p class="mt-1 text-3xl font-bold text-text">{stats.totalClicks.toLocaleString()}</p>
				</div>
			</div>

			{#if stats.clicksByLink.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Clicks by link</h3>
					<div class="space-y-1.5">
						{#each stats.clicksByLink as item}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-24 shrink-0 truncate text-text-muted" title={item.title}
									>{item.title}</span
								>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(item.count / maxCount(stats.clicksByLink)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{item.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if stats.clicksByDay.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Clicks by day</h3>
					<div class="space-y-1.5">
						{#each stats.clicksByDay as day}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 text-text-muted">{day.date}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(day.count / maxCount(stats.clicksByDay)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{day.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if stats.topCountries.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Top countries</h3>
					<div class="space-y-1.5">
						{#each stats.topCountries as country}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 text-text-muted">{country.country}</span>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(country.count / maxCount(stats.topCountries)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{country.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if stats.topReferers.length > 0}
				<div>
					<h3 class="mb-3 text-sm font-medium text-text">Top referers</h3>
					<div class="space-y-1.5">
						{#each stats.topReferers as referer}
							<div class="flex items-center gap-3 text-xs">
								<span class="w-20 shrink-0 truncate text-text-muted" title={referer.referer}
									>{referer.referer}</span
								>
								<div class="flex-1">
									<div
										class="h-5 rounded bg-accent/80 transition-all"
										style="width: {(referer.count / maxCount(stats.topReferers)) * 100}%"
									></div>
								</div>
								<span class="w-8 shrink-0 text-right text-text-muted">{referer.count}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>

		<!-- Profile settings -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">Profile settings</h3>
			<form onsubmit={saveProfile} class="space-y-4">
				<div>
					<label for="edit-name" class="mb-1 block text-sm font-medium text-text"
						>Display name</label
					>
					<input
						id="edit-name"
						type="text"
						bind:value={editName}
						required
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>

				<div>
					<label for="edit-bio" class="mb-1 block text-sm font-medium text-text">Bio</label>
					<textarea
						id="edit-bio"
						bind:value={editBio}
						rows={2}
						class="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				<div>
					<label for="edit-avatar" class="mb-1 block text-sm font-medium text-text"
						>Avatar URL</label
					>
					<input
						id="edit-avatar"
						type="url"
						bind:value={editAvatar}
						placeholder="https://example.com/photo.jpg"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>

				<fieldset>
					<legend class="mb-2 block text-sm font-medium text-text">Theme</legend>
					<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
						{#each themes as theme}
							<button
								type="button"
								onclick={() => {
									editTheme = theme.id;
								}}
								class="group relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-2 transition-all {editTheme ===
								theme.id
									? 'border-accent'
									: 'border-transparent hover:border-border'}"
							>
								<div
									class="h-8 w-8 rounded-full border border-border/50"
									style="background: {theme.bg};"
								></div>
								<span class="text-xs text-text-muted">{theme.name}</span>
							</button>
						{/each}
					</div>
				</fieldset>

				{#if profileError}
					<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{profileError}</p>
				{/if}
				{#if profileSuccess}
					<p class="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">{profileSuccess}</p>
				{/if}

				<button
					type="submit"
					disabled={profileSaving}
					class="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
				>
					{#if profileSaving}
						Saving...
					{:else}
						Save changes
					{/if}
				</button>
			</form>
		</div>

		<!-- Links manager -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">Links</h3>

			{#if profileLinks.length > 0}
				<div class="space-y-2">
					{#each profileLinks as link, i}
						<div class="rounded-lg border border-border p-3">
							{#if editingLinkId === link.id}
								<div class="space-y-2">
									<input
										type="text"
										bind:value={editLinkTitle}
										placeholder="Title"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
									<input
										type="url"
										bind:value={editLinkUrl}
										placeholder="URL"
										class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
									/>
									<div class="flex gap-2">
										<button
											type="button"
											onclick={cancelEditLink}
											class="flex-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-alt"
										>
											Cancel
										</button>
										<button
											type="button"
											onclick={saveLink}
											disabled={savingLink}
											class="flex-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
										>
											{savingLink ? 'Saving...' : 'Save'}
										</button>
									</div>
								</div>
							{:else}
								<div class="flex items-center gap-3">
									<div class="flex shrink-0 flex-col gap-0.5">
										<button
											type="button"
											onclick={() => moveLink(i, -1)}
											disabled={i === 0}
											class="rounded p-0.5 text-text-muted transition-colors hover:text-text disabled:opacity-20"
											aria-label="Move up"
										>
											<svg
												class="h-3.5 w-3.5"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M5 15l7-7 7 7"
												/>
											</svg>
										</button>
										<button
											type="button"
											onclick={() => moveLink(i, 1)}
											disabled={i === profileLinks.length - 1}
											class="rounded p-0.5 text-text-muted transition-colors hover:text-text disabled:opacity-20"
											aria-label="Move down"
										>
											<svg
												class="h-3.5 w-3.5"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</button>
									</div>

									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-medium text-text">{link.title}</p>
										<p class="truncate text-xs text-text-muted">{link.url}</p>
									</div>

									<span class="shrink-0 text-xs text-text-muted"
										>{link.click_count} clicks</span
									>

									<div class="flex shrink-0 gap-1">
										<button
											type="button"
											onclick={() => startEditLink(link)}
											class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
											aria-label="Edit link"
										>
											<svg
												class="h-3.5 w-3.5"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</button>
										<button
											type="button"
											onclick={() => deleteLink(link.id)}
											class="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
											aria-label="Delete link"
										>
											<svg
												class="h-3.5 w-3.5"
												fill="none"
												stroke="currentColor"
												stroke-width="2"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-center text-sm text-text-muted">No links yet.</p>
			{/if}

			<!-- Add link form -->
			<form onsubmit={addLink} class="space-y-2 border-t border-border pt-4">
				<div class="flex flex-col gap-2 sm:flex-row">
					<input
						type="text"
						bind:value={newLinkTitle}
						placeholder="Title"
						required
						class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<input
						type="url"
						bind:value={newLinkUrl}
						placeholder="https://..."
						required
						class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				{#if addLinkError}
					<p class="text-xs text-error">{addLinkError}</p>
				{/if}
				<button
					type="submit"
					disabled={!newLinkTitle || !newLinkUrl || addingLink}
					class="w-full rounded-lg border border-dashed border-border py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
				>
					{addingLink ? 'Adding...' : '+ Add link'}
				</button>
			</form>
		</div>

		<!-- QR Code -->
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
			<h3 class="text-sm font-medium text-text">QR Code</h3>
			<QRPreview data={profileUrl} options={styleOptions} onQRReady={(qr) => (qrInstance = qr)} />
			<DownloadBar data={profileUrl} qr={qrInstance} options={styleOptions} />
		</div>

		<!-- Danger zone -->
		{#if isActive}
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
				<h3 class="mb-4 text-sm font-medium text-error">Danger zone</h3>
				{#if !showDeactivateConfirm}
					<button
						onclick={() => {
							showDeactivateConfirm = true;
						}}
						class="w-full rounded-lg border border-red-500 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
					>
						Deactivate Page
					</button>
				{:else}
					<div class="space-y-2">
						<p class="text-sm text-text-muted">
							This will permanently deactivate your page. It will no longer be visible.
						</p>
						<div class="flex gap-2">
							<button
								onclick={() => {
									showDeactivateConfirm = false;
								}}
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
			<div class="rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
				<p class="text-sm text-text-muted">
					This page has been deactivated and is no longer visible.
				</p>
			</div>
		{/if}
	{/if}
</div>
