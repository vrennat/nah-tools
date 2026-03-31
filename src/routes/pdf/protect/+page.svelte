<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

	let files = $state<File[]>([]);
	let userPassword = $state('');
	let confirmPassword = $state('');
	let ownerPassword = $state('');
	let showOwnerPassword = $state(false);
	let permissions = $state({
		printing: true,
		copying: true,
		modifying: false,
		annotating: true
	});
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);
	let passwordsMatch = $derived(userPassword === confirmPassword);
	let passwordStrength = $derived(getPasswordStrength(userPassword));

	let canProtect = $derived(
		!!file &&
			userPassword.length > 0 &&
			passwordsMatch &&
			!processing
	);

	function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
		if (!pw) return { label: '', color: '', width: 'w-0' };

		let score = 0;
		if (pw.length >= 8) score++;
		if (pw.length >= 12) score++;
		if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
		if (/\d/.test(pw)) score++;
		if (/[^a-zA-Z0-9]/.test(pw)) score++;

		if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
		if (score <= 2) return { label: 'Fair', color: 'bg-amber-500', width: 'w-1/2' };
		if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: 'w-3/4' };
		return { label: 'Strong', color: 'bg-green-500', width: 'w-full' };
	}

	async function protect() {
		if (!canProtect || !file) return;
		processing = true;
		error = '';

		try {
			const { protectPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const result = await protectPDF(
				buf,
				userPassword,
				ownerPassword || userPassword,
				permissions
			);

			downloadPDF(result, makeFilename('protected', 'pdf'));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to protect PDF';
		} finally {
			processing = false;
		}
	}
</script>

<svelte:head>
	<title>Protect PDF with Password Online Free | nah</title>
	<meta
		name="description"
		content="Add password protection and encryption to your PDF. Set permissions for printing, copying, and editing. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Protect PDF"
	description="Add password protection and encryption to your PDF."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a PDF here or click to browse" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div>
						<label for="userPassword" class="mb-1 block text-sm font-medium text-text"
							>Password</label
						>
						<input
							id="userPassword"
							type="password"
							bind:value={userPassword}
							placeholder="Required to open the PDF"
							autocomplete="new-password"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
						{#if userPassword}
							<div class="mt-2 space-y-1">
								<div class="h-1.5 w-full rounded-full bg-surface-alt">
									<div
										class="h-1.5 rounded-full transition-all duration-200 {passwordStrength.color} {passwordStrength.width}"
									></div>
								</div>
								<p class="text-xs text-text-muted">{passwordStrength.label}</p>
							</div>
						{/if}
					</div>

					<div>
						<label for="confirmPassword" class="mb-1 block text-sm font-medium text-text"
							>Confirm password</label
						>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							placeholder="Re-enter password"
							autocomplete="new-password"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
						{#if confirmPassword && !passwordsMatch}
							<p class="mt-1 text-xs text-error">Passwords do not match.</p>
						{/if}
					</div>

					<div>
						<button
							type="button"
							class="text-sm text-accent hover:underline"
							onclick={() => (showOwnerPassword = !showOwnerPassword)}
						>
							{showOwnerPassword ? 'Hide' : 'Show'} advanced options
						</button>
					</div>

					{#if showOwnerPassword}
						<div>
							<label for="ownerPassword" class="mb-1 block text-sm font-medium text-text"
								>Owner password <span class="font-normal text-text-muted">(optional)</span></label
							>
							<input
								id="ownerPassword"
								type="password"
								bind:value={ownerPassword}
								placeholder="Separate password for full access (defaults to user password)"
								autocomplete="new-password"
								class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							/>
							<p class="mt-1 text-xs text-text-muted">
								The owner password grants full access regardless of permission settings.
							</p>
						</div>
					{/if}

					<fieldset>
						<legend class="mb-2 text-sm font-medium text-text">Permissions</legend>
						<div class="space-y-2">
							<label class="flex items-center gap-2 text-sm text-text">
								<input type="checkbox" bind:checked={permissions.printing} class="accent-accent" />
								Allow printing
							</label>
							<label class="flex items-center gap-2 text-sm text-text">
								<input type="checkbox" bind:checked={permissions.copying} class="accent-accent" />
								Allow copying text
							</label>
							<label class="flex items-center gap-2 text-sm text-text">
								<input type="checkbox" bind:checked={permissions.modifying} class="accent-accent" />
								Allow modifying
							</label>
							<label class="flex items-center gap-2 text-sm text-text">
								<input type="checkbox" bind:checked={permissions.annotating} class="accent-accent" />
								Allow annotating
							</label>
						</div>
					</fieldset>

					<p class="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
						Remember your password — it cannot be recovered.
					</p>
				</div>
			{/if}

			{#if error}
				<p role="alert" class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
			{/if}

			<div class="mt-6">
				<button
					type="button"
					class="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
					disabled={!canProtect}
					onclick={protect}
				>
					{#if processing}
						Protecting...
					{:else if !file}
						Upload a PDF
					{:else}
						Protect & Download
					{/if}
				</button>
			</div>
		</div>

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
