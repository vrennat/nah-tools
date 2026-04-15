<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Image Converter Shakedown"
	description="Every iPhone user needs HEIC-to-JPG conversion. Every converter site uploads your photos to their servers first."
	slug="convert"
	datePublished="2026-04-01"
	dateModified="2026-04-01"
/>

<svelte:head>
	<title>The Image Converter Shakedown — nah</title>
	<meta
		name="description"
		content="Every iPhone user needs HEIC-to-JPG conversion. Every converter site uploads your photos to their servers first."
	/>
	<meta property="og:title" content="The Image Converter Shakedown" />
	<meta
		property="og:description"
		content="Every iPhone user needs HEIC-to-JPG. Every converter site uploads your photos to their servers. Here's why that's absurd."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/convert" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Image Converter Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			Your browser can convert images natively, for free, without touching a server. A half-dozen
			companies built subscription businesses on the assumption you don't know that.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Imagine this: your daughter emails you a photo from her iPhone. Your Windows PC can't open it.
			You search "convert HEIC to JPG free," click the first result, and drag your photo into the
			upload box. A progress bar spins. A download button appears. You click it, open the file, and
			it works. Problem solved.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What you didn't see: your photo — a private image from a family member's phone — just traveled
			to a server in another country, was decoded, re-encoded, and stored there for an unspecified
			period of time. The company that owns that server may retain it for "service improvement." You
			agreed to this in a terms-of-service document you never read. And the entire operation —
			converting a photo from one format to another — could have run entirely on your own machine,
			in your browser, in under a second, without sending a single byte to anyone.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			The file upload was never necessary. It was a business decision.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Apple created a problem that nobody had to exploit
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			In September 2017, Apple shipped iOS 11 with a quiet change: iPhones started saving photos in
			HEIC format by default. HEIC (High Efficiency Image Container) is technically superior to
			JPEG — it achieves roughly twice the compression at the same visual quality. Apple made the
			switch because it saves storage space on device.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The problem is compatibility. HEIC is based on the HEIF standard, which requires patent
			licensing. Windows didn't natively support it until 2018, and even then only through a paid
			codec extension in the Microsoft Store. Android support arrived gradually, inconsistently.
			Many photo editing apps, email clients, and web platforms still don't handle HEIC. The result:
			hundreds of millions of iPhone users produce photos that a substantial fraction of their
			recipients can't open.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			"HEIC to JPG" became one of the most-searched image conversion queries on the internet almost
			overnight. Anyone who emails iPhone photos to a Windows or Android user eventually hits this
			wall. Parents emailing photos to grandparents. Realtors sending listing photos to clients.
			Students submitting assignments. Every one of them lands on a converter site.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">What the search results look like</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Search "HEIC to JPG" and you'll find pages of results: HEICtoJPG.com, iLoveIMG, Convertio,
			FreeConvert, Zamzar, CloudConvert, and a rotation of single-purpose sites with names like
			"heictojpg.io" or "convertHEIC.com." Every one of them asks you to upload your file. Most
			plaster ads across every available surface. Several hit you with rate limits after one or two
			conversions. A few redirect you to subscription plans after the first file.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The browser-based alternative — zero upload, instant conversion, completely free — does not
			appear on the first page. It requires knowing that the technology exists and searching
			specifically for it. The people who need it most are the ones least likely to know.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What these services actually charge
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The converter market has consolidated around a handful of companies running nearly identical
			playbooks: a free tier with meaningful restrictions, then a subscription to remove them.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">CloudConvert</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			CloudConvert uses a credit-based pricing model. Free users get 25 conversion minutes per day —
			which sounds generous until you realize that "minutes" refers to server processing time, not
			wall-clock time, and that the meter is deliberately opaque. Paid plans run
			<strong class="text-text">$10 to $25 per month</strong>, or you can buy one-time credit
			packages. Every file you convert is uploaded to their infrastructure. Their privacy policy
			states files are retained for up to 24 hours by default, but paying users can extend storage.
			CloudConvert is a legitimate business with real infrastructure costs — but those costs exist
			because they chose a server-side architecture, not because server-side conversion is
			technically necessary.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Zamzar</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Founded in 2006, Zamzar is one of the oldest converter services on the web. Its age shows in
			the pricing: <strong class="text-text">$18 to $70 per month</strong> depending on the plan.
			Free accounts are limited to 2 simultaneous conversions and a 50MB file size cap. Above that,
			you subscribe. Zamzar supports an impressive range of formats — over 1,200 — but that breadth
			doesn't explain why converting a HEIC photo to JPG requires paying $18 a month. The
			conversion logic is the same regardless of where it runs. Zamzar just built it on a server
			before browsers were capable of running it locally.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Convertio</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Owned by Softo, Convertio limits free users to files under 100MB and caps the number of
			concurrent conversions. Paid plans run <strong class="text-text">$10 to $26 per month</strong>.
			Convertio is notable for its SEO — it ranks for what feels like every possible format
			combination search query. The business appears to be primarily an SEO and ad arbitrage play:
			capture high-intent search traffic, monetize it with ads on the free tier, and convert a
			fraction of users to subscriptions.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">iLoveIMG</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Part of the iLovePDF family of tools, iLoveIMG offers free conversion with watermarks and
			rate limits, then charges <strong class="text-text">$7 per month</strong> to remove them. The
			watermark tactic is particularly aggressive: they return a degraded version of your own file
			until you pay to get the unmodified result. That's not a feature — it's deliberate damage to
			your file used as purchase incentive.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">FreeConvert</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			The name "FreeConvert" does a lot of work. The free tier exists, technically, but the
			experience is built to make you leave it: interstitial ads between steps, file size limits,
			daily conversion caps, and slow queue times on free accounts. Paid plans run
			<strong class="text-text">$10 to $25 per month</strong>. FreeConvert's ad density on the
			free tier is among the highest of any converter site — multiple auto-playing video ads compete
			for attention on a page where the only task is waiting for a file to download.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">
			The single-purpose sites
		</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Below the branded services sits a layer of single-purpose sites: HEICtoJPG.com and its
			variants, format-specific converters with keyword-optimized domain names. These are almost
			uniformly ad-infested, often poorly maintained, and exist primarily to capture long-tail
			search traffic. Many are built on the same underlying converter libraries. The user experience
			ranges from tolerable to actively hostile: pop-up ads, fake download buttons designed to trick
			you into clicking an ad instead of your file, and conversion limits that reset after you
			disable your ad blocker.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 leading-relaxed text-text-muted">
				Converting one HEIC file to JPG requires approximately
				<strong class="text-text">50 milliseconds of CPU time</strong> on a modern device.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				At AWS Lambda pricing, that's roughly
				<strong class="text-text">$0.000001 per conversion</strong> — one hundred-thousandth of a cent.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				Zamzar's basic paid plan allows 100 concurrent conversions for
				<strong class="text-text">$18/month</strong>.
			</p>
			<p class="leading-relaxed text-text">
				The markup on the underlying computation is somewhere around
				<strong class="text-2xl text-accent">1,000,000%</strong>.
			</p>
		</div>

		<p class="mb-4 leading-relaxed text-text-muted">
			Infrastructure, bandwidth, and customer support cost real money. The comparison above
			understates those costs. But even accounting generously for overhead, the prices these
			services charge are not justified by server costs. They're justified by the fact that most
			users don't know another option exists.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The privacy problem nobody talks about
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Format conversion is a mechanical operation. It requires no intelligence, no cloud services,
			no specialized hardware. It's arithmetic: read the source file format, decode it to raw pixel
			data, encode it in the target format. The math runs the same whether it happens on a server
			or in your browser.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Yet every major converter site uploads your files to their servers before converting them.
			This means that every photo you've ever converted using one of these services — every
			family snapshot, every screenshot of a private conversation, every document you photographed
			with your phone — traveled to a third-party server before coming back to you. You consented
			to this, technically, when you clicked "I agree" on a terms-of-service document.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What happens to those files after conversion? The answers vary by service, and they're rarely
			reassuring. CloudConvert retains files for up to 24 hours. Convertio's policy says files are
			"automatically deleted" but doesn't specify when. Zamzar's terms note that files may be
			retained for "operational purposes." Several services include language allowing use of
			uploaded content for "service improvement" — vague wording that could cover a range of uses.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Think about what people actually convert:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6 text-text-muted">
			<li class="leading-relaxed">
				<strong class="text-text">Medical documents:</strong> A scan of a prescription, an insurance
				card, a doctor's note photographed with an iPhone.
			</li>
			<li class="leading-relaxed">
				<strong class="text-text">Personal photos:</strong> Family moments, children, private images
				shared between partners.
			</li>
			<li class="leading-relaxed">
				<strong class="text-text">Financial documents:</strong> Screenshots of bank statements,
				receipts, tax documents photographed for records.
			</li>
			<li class="leading-relaxed">
				<strong class="text-text">Legal documents:</strong> Contracts, ID cards, sensitive
				correspondence captured as images.
			</li>
		</ul>
		<p class="mb-4 leading-relaxed text-text-muted">
			None of these need to leave your device to be converted. Every person who uploaded them
			to a converter site did so because they didn't know they had another option.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Your browser has been able to do this for years
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The browser-based alternative isn't a compromise. It's technically equivalent to server-side
			conversion and, in many cases, faster — because it eliminates the upload and download round-trip.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">The Canvas API</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every modern browser includes a Canvas API that can decode and encode image data. Converting
			a PNG to JPEG, or a WebP to PNG, is literally three lines of JavaScript: draw the image onto
			a canvas element, call <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">canvas.toBlob()</code>
			with the target MIME type, and download the result. No network request. No server. No
			subscription. This has worked in Chrome, Firefox, and Safari for over a decade.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">WebAssembly codecs</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			For formats that browsers don't natively encode — AVIF, HEIC, and others — WebAssembly
			brings native-speed codecs directly into the browser. The
			<code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">@jsquash</code> library
			family, developed by engineers at Google, provides encode and decode support for JPEG, PNG,
			WebP, AVIF, and JPEG XL — all running in WebAssembly at near-native speed. The
			<code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">heic2any</code> library
			handles HEIC decoding in the browser using a WebAssembly port of libheif. These libraries
			are open-source, actively maintained, and used by production applications serving millions
			of users.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The technical foundation has existed for years. The converter services haven't moved to it
			because doing so would eliminate their ability to impose rate limits and justify subscriptions.
			A browser-based converter can't throttle you — there's no server to throttle from.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">The rate-limit dark pattern</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Free tiers on converter sites typically limit you to 1 to 5 conversions before hitting a
			paywall. The framing is always "server resources" or "fair use." The reality: a modern server
			can convert thousands of HEIC files per minute. The compute cost per conversion is
			functionally zero. The limit exists not because resources are scarce, but because the limit
			is the product — it's the mechanism that converts free users into paying ones.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			A browser-based converter has no such limit because there are no server resources to protect.
			You can convert a thousand images in a batch. The only limit is your device's processor speed,
			and modern devices are fast enough that you'll never notice.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Who gets hurt
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Image format friction disproportionately affects people with the least technical context to
			navigate around it. These aren't power users who can script a batch conversion with
			ImageMagick. They're ordinary people who just want to open a photo.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Grandparents</strong> who get HEIC files from their kids and
			grandkids on iPhones. They know how to open email attachments. They don't know what HEIC is,
			and when a photo won't open, they don't know why. They end up on a converter site and don't
			think twice about uploading a family photo to a server they've never heard of.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small business owners</strong> who photograph products with an
			iPhone and need JPGs for their website or marketplace listings. They convert files a few
			times a week, which is enough to hit free tier limits. They either pay a subscription or
			waste time managing upload quotas.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Designers working cross-platform</strong> who need to deliver
			assets in specific formats for clients or developers. WebP from a design tool, AVIF for web
			optimization, PNG for print — format conversion is a daily task. They often know enough to
			be frustrated by the tooling but not enough to know that browser-based alternatives exist.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Anyone who emailed a photo and got "can't open this file" back.</strong>
			This is the largest group by far. They're not trying to do anything complicated. They took a
			photo, sent it to someone, and it didn't work. Every converter site is waiting at the top of
			the search results.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Why the free alternative stays buried
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Browser-based image conversion isn't new. The technology has been viable for years. So why
			don't people know about it?
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Search engine economics.</strong> CloudConvert, Zamzar, and
			Convertio spend significant resources on SEO and search advertising. They have domain
			authority built over years, thousands of inbound links, and the budget to bid on every
			relevant keyword. A browser-based alternative without a marketing budget and without
			SEO investment won't appear on the first page for "HEIC to JPG" — regardless of how
			much better it is for users.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">The "upload" metaphor feels natural.</strong> People are
			accustomed to uploading files for processing — that's how document editors, cloud storage,
			and email work. The idea that a website could convert a file without receiving it first
			isn't intuitive if you don't understand how browsers work. Converter sites exploit this
			mental model by making the upload feel like the only possible mechanism.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Incumbency compounds.</strong> The longer these services have
			existed and dominated search results, the harder it is for alternatives to displace them.
			Users who don't know to look for something different find the same sites every time.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The free alternative
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			We built <a href="/convert" class="text-accent underline hover:text-accent-hover">nah's image converter</a>
			because the upload was never necessary and the subscription was never justified.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			It runs entirely in your browser. Your files are never uploaded to any server. Conversion
			happens on your device using WebAssembly codecs and the browser's native Canvas API — the
			same technology stack that would be used in any competent browser-based implementation.
			There is no account, no trial, no rate limit, no subscription, and no catch.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Supported conversions include the formats that cover the vast majority of real use cases:
			HEIC to JPG, HEIC to PNG, WebP to JPG, WebP to PNG, PNG to JPG, JPG to PNG, SVG to PNG,
			and AVIF conversions in both directions, along with a full matrix of common format pairs.
			Batch conversion is supported — drop in a folder of HEIC files, get a ZIP of JPGs. No
			per-file limits.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Because nothing leaves your device, there's nothing to log, no privacy policy to read, and
			no question about what happens to your files after conversion. They stay where they started.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The source code is
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">public on GitHub</a>.
			You can read every line, verify that no network requests are made during conversion, and
			self-host the tool if you prefer.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How to protect yourself when using any converter
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Whether you use our tool or anything else, here's what to know before uploading an image file
			to a converter service.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Never upload sensitive images to a converter site.</strong>
				Medical documents, financial records, legal materials, and private photos have no business
				leaving your device for a format change. If you need to convert them, use a local app
				or a browser-based tool that explicitly states no upload occurs.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Check whether the converter requires an upload.</strong>
				A legitimate browser-based converter will not show a progress bar that says "uploading."
				If you see upload progress to a remote server, your file is leaving your device.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">On iPhone, you can often avoid conversion entirely.</strong>
				In Settings > Camera > Formats, switch from "High Efficiency" to "Most Compatible." Your
				iPhone will then shoot in JPEG instead of HEIC. You lose some storage efficiency but
				eliminate the compatibility problem at the source.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">On Mac, Preview can batch-convert HEIC files natively.</strong>
				Open all files in Preview, select them all, then File > Export Selected Images. No third-party
				software needed.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If a "free" converter asks for a credit card, it's a trial.</strong>
				A genuinely free tool doesn't need your payment information. Any converter that requires
				signup before downloading your result is likely running a freemium model with upcoming charges.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Image format conversion is a solved problem. The arithmetic is fifty years old. Every modern
			device has the processing power to run it locally in milliseconds. The server infrastructure,
			the upload step, the rate limits, and the subscription plans exist not because they're
			necessary, but because they're profitable — because the people who need this most don't know
			that the server was never part of the equation.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The pattern is the same across the converter market: find something people need to do
			occasionally, build a server-side version, capture the search traffic, and monetize the gap
			between what users know and what's technically possible. It works because technical opacity
			is a competitive advantage — as long as users don't know their browser can do this, they'll
			keep uploading.
		</p>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			Your photos don't need to leave your device. They never did.
		</p>
	</section>

	<InvestigationFooter slug="convert" />
</article>
