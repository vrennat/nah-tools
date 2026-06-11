<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

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

	const faqs = [
		{
			question: 'What encryption algorithm is used to protect the PDF?',
			answer:
				'The tool uses AES-128 encryption via the pdf-lib library, which applies PDF standard security revision 4 (V=4, R=4). This is the encryption level used by standard PDF 1.6/1.7 documents and is compatible with all major PDF viewers including Adobe Acrobat, Preview, and Chrome.'
		},
		{
			question: 'What is the difference between the user password and owner password?',
			answer:
				'The user password is required to open the document. The owner password grants full access regardless of any permission restrictions you set. If you do not set a separate owner password, the user password is also used as the owner password.'
		},
		{
			question: 'Can I restrict printing or copying even after setting a password?',
			answer:
				'Yes. The permissions panel lets you independently allow or deny printing, copying text, modifying content, and adding annotations. These restrictions are enforced by conforming PDF readers, though they can be bypassed by software that ignores PDF permissions.'
		},
		{
			question: 'What happens if I forget the password?',
			answer:
				'There is no password recovery. The password is never stored — all processing happens in your browser and no data is sent to any server. Keep a secure record of the password before protecting your document.'
		},
		{
			question: 'Are my files uploaded to protect them?',
			answer:
				'No. The entire protection process runs in your browser using JavaScript. Your PDF and your password are never transmitted to any server.'
		}
	];
</script>

<ToolShell
	path="/pdf/protect"
	tagline="Add AES-128 password encryption to your PDF and control printing, copying, and editing permissions."
	seoTitle="Protect PDF with Password Free — AES Encryption | nah.tools"
	description="Password-protect your PDF with AES-128 encryption. Set permissions for printing, copying, and editing. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a PDF here or click to browse" />

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
										class="h-1.5 rounded-full transition-all duration-300 {passwordStrength.color} {passwordStrength.width}"
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
				<p class="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{error}</p>
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

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">What password protection actually does</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				PDF password protection uses AES-128 encryption to scramble the document's content. Without
				the correct password, a reader cannot decode the file. The password is never stored
				anywhere — not in the file, not on any server. Everything runs locally in your browser.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				Beyond the open password, you can separately control what an authenticated reader can do
				with the document: whether they can print it at high resolution, copy text to the clipboard,
				modify the content, or add annotations. These restrictions are enforced by conforming
				readers; tools that ignore PDF permissions can bypass them.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				For the highest security, use a strong password (12+ characters, mixed case, numbers, and
				symbols) and keep a secure copy. There is no recovery mechanism once a document is
				protected.
			</p>
		</div>
	</section>
</ToolShell>
