<svelte:head>
	<title>Privacy Policy — nah</title>
	<meta name="description" content="nah privacy policy. Static QR codes are generated entirely in your browser. We never see your data." />
</svelte:head>

<article class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-2">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">Privacy Policy</h1>
		<p class="text-sm text-text-muted">Last updated: March 2026</p>
	</header>

	<p class="text-lg text-text-muted">
		The short version: for static QR codes, we collect nothing. Your data never leaves your browser.
		For dynamic QR codes, we store only what's needed to make the redirect work. We don't sell data,
		we don't run ads, and we don't use cookies.
	</p>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Static QR Codes</h2>
		<p class="text-text-muted">
			When you generate a static QR code, all processing happens entirely in your web browser.
			The content you enter — URLs, text, WiFi passwords, contact info — is never sent to or stored
			on our servers. We never see it. This is a technical architecture choice, not just a policy
			promise. You can verify this by reading
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">our source code</a>
			or by using the tool with your internet connection disabled.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Dynamic QR Codes</h2>
		<p class="text-text-muted">
			If you create a dynamic QR code (one where you can change the destination after printing),
			we store the following:
		</p>
		<ul class="list-disc space-y-1 pl-6 text-text-muted">
			<li>The destination URL</li>
			<li>A bcrypt hash of your passphrase (not the passphrase itself)</li>
			<li>An optional label you provide</li>
			<li>A scan counter (a simple number — nothing about who scanned it)</li>
		</ul>
		<p class="text-text-muted">
			We do <strong>not</strong> store: your actual passphrase, any personally identifiable information,
			IP addresses of people who scan your codes, geolocation data, or device information.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Analytics</h2>
		<p class="text-text-muted">
			We use <a href="https://www.cloudflare.com/web-analytics/" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Cloudflare Web Analytics</a>,
			which is privacy-respecting: no cookies, no personal data collection, no tracking individual users.
			We do not use Google Analytics, tracking pixels, or any other third-party analytics scripts.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Cookies</h2>
		<p class="text-text-muted">We don't use cookies. Period.</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Third Parties</h2>
		<p class="text-text-muted">
			We use Cloudflare for hosting, CDN, and dynamic QR code redirects.
			<a href="https://www.cloudflare.com/privacypolicy/" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Cloudflare's privacy policy</a>
			applies to infrastructure-level data they process. We don't use any other third-party services.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Data Retention</h2>
		<p class="text-text-muted">
			Dynamic QR code data is retained until you deactivate it using your passphrase.
			We don't collect your email or any contact information, so we have no way to reach out to you
			about your data.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Open Source</h2>
		<p class="text-text-muted">
			You can verify every claim on this page by reading
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">our source code on GitHub</a>.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Changes</h2>
		<p class="text-text-muted">
			If we change this policy, the change will be visible in our
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">Git history</a>.
		</p>
	</section>

	<section class="space-y-3">
		<h2 class="text-xl font-700">Contact</h2>
		<p class="text-text-muted">
			Questions or concerns? Open an issue on
			<a href="https://github.com/vrennat/nah-tools/issues" class="text-accent underline decoration-border underline-offset-4 hover:decoration-accent">GitHub</a>.
		</p>
	</section>
</article>
