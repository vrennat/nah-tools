<svelte:head>
	<title>Nah Tools — Free, Open-Source Utilities</title>
	<meta name="description" content="Free, open-source developer and utility tools. No signup, no tracking, no catch." />
</svelte:head>

<div class="relative">
	<!-- Hero -->
	<section class="relative flex flex-col items-center pt-8 pb-16 sm:pt-16 sm:pb-24">
		<p
			class="animate-fade-up font-mono text-xs tracking-widest text-text-muted uppercase sm:text-sm"
			style="animation-delay: 60ms;"
		>
			Open source &middot; No accounts &middot; No tracking
		</p>

		<h1
			class="animate-fade-up mt-6 text-center font-display text-6xl leading-[0.9] font-800 tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
			style="animation-delay: 120ms;"
		>
			Free tools.<br />
			<span class="text-accent">No catch.</span>
		</h1>

		<p
			class="animate-fade-up mt-6 max-w-lg text-center text-lg text-text-muted sm:mt-8 sm:text-xl"
			style="animation-delay: 200ms;"
		>
			Utilities that respect your privacy. Everything runs in your browser. Everything is free. Forever.
		</p>
	</section>

	<!-- Tools -->
	<section class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
		<a
			href="/qr"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 280ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">QR Code Generator</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				URL, text, WiFi, vCard, email, phone, SMS. Full style customization, batch export, dynamic codes.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>

		<a
			href="/pdf"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 360ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">PDF Tools</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Merge, split, rotate, compress, and convert. 100% client-side — files never leave your device.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>

		<a
			href="/links"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 440ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Link Shortener</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Custom short links with click analytics, UTM builder, and QR codes. No signup required.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>
		<a
			href="/photo/rm-bg"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 520ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
					/>
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Background Remover</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Remove image backgrounds instantly in your browser. No upload, no signup, no watermark.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>
	</section>

</div>
