<script lang="ts">
	import { renderSignature } from '$signature/renderer';
	import { copyHtml, copyRichText, downloadHtm } from '$signature/exporter';
	import SignatureEditor from '$components/signature/SignatureEditor.svelte';
	import SignaturePreview from '$components/signature/SignaturePreview.svelte';
	import type { SignatureData } from '$signature/types';

	let data: SignatureData = $state({
		name: '',
		title: '',
		company: '',
		department: '',
		phone: '',
		email: '',
		website: '',
		address: '',
		photoUrl: '',
		companyLogoUrl: '',
		socialLinks: [],
		template: 'professional',
		accentColor: '#3b82f6',
		fontFamily: 'Arial'
	});

	let copying = $state(false);
	let downloadError = $state('');

	let generatedHtml = $derived(renderSignature(data));

	async function handleCopyHtml() {
		try {
			copying = true;
			downloadError = '';
			await copyHtml(generatedHtml);
		} catch (err) {
			downloadError = 'Failed to copy HTML';
		} finally {
			copying = false;
		}
	}

	async function handleCopyRichText() {
		try {
			copying = true;
			downloadError = '';
			await copyRichText(generatedHtml);
		} catch (err) {
			downloadError = 'Your browser does not support rich text clipboard. Try Copy HTML instead.';
		} finally {
			copying = false;
		}
	}

	function handleDownload() {
		try {
			downloadError = '';
			downloadHtm(generatedHtml, 'email-signature.htm');
		} catch (err) {
			downloadError = 'Failed to download file';
		}
	}
</script>

<svelte:head>
	<title>Free Email Signature Generator — nah</title>
	<meta name="description" content="Free, open-source email signature generator. Design professional signatures in seconds. No signup, no tracking." />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "nah — Free Email Signature Generator",
		"url": "https://nah.tools/signature",
		"description": "Free, open-source email signature generator. Design professional signatures in seconds. No signup, no tracking.",
		"applicationCategory": "UtilityApplication",
		"operatingSystem": "Any",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"creator": {
			"@type": "Organization",
			"name": "nah",
			"url": "https://nah.tools"
		}
	})}</script>`}
</svelte:head>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Email Signatures. <span class="text-accent">Done.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Generate professional email signatures in seconds. No signup, no tracking.
		</p>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<div class="grid gap-8 lg:grid-cols-2">
			<div class="space-y-6 overflow-y-auto max-lg:max-h-screen lg:max-h-[calc(100vh-200px)]">
				<SignatureEditor bind:data />
			</div>

			<div class="space-y-4 lg:sticky lg:top-8 lg:h-fit">
				<SignaturePreview html={generatedHtml} />

				<div class="space-y-2">
					{#if downloadError}
						<p class="rounded-lg bg-error/10 px-3 py-2 text-xs text-error">{downloadError}</p>
					{/if}

					<button
						onclick={handleCopyRichText}
						disabled={copying}
						class="w-full rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
					>
						{#if copying}
							Copying...
						{:else}
							Copy to Clipboard
						{/if}
					</button>

					<button
						onclick={handleCopyHtml}
						disabled={copying}
						class="w-full rounded-full border border-accent/30 px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-accent/5 disabled:cursor-not-allowed disabled:opacity-40"
					>
						Copy HTML
					</button>

					<button
						onclick={handleDownload}
						disabled={copying}
						class="w-full rounded-full border border-border px-4 py-2.5 text-sm font-medium text-text transition-colors hover:bg-surface-alt disabled:cursor-not-allowed disabled:opacity-40"
					>
						Download .htm
					</button>
				</div>

				<p class="rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
					Files never leave your device — 100% client-side
				</p>
			</div>
		</div>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<details class="group">
			<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
				How to use your email signature
			</summary>
			<div class="mt-4 space-y-3 text-sm text-text-muted">
				<div>
					<p class="mb-1 font-medium text-text">Gmail</p>
					<p>1. Click "Copy to Clipboard" above</p>
					<p>2. Go to Gmail Settings > Forwarding and POP/IMAP > Signature</p>
					<p>3. Paste into the signature box and save</p>
				</div>
				<div>
					<p class="mb-1 font-medium text-text">Outlook / Outlook.com</p>
					<p>1. Click "Copy to Clipboard" above</p>
					<p>2. Go to Settings > Mail > Compose and reply</p>
					<p>3. In the signature box, paste your signature</p>
				</div>
				<div>
					<p class="mb-1 font-medium text-text">Apple Mail</p>
					<p>1. Click "Download .htm" to save the file</p>
					<p>2. Mail > Preferences > Signatures</p>
					<p>3. Click the + button, then copy/paste the HTML content</p>
				</div>
			</div>
		</details>
	</section>
</div>
