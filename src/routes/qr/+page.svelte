<script lang="ts">
	import type { QRType, QRStyleOptions } from '$qr/types';
	import TypeSelector from '$components/TypeSelector.svelte';
	import URLInput from '$components/inputs/URLInput.svelte';
	import TextInput from '$components/inputs/TextInput.svelte';
	import WiFiInput from '$components/inputs/WiFiInput.svelte';
	import VCardInput from '$components/inputs/VCardInput.svelte';
	import EmailInput from '$components/inputs/EmailInput.svelte';
	import PhoneInput from '$components/inputs/PhoneInput.svelte';
	import SMSInput from '$components/inputs/SMSInput.svelte';
	import QRPreview from '$components/QRPreview.svelte';
	import StyleControls from '$components/StyleControls.svelte';
	import DownloadBar from '$components/DownloadBar.svelte';
	import BatchGenerator from '$components/BatchGenerator.svelte';

	let qrType: QRType = $state('url');
	let encodedData = $state('');
	let qrInstance: any = $state(null);

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

	// Dynamic QR state
	let dynamicEnabled = $state(false);
	let passphrase = $state('');
	let dynamicLabel = $state('');
	let dynamicLoading = $state(false);
	let dynamicError = $state('');
	let dynamicResult = $state<{
		short_code: string;
		redirect_url: string;
		manage_url: string;
	} | null>(null);

	let passphraseValid = $derived(passphrase.length >= 8);
	let canCreateDynamic = $derived(encodedData && passphraseValid && !dynamicLoading);

	// The data the QR preview shows — either the raw input or the dynamic redirect URL
	let previewData = $derived(dynamicResult ? dynamicResult.redirect_url : encodedData);

	$effect(() => {
		qrType;
		encodedData = '';
		dynamicEnabled = false;
		dynamicResult = null;
		dynamicError = '';
		passphrase = '';
		dynamicLabel = '';
	});

	$effect(() => {
		if (!dynamicEnabled) {
			dynamicResult = null;
			dynamicError = '';
		}
	});

	async function createDynamic() {
		if (!canCreateDynamic) return;
		dynamicLoading = true;
		dynamicError = '';

		try {
			const res = await fetch('/api/dynamic', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: encodedData,
					passphrase,
					label: dynamicLabel || undefined
				})
			});
			const json = await res.json() as {
				short_code: string;
				redirect_url: string;
				manage_url: string;
				message?: string;
			};
			if (!res.ok) {
				dynamicError = json.message || 'Something went wrong';
				return;
			}
			dynamicResult = json;
		} catch {
			dynamicError = 'Network error. Please try again.';
		} finally {
			dynamicLoading = false;
		}
	}

	function resetDynamic() {
		dynamicResult = null;
		dynamicError = '';
		passphrase = '';
		dynamicLabel = '';
	}
</script>

