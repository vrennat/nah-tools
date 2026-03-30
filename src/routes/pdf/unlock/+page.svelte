<script lang="ts">
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import PdfToolLayout from '$components/pdf/PdfToolLayout.svelte';

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
</script>

<svelte:head>
	<title>Unlock PDF — Remove Password Online Free | nah</title>
	<meta
		name="description"
		content="Remove password protection from your PDF. Enter the password you know and download an unlocked copy. Free, no upload — processed in your browser."
	/>
</svelte:head>

<PdfToolLayout
	title="Unlock PDF"
	description="Remove password protection from your PDF."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<FileDropZone accept=".pdf" bind:files label="Drop a password-protected PDF here" />

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

		<p class="text-center text-xs text-text-muted">
			<a href="/pdf" class="underline hover:text-accent">Back to all PDF tools</a>
		</p>
	</section>
</PdfToolLayout>
