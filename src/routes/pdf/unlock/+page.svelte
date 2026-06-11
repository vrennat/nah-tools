<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import ToolShell from '$components/ToolShell.svelte';

	let files = $state<File[]>([]);
	let password = $state('');
	let processing = $state(false);
	let error = $state('');

	let file = $derived(files[0]);
	let canUnlock = $derived(!!file && password.length > 0 && !processing);

	async function unlock() {
		if (!canUnlock || !file) return;
		processing = true;
		error = '';

		try {
			const { unlockPDF } = await import('$pdf/processor');
			const { downloadPDF, makeFilename } = await import('$pdf/exporter');

			const buf = await file.arrayBuffer();
			const result = await unlockPDF(buf, password);

			downloadPDF(result, makeFilename('unlocked', 'pdf'));
		} catch (e) {
			const msg = e instanceof Error ? e.message : 'Failed to unlock PDF';
			if (msg.includes('password') || msg.includes('decrypt') || msg.includes('encrypted')) {
				error = 'Incorrect password. Please try again.';
			} else {
				error = msg;
			}
		} finally {
			processing = false;
		}
	}

	const faqs = [
		{
			question: 'Can this tool unlock a PDF without the password?',
			answer:
				'No. You must know the correct password. This tool authenticates with the password you provide, then saves a new copy of the document without encryption applied. It cannot brute-force or bypass an unknown password.'
		},
		{
			question: 'What happens to the unlocked PDF?',
			answer:
				'The tool loads the encrypted document with your password, copies all pages into a new unencrypted PDF document, and downloads it. The result is a standard PDF with no password required to open.'
		},
		{
			question: 'Are my file and password sent to a server?',
			answer:
				'No. Everything runs in your browser. The PDF and the password you type are never transmitted to any external server. The decryption happens entirely in local JavaScript using pdf-lib.'
		},
		{
			question: 'What if I get "Incorrect password" but I know the password is right?',
			answer:
				'Some PDFs use owner-only encryption, where the document can be opened without a password but a separate owner password controls editing. If you are trying to remove restrictions from such a file, the password needed is the owner password, not the open password.'
		},
		{
			question: 'Will the unlocked PDF retain all content — bookmarks, annotations, form fields?',
			answer:
				'The unlocked copy is produced by copying all pages from the authenticated source document into a fresh file. Page content, bookmarks, links, and most PDF structure are preserved. Complex interactive form fields or JavaScript actions may not survive the copy depending on how they were created.'
		}
	];
</script>

<ToolShell
	path="/pdf/unlock"
	tagline="Remove password protection from a PDF you own. Enter the password once, download an unlocked copy."
	seoTitle="Unlock PDF — Remove Password Free | nah.tools"
	description="Remove password protection from your PDF. Enter the password you know and download an unlocked copy. Free, no upload — processed in your browser."
	{faqs}
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" acceptPendingFile={true} bind:files label="Drop a password-protected PDF here" />

			{#if file}
				<div class="mt-4 space-y-4">
					<div>
						<label for="password" class="mb-1 block text-sm font-medium text-text"
							>Password</label
						>
						<input
							id="password"
							type="password"
							bind:value={password}
							placeholder="Enter the PDF password"
							autocomplete="current-password"
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>

					<p class="text-xs text-text-muted">
						You can only unlock PDFs for which you know the password.
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
					disabled={!canUnlock}
					onclick={unlock}
				>
					{#if processing}
						Unlocking...
					{:else if !file}
						Upload a PDF
					{:else}
						Unlock & Download
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-6">
			<h2 class="font-display text-lg font-700">Why remove a password from your own PDF?</h2>
			<p class="text-sm leading-relaxed text-text-muted">
				Password-protected PDFs are convenient for sharing sensitive documents securely, but they
				become friction when you need to work with the file yourself — merging, splitting,
				annotating, or archiving it. Constantly re-entering a password in every tool gets old fast.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				This tool is the complement to the Protect PDF tool. Upload the encrypted file, enter the
				password you set when protecting it, and download an identical copy with the encryption
				stripped. From that point you can use the file in any other PDF tool without entering a
				password each time.
			</p>
			<p class="text-sm leading-relaxed text-text-muted">
				No data leaves your device. The password you enter is used only to decrypt the file locally
				and is discarded as soon as the download begins.
			</p>
		</div>
	</section>
</ToolShell>