<svelte:head>
	<title>Nah Tools — Free QR Code Generator</title>
	<meta name="description" content="Free, open-source QR code generator. No signup, no expiration, no tracking." />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		"name": "Nah Tools — Free QR Code Generator",
		"url": "https://nah.tools/qr",
		"description": "Free, open-source QR code generator. Create QR codes for URLs, WiFi, vCards, email, phone, and SMS. No signup, no expiration, no tracking.",
		"applicationCategory": "UtilityApplication",
		"operatingSystem": "Any",
		"offers": {
			"@type": "Offer",
			"price": "0",
			"priceCurrency": "USD"
		},
		"creator": {
			"@type": "Organization",
			"name": "Nah Tools",
			"url": "https://nah.tools"
		}
	})}</script>`}
</svelte:head>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free QR Codes. <span class="text-accent">No catch.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Generated in your browser — your data never touches our servers.
		</p>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<TypeSelector bind:selected={qrType} />

		<div class="mt-6 grid gap-8 lg:grid-cols-2">
			<div class="space-y-6">
				<div>
					{#if qrType === 'url'}
						<URLInput bind:value={encodedData} />
					{:else if qrType === 'text'}
						<TextInput bind:value={encodedData} />
					{:else if qrType === 'wifi'}
						<WiFiInput bind:value={encodedData} />
					{:else if qrType === 'vcard'}
						<VCardInput bind:value={encodedData} />
					{:else if qrType === 'email'}
						<EmailInput bind:value={encodedData} />
					{:else if qrType === 'phone'}
						<PhoneInput bind:value={encodedData} />
					{:else if qrType === 'sms'}
						<SMSInput bind:value={encodedData} />
					{/if}
				</div>

				{#if qrType === 'url'}
					<div class="rounded-lg border border-border p-4">
						<label class="flex items-center gap-3 text-sm font-medium text-text">
							<input
								type="checkbox"
								bind:checked={dynamicEnabled}
								disabled={!!dynamicResult}
								class="accent-accent"
							/>
							Make dynamic
							<span class="font-normal text-text-muted">— update the destination after printing</span>
						</label>

						{#if dynamicEnabled}
							<div class="mt-4 space-y-3">
								{#if !dynamicResult}
									<div>
										<label for="dyn-pass" class="mb-1 block text-sm font-medium text-text">Passphrase</label>
										<input
											id="dyn-pass"
											type="password"
											bind:value={passphrase}
											placeholder="At least 8 characters"
											class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
										/>
										{#if passphrase.length > 0 && !passphraseValid}
											<p class="mt-1 text-xs text-error">Must be at least 8 characters</p>
										{/if}
									</div>
									<div>
										<label for="dyn-label" class="mb-1 block text-sm font-medium text-text">
											Label <span class="text-text-muted">(optional)</span>
										</label>
										<input
											id="dyn-label"
											type="text"
											bind:value={dynamicLabel}
											placeholder="e.g. Business card, flyer"
											class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
										/>
									</div>

									{#if dynamicError}
										<p class="rounded-lg bg-error/10 px-3 py-2 text-sm text-error">{dynamicError}</p>
									{/if}

									<button
										type="button"
										disabled={!canCreateDynamic}
										onclick={createDynamic}
										class="w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
									>
										{#if dynamicLoading}
											Creating...
										{:else}
											Create Dynamic QR Code
										{/if}
									</button>
								{:else}
									<div class="space-y-2 rounded-lg bg-success/10 p-3">
										<p class="text-sm font-medium text-success">Dynamic QR code created</p>
										<p class="break-all font-mono text-xs text-text-muted">{dynamicResult.redirect_url}</p>
									</div>
									<div class="rounded-lg border border-border bg-surface-alt p-3">
										<p class="mb-1 text-xs font-medium text-text">Bookmark your manage link:</p>
										<a
											href={dynamicResult.manage_url}
											class="break-all text-sm text-accent underline hover:text-accent-hover"
										>
											{dynamicResult.manage_url}
										</a>
										<p class="mt-1 text-xs text-text-muted">You'll need your passphrase to access this later.</p>
									</div>
									<button
										type="button"
										onclick={resetDynamic}
										class="text-xs text-text-muted underline hover:text-text"
									>
										Create another
									</button>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<details class="group">
					<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
						Customize style
					</summary>
					<div class="mt-4">
						<StyleControls bind:options={styleOptions} />
					</div>
				</details>
			</div>

			<div class="space-y-4">
				<QRPreview
					data={previewData}
					options={styleOptions}
					onQRReady={(qr) => (qrInstance = qr)}
				/>
				<DownloadBar data={previewData} qr={qrInstance} options={styleOptions} />
			</div>
		</div>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<details>
			<summary class="cursor-pointer text-sm font-medium text-text-muted hover:text-text">
				Batch generation — upload a CSV to generate multiple QR codes as a ZIP
			</summary>
			<div class="mt-4">
				<BatchGenerator options={styleOptions} />
			</div>
		</details>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6 shadow-sm">
		<h2 class="mb-4 text-sm font-medium text-text">Manage an existing dynamic QR code</h2>
		<form
			class="flex gap-3"
			onsubmit={(e: SubmitEvent) => {
				e.preventDefault();
				const form = e.target as HTMLFormElement;
				const code = (form.elements.namedItem('manage-code') as HTMLInputElement).value.trim();
				if (code) window.location.href = `/qr/manage/${code}`;
			}}
		>
			<div class="flex flex-1 items-center overflow-hidden rounded-lg border border-border bg-surface focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
				<span class="shrink-0 border-r border-border bg-surface-alt px-3 py-2 text-sm text-text-muted">go.nah.tools/</span>
				<input
					name="manage-code"
					type="text"
					placeholder="your-code"
					class="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm outline-none focus:outline-none focus:ring-0"
				/>
			</div>
			<button
				type="submit"
				class="shrink-0 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
			>
				Manage
			</button>
		</form>
		<p class="mt-2 text-xs text-text-muted">Enter your short code to update the destination URL or deactivate your dynamic QR code.</p>
	</section>
</div>
