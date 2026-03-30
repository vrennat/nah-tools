<svelte:head>
	<title>nah — Free tools. No catch.</title>
	<meta name="description" content="QR codes, PDFs, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools" />
	<meta property="og:title" content="nah — Free tools. No catch." />
	<meta property="og:description" content="QR codes, PDFs, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />
	<meta property="og:image" content="https://nah.tools/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="nah — Free tools. No catch." />
	<meta name="twitter:description" content="QR codes, PDFs, links, resumes, invoices — all free, private, and open source. No signup, no tracking, most tools run in your browser." />
	<meta name="twitter:image" content="https://nah.tools/og.png" />
</svelte:head>

<div class="relative">
	<!-- Hero -->
	<section class="relative flex flex-col items-center pt-8 pb-6 sm:pt-12 sm:pb-10">
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
			class="animate-fade-up mt-6 max-w-xl text-center text-base leading-relaxed text-text-muted sm:mt-8 sm:text-lg"
			style="animation-delay: 200ms;"
		>
			Other "free" tools upload your files, limit your usage, then paywall the download. We don't. Everything runs in your browser. Your files never leave your device. It costs us $5/month to run this for everyone. The code is on <a href="https://github.com/vrennat/nah-tools" class="text-text underline decoration-border underline-offset-4 hover:decoration-accent">GitHub</a>.
		</p>
	</section>

	<!-- Tools -->
	<section class="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
		<a
			href="/pdf"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 320ms;"
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
			href="/photo/rm-bg"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 400ms;"
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

		<a
			href="/resume"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 480ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Resume Builder</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				ATS-optimized templates, job matching, PDF and DOCX export. Everything stays in your browser.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>

		<a
			href="/qr"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 560ms;"
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
			href="/invoice"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 640ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Invoice Generator</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Professional invoices, estimates, and receipts. Multi-currency, tax support, PDF and CSV export.
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
			style="animation-delay: 720ms;"
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
			href="/bio"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 800ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Link in Bio</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Your links, your page. No signup, no monthly fees. Just a clean profile you control.
			</p>
			<div class="mt-5 flex items-center gap-1.5 text-sm font-medium text-accent opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1">
				Get started
				<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
				</svg>
			</div>
		</a>

		<a
			href="/remove"
			class="animate-fade-up group relative overflow-hidden rounded-2xl border border-border bg-surface-alt p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
			style="animation-delay: 880ms;"
		>
			<div class="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
				</svg>
			</div>
			<h2 class="font-display text-xl font-700 text-text group-hover:text-accent transition-colors duration-300">Data Removal</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">
				Remove your personal data from 25+ data brokers. Step-by-step guides and pre-filled opt-out emails.
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
