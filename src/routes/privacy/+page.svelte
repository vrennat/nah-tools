<svelte:head>
	<title>Privacy Policy — nah</title>
	<meta name="description" content="How nah handles local file processing, hosted links and bio pages, browser storage and third-party requests." />
</svelte:head>

<article class="mx-auto max-w-3xl space-y-8">
	<header class="space-y-2">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">Privacy Policy</h1>
		<p class="text-sm text-text-muted">Last updated: October 31, 2026</p>
	</header>
	<p class="text-lg text-text-muted">
		Most tools process your files and text in your browser. Short links, dynamic QR codes and
		link-in-bio pages use hosted storage. Loading the site and downloading its tools also makes
		network requests, even when the file processing itself is local.
	</p>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Local tools and browser storage</h2>
		<p class="text-text-muted">
			The browser tools for PDFs, images, media, transcription, developer utilities and text process
			their inputs on your device. Static QR content is encoded locally. Resume and invoice drafts,
			data-removal progress and preferences can be saved in browser storage; downloaded AI models
			can also be cached there. Export important drafts before clearing site data. Data-removal
			links and request emails take you to third parties and share the information you submit to them.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Hosted links and public pages</h2>
		<p class="text-text-muted">
			Short links and dynamic QR codes store destination URLs, codes and any supplied labels,
			aliases, expiration dates and UTM fields in Cloudflare D1, with redirect caching in KV.
			Bio pages store your handle, display name, bio, avatar URL, theme and links. Published profile
			details and links are public, and external avatars are loaded from their image host.
		</p>
		<p class="text-text-muted">
			Management passphrases are sent to the server for creation or verification and stored as bcrypt
			hashes rather than plain text. A short link can be created without a passphrase; management
			features require a configured passphrase. Keep your management details somewhere safe.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Visits, clicks and abuse prevention</h2>
		<p class="text-text-muted">
			For passphrase-protected redirects, the redirect worker records the link code, time,
			country, city, region, device category, referring URL and up to 256 characters of the browser’s
			user-agent string in Cloudflare Analytics Engine. This click logging is skipped for redirects
			without a passphrase. Bio pages count views and link clicks; their click logs include country,
			device category and referring URL in D1.
		</p>
		<p class="text-text-muted">
			API requests use IP addresses for rate limiting. Link-abuse reports store the reason and reporter
			IP address when available. When Turnstile is configured, creation APIs verify its token with
			Cloudflare and include the request IP when available. These records are more than anonymous
			page counts and can contain information about a visit.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Network services and offline use</h2>
		<p class="text-text-muted">
			Cloudflare provides hosting, storage, redirects and abuse-prevention services. The page template
			loads Google Fonts. Media processing downloads FFmpeg from unpkg; transcription downloads
			models through Hugging Face; background removal downloads models from a Cloudflare R2 host.
			These hosts receive the requests needed to deliver those resources; local processing does not
			mean there are no third-party connections.
		</p>
		<p class="text-text-muted">
			Some local tools may work after their code and required models have loaded, but offline use is
			not guaranteed. A first download, missing cache or cleared browser storage needs a connection.
			Hosted links, bio publishing and management require the service to be online.
		</p>
		<p class="text-text-muted">
			The application source does not include a Cloudflare Web Analytics beacon or application-set
			cookies. This does not establish that hosting logs, deployment-added analytics or provider
			cookies are absent. Their live configuration and retention are not documented in this repository.
			See <a href="https://www.cloudflare.com/privacypolicy/" class="text-accent underline">Cloudflare’s privacy policy</a>
			for its handling of infrastructure data.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Deactivation and retention</h2>
		<p class="text-text-muted">
			Deactivating a link, dynamic code or bio page marks its record inactive; it does not erase the
			database record or associated analytics. Link expiration also does not delete stored data.
			The source does not define a complete retention or backup-deletion schedule, so we cannot
			promise that deactivation removes all stored information. Deleting an individual bio link uses
			a separate delete operation and does not establish deletion of its historical click logs.
		</p>
	</section>
	<section class="space-y-3">
		<h2 class="text-xl font-bold">Source and contact</h2>
		<p class="text-text-muted">
			You can inspect the implementation and page history in
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline">the source repository</a>.
			Source code describes application behavior, not every live infrastructure setting.
			For questions, open a <a href="https://github.com/vrennat/nah-tools/issues" class="text-accent underline">GitHub issue</a>;
			do not post passphrases or private data in a public issue.
		</p>
	</section>
</article>
