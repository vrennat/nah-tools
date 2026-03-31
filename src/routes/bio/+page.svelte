<svelte:head>
	<title>Link in Bio — nah</title>
	<meta
		name="description"
		content="Create a free link-in-bio page. No signup, no monthly fees, no tracking. Just a clean profile you control."
	/>
</svelte:head>

<script lang="ts">
	import { debounce } from '$utils/debounce';
	import { themes } from '$bio/themes';
	import BioPreview from '$components/bio/BioPreview.svelte';

	let handle = $state('');
	let displayName = $state('');
	let bio = $state('');
	let avatarUrl = $state('');
	let selectedTheme = $state('minimal');
	let passphrase = $state('');

	let links = $state<{ url: string; title: string }[]>([{ url: '', title: '' }]);

	let handleStatus = $state<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
	let handleError = $state('');

	let loading = $state(false);
	let formError = $state('');

	let result = $state<{
		handle: string;
		profile_url: string;
		manage_url: string;
	} | null>(null);

	let copied = $state(false);

	let passphraseValid = $derived(!passphrase || passphrase.length >= 8);
	let hasValidLink = $derived(links.some((l) => l.url && l.title));
	let canCreate = $derived(
		handle &&
			displayName &&
			passphrase &&
			passphraseValid &&
			hasValidLink &&
			!loading &&
			handleStatus !== 'taken' &&
			handleStatus !== 'invalid' &&
			handleStatus !== 'checking'
	);

	const debouncedCheckHandle = debounce(async (...args: unknown[]) => {
		const value = args[0] as string;
		if (!value) {
			handleStatus = 'idle';
			handleError = '';
			return;
		}

		if (!/^[a-zA-Z0-9-]+$/.test(value)) {
			handleStatus = 'invalid';
			handleError = 'Only letters, numbers, and hyphens';
			return;
		}

		if (value.length < 3) {
			handleStatus = 'invalid';
			handleError = 'Must be at least 3 characters';
			return;
		}

		handleStatus = 'checking';
		handleError = '';

		try {
			const res = await fetch('/api/bio/check-handle', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ handle: value })
			});
			const data = (await res.json()) as { available: boolean; reason?: string };

			if (data.available) {
				handleStatus = 'available';
				handleError = '';
			} else {
				handleStatus = 'taken';
				handleError = data.reason || 'This handle is taken';
			}
		} catch {
			handleStatus = 'idle';
			handleError = '';
		}
	}, 400);

	function onHandleInput() {
		debouncedCheckHandle(handle.toLowerCase());
	}

	function addLink() {
		links = [...links, { url: '', title: '' }];
	}

	function removeLink(index: number) {
		links = links.filter((_, i) => i !== index);
		if (links.length === 0) {
			links = [{ url: '', title: '' }];
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		formError = '';
		loading = true;

		try {
			const validLinks = links.filter((l) => l.url && l.title);
			const res = await fetch('/api/bio', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					handle: handle.toLowerCase(),
					display_name: displayName,
					bio: bio || undefined,
					avatar_url: avatarUrl || undefined,
					theme: selectedTheme,
					passphrase,
					links: validLinks
				})
			});

			if (!res.ok) {
				const body = (await res.json()) as { message?: string };
				formError = body.message || `Error: ${res.status}`;
				return;
			}

			result = (await res.json()) as { handle: string; profile_url: string; manage_url: string };
		} catch {
			formError = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	async function copyUrl() {
		if (!result) return;
		await navigator.clipboard.writeText(result.profile_url);
		copied = true;
		setTimeout(() => {
			copied = false;
		}, 2000);
	}
</script>

<div class="mx-auto max-w-5xl space-y-8 py-8">
	<!-- Hero -->
	<section class="text-center">
		<h1
			class="animate-fade-up font-display text-4xl font-800 tracking-tight sm:text-5xl"
			style="animation-delay: 60ms;"
		>
			Link in <span class="text-accent">Bio</span>
		</h1>
		<p
			class="animate-fade-up mt-3 text-text-muted sm:text-lg"
			style="animation-delay: 120ms;"
		>
			Your links, your page. No signup, no monthly fees. Just a clean profile you control.
		</p>
	</section>

	{#if result}
		<!-- Success state -->
		<div
			class="animate-fade-up rounded-xl border border-border bg-surface p-8 text-center shadow-sm"
		>
			<div
				class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10"
			>
				<svg
					class="h-8 w-8 text-success"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
				</svg>
			</div>

			<h2 class="font-display text-2xl font-700">Your page is live</h2>
			<p class="mt-2 text-sm text-text-muted">Share this link anywhere.</p>

			<div class="mt-6 flex items-center gap-2">
				<input
					type="text"
					value={result.profile_url}
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

			<div class="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<a
					href={`/bio/${result.handle}`}
					target="_blank"
					rel="noopener"
					class="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt"
				>
					View page
				</a>
				<a
					href={result.manage_url}
					class="rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				>
					Manage page
				</a>
			</div>
		</div>
	{:else}
		<!-- Creation form + preview -->
		<div class="animate-fade-up grid gap-8 lg:grid-cols-[1fr,20rem]" style="animation-delay: 200ms;">
		<form
			onsubmit={handleSubmit}
			class="space-y-6"
		>
			<!-- Handle -->
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
				<h2 class="text-sm font-medium text-text">Choose your handle</h2>
				<div>
					<div class="flex items-center gap-2">
						<span class="shrink-0 text-sm text-text-muted">nah.tools/bio/</span>
						<input
							type="text"
							bind:value={handle}
							oninput={onHandleInput}
							placeholder="yourname"
							required
							class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>
					{#if handleStatus === 'checking'}
						<p class="mt-1 text-xs text-text-muted">Checking availability...</p>
					{:else if handleStatus === 'available'}
						<p class="mt-1 text-xs text-success">Available</p>
					{:else if handleStatus === 'taken' || handleStatus === 'invalid'}
						<p class="mt-1 text-xs text-error">{handleError}</p>
					{/if}
				</div>
			</div>

			<!-- Profile details -->
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
				<h2 class="text-sm font-medium text-text">Profile details</h2>

				<div>
					<label for="display-name" class="mb-1 block text-sm font-medium text-text"
						>Display name</label
					>
					<input
						id="display-name"
						type="text"
						bind:value={displayName}
						required
						autocomplete="name"
						placeholder="Your Name"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>

				<div>
					<label for="bio" class="mb-1 block text-sm font-medium text-text">Bio</label>
					<textarea
						id="bio"
						bind:value={bio}
						placeholder="A short description about yourself"
						rows={2}
						class="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					></textarea>
				</div>

				<div>
					<label for="avatar" class="mb-1 block text-sm font-medium text-text"
						>Avatar URL <span class="text-text-muted">(optional)</span></label
					>
					<input
						id="avatar"
						type="url"
						bind:value={avatarUrl}
						placeholder="https://example.com/photo.jpg"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>

			<!-- Theme -->
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
				<h2 class="text-sm font-medium text-text">Theme</h2>
				<div class="grid grid-cols-3 gap-3 sm:grid-cols-6">
					{#each themes as theme}
						<button
							type="button"
							onclick={() => {
								selectedTheme = theme.id;
							}}
							class="group relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all {selectedTheme ===
							theme.id
								? 'border-accent shadow-sm'
								: 'border-transparent hover:border-border'}"
						>
							<div
								class="h-10 w-10 rounded-full border border-border/50"
								style="background: {theme.bg};"
							></div>
							<span class="text-xs text-text-muted">{theme.name}</span>
						</button>
					{/each}
				</div>
			</div>

			<!-- Links -->
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
				<h2 class="text-sm font-medium text-text">Links</h2>

				{#each links as link, i}
					<div class="flex gap-2">
						<div class="flex flex-1 flex-col gap-2 sm:flex-row">
							<input
								type="text"
								bind:value={link.title}
								placeholder="Title"
								class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							<input
								type="url"
								bind:value={link.url}
								placeholder="https://..."
								class="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
						</div>
						{#if links.length > 1}
							<button
								type="button"
								onclick={() => removeLink(i)}
								class="shrink-0 rounded-lg border border-border p-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
								aria-label="Remove link"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						{/if}
					</div>
				{/each}

				<button
					type="button"
					onclick={addLink}
					class="w-full rounded-lg border border-dashed border-border py-2 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
				>
					+ Add another link
				</button>
			</div>

			<!-- Passphrase -->
			<div class="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4">
				<h2 class="text-sm font-medium text-text">Security</h2>
				<div>
					<label for="passphrase" class="mb-1 block text-sm font-medium text-text"
						>Passphrase</label
					>
					<input
						id="passphrase"
						type="password"
						bind:value={passphrase}
						required
						minlength={8}
						placeholder="At least 8 characters"
						class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
					<p class="mt-1 text-xs text-text-muted">
						You'll need this to manage your page later. There's no account — this is your only key.
					</p>
					{#if passphrase && !passphraseValid}
						<p class="mt-1 text-xs text-error">Must be at least 8 characters</p>
					{/if}
				</div>
			</div>

			{#if formError}
				<p role="alert" class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{formError}</p>
			{/if}

			<button
				type="submit"
				disabled={!canCreate}
				class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
			>
				{#if loading}
					Creating...
				{:else}
					Create page
				{/if}
			</button>
		</form>

		<!-- Live preview -->
		<div class="hidden lg:block">
			<div class="sticky top-8">
				<BioPreview
					{displayName}
					{bio}
					{avatarUrl}
					themeId={selectedTheme}
					{links}
				/>
			</div>
		</div>
		</div>
	{/if}
</div>
