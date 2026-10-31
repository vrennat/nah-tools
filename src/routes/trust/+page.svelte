<svelte:head>
	<title>How it works — nah</title>
	<meta name="description" content="How nah.tools works: local browser processing, hosted links and bio pages, model downloads and practical limits." />
	<meta property="og:title" content="How it works — nah" />
	<meta property="og:description" content="Local browser tools, hosted redirects and public bio pages. What runs where and what to expect." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools/trust" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl space-y-10 py-8">
	<header class="space-y-4">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl">How it works</h1>
		<p class="text-xl text-text-muted">Most tools run on your device. A few need a hosted service. Here is what that means in practice.</p>
	</header>
	<section class="space-y-3">
		<h2 class="font-display text-2xl font-700">Local file processing</h2>
		<p class="leading-relaxed text-text-muted">
			PDF editing, image conversion, background removal, media processing and transcription run in
			your browser using JavaScript, WebAssembly and, where supported, WebGPU. Resume and invoice
			generation also happen locally. These browser tools do not upload your source files for processing.
			Drafts and progress may be stored in this browser, so export a backup before clearing site data.
		</p>
		<p class="leading-relaxed text-text-muted">
			Your device supplies the memory and processing power. Large files, long recordings and bigger
			AI models can be slow or exceed available memory, especially on a phone. Lossy conversion and
			compression can reduce quality; inspect the output and keep the original.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="font-display text-2xl font-700">Downloads and connections</h2>
		<p class="leading-relaxed text-text-muted">
			Local processing still needs software. FFmpeg downloads from unpkg, transcription models from
			Hugging Face and background-removal models from a Cloudflare R2 host. The site also loads
			Google Fonts. Downloads contact those providers without turning file processing into a server upload.
		</p>
		<p class="leading-relaxed text-text-muted">
			A tool may keep working offline after its code and resources have loaded, but this depends on
			browser caching and the tool. First use and missing resources need a connection. Offline use
			is not guaranteed across reloads or after clearing browser data.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="font-display text-2xl font-700">Hosted features</h2>
		<p class="leading-relaxed text-text-muted">
			Short links and dynamic QR codes store redirect destinations and settings on Cloudflare D1
			with KV caching. Link-in-bio pages store and publish the profile and links you provide.
			These features depend on the hosted service; a static QR code instead contains its data directly.
			Management uses passphrases stored as bcrypt hashes, without an account signup.
		</p>
		<p class="leading-relaxed text-text-muted">
			Protected redirects record click details including location fields, device category, referrer
			and a shortened user-agent string. Bio pages count views and record link-click details.
			Rate limiting and optional Turnstile verification also use request information. Deactivation
			disables a hosted record rather than deleting it. Read the <a href="/privacy" class="text-accent underline">privacy policy</a>
			for the stored fields and the limits of what is known about infrastructure logging and retention.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="font-display text-2xl font-700">Cost and availability</h2>
		<p class="leading-relaxed text-text-muted">
			Running computation in your browser reduces server processing work, but hosting, bandwidth,
			model delivery and databases still have costs. The source code does not verify a current
			monthly bill or guarantee future capacity, pricing or availability. Hosted APIs also apply rate limits.
		</p>
		<p class="leading-relaxed text-text-muted">
			The <a href="https://github.com/vrennat/nah-tools" class="text-accent underline">MIT-licensed source</a>
			is available to inspect and self-host. Self-hosting hosted features requires configuring their
			infrastructure and dependencies. You can also use your browser’s network tools to inspect the
			requests made by the feature you are using; source code alone cannot reveal every live hosting setting.
		</p>
	</section>
	<div class="rounded-xl border border-border bg-surface p-8 text-center">
		<a href="/" class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover">Explore all tools</a>
	</div>
</article>
