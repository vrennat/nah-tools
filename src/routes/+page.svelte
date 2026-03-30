<svelte:head>
	<title>Nah Tools — Free, Open-Source Utilities</title>
	<meta name="description" content="Free, open-source developer and utility tools. No signup, no tracking, no catch." />
</svelte:head>

<div class="space-y-10">
	<section class="text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
			Free tools. <span class="text-accent">No catch.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Open-source utilities that respect your privacy. No accounts, no tracking, no paywalls.
		</p>
	</section>

	<div class="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<a
			href="/qr"
			class="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
		>
			<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-text group-hover:text-accent">QR Code Generator</h2>
			<p class="mt-1 text-sm text-text-muted">
				URL, text, WiFi, vCard, email, phone, SMS. Full style customization, batch export, dynamic codes.
			</p>
		</a>

		<a
			href="/pdf"
			class="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
		>
			<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-text group-hover:text-accent">PDF Tools</h2>
			<p class="mt-1 text-sm text-text-muted">
				Merge, split, rotate, compress, and convert. 100% client-side — files never leave your device.
			</p>
		</a>

		<a
			href="/links"
			class="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
		>
			<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-text group-hover:text-accent">Link Shortener</h2>
			<p class="mt-1 text-sm text-text-muted">
				Custom short links with click analytics, UTM builder, and QR codes. No signup required.
			</p>
		</a>
		<a
			href="/photo/rm-bg"
			class="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
		>
			<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
					/>
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-text group-hover:text-accent">Background Remover</h2>
			<p class="mt-1 text-sm text-text-muted">
				Remove image backgrounds instantly in your browser. No upload, no signup, no watermark.
			</p>
		</a>
	</div>
</div>
