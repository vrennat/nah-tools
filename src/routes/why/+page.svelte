<svelte:head>
	<title>Why nah exists — $2.2 Billion in VC to Charge You for Things Your Browser Can Do for Free</title>
	<meta
		name="description"
		content="Over $2.2 billion in venture capital has gone into companies that charge subscriptions for things your browser already does for free. Here's the evidence."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Why nah
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			$2.2 billion in venture capital to charge you for things your browser can do for free.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			There's a pattern in software that most people don't think about until it happens to them. You need a QR code, so you google "free QR code generator." You find one, make your code, print it on 200 wedding invitations. Two weeks later the code stops working. It was a 14-day trial, and now you either pay $120/year or reprint everything.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			I started looking into how widespread this actually is. It's not a few shady companies. It's an entire industry. Over <strong class="text-text">$2.2 billion in venture capital</strong> has gone into companies that basically charge subscriptions for stuff your browser can already do for free. QR codes, PDF merges, resume exports, background removal. All of it runs client-side with open-source JavaScript libraries. The infrastructure cost is close to zero. The subscriptions exist because most people don't know that.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The Better Business Bureau has documented <strong class="text-text">$1.3 billion in consumer losses</strong> from "free trial offer" scams over the past decade. That's the world these tools operate in.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			So I built <a href="/" class="text-accent underline hover:text-accent-hover">nah.tools</a>. It's a free, open-source set of browser-based tools that replaces the worst offenders. No signup, no ads, no tracking, no catch. The QR code generator and link shortener took about two hours. The whole suite took a weekend. That's how simple this stuff actually is to build when you're not engineering a billing trap around it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Here's what I found when I looked into the companies nah is meant to replace.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The playbook</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every one of these companies runs some version of the same five steps.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Buy the search results.</strong> Spend on Google Ads and SEO until your product shows up above the genuinely free options. In some categories, one parent company owns multiple brands to take up several top results at once, creating a fake sense of competition.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Offer a "free" tool.</strong> Let the user start working. The interface looks polished. There's no mention of pricing anywhere. Everything feels real.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Collect their time.</strong> Let someone spend 30 to 60 minutes entering their work history into a resume builder. Let them upload and arrange sensitive tax documents into a PDF tool. Let them design a QR code and print it. The longer they work, the less likely they are to leave.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Trigger the trap.</strong> The paywall shows up right when you try to download. The resume you just spent an hour on? That'll be $2.95 for a "14-day trial." The trial auto-converts to $24 every four weeks. Not every month. Every four weeks. That's 13 billing cycles per year. No receipt emails are sent.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Make cancellation hard.</strong> Hide the cancel button. Break it when ad-blockers are on. Route billing receipts to an email address the user doesn't check. Some companies respond to cancellation attempts with chatbot loops for weeks.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-6 mt-12 font-display text-2xl font-700 text-text">The evidence</h2>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">Resume builders: four brands, one company, $628 million</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				BOLD LLC runs <strong class="text-text">Zety, LiveCareer, MyPerfectResume, and Resume Genius</strong>. Four websites that look like competitors. Same parent company. Same billing system. Same trap. Zety converts trials to <strong class="text-text">$25.95 every four weeks</strong>. Zety has a <strong class="text-text">1.3 out of 5 on PissedConsumer</strong> with 87% unfavorable reviews.
			</p>
			<a href="/why/resume" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">PDF tools: ranking above government websites</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				PDFFiller, owned by airSlate (<strong class="text-text">$1.25 billion valuation</strong>), shows up in Google results above actual government websites. People fill out forms with their Social Security numbers, then find out they can't save without subscribing. Soda PDF has a <strong class="text-text">1.0 out of 5 on PissedConsumer</strong> — the lowest rating I found anywhere.
			</p>
			<a href="/why/pdf" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">QR code generators: 1,500,000% markup</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				QR Code Generator Pro has <strong class="text-text">over 9,000 Trustpilot reviews at 1.5 out of 5 stars</strong>. A QR code takes a few lines of JavaScript and about one millisecond. They charge up to $38/month. That's a markup of about <strong class="text-text">1,500,000%</strong>.
			</p>
			<a href="/why/qr" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">Background removal: perfect result, ransomed resolution</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				remove.bg shows you a perfect result, then gives you a <strong class="text-text">625x400 pixel download</strong>. Your original was 4000x3000. PhotoRoom (<strong class="text-text">$94.5 million ARR</strong>) downgraded paying users' plans mid-contract and refused refunds.
			</p>
			<a href="/why/photo" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">Link shorteners: $348/year for a database lookup</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				A redirect takes 4 milliseconds and costs half a millionth of a dollar. Bitly charges <strong class="text-text">$348/year</strong>. Linktree raised <strong class="text-text">$167 million</strong> for what is architecturally a static HTML page.
			</p>
			<a href="/why/links" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">Data brokers: a subscription to exercise your legal rights</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				DeleteMe charges $129/year but Consumer Reports found it only achieved a <strong class="text-text">27% removal rate</strong>. EasyOptOuts at $19.99/year hit <strong class="text-text">65%</strong>. California's DELETE Act made the core function free in January 2026.
			</p>
			<a href="/why/remove" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>

		<div class="mb-8 rounded-lg border border-border bg-surface-alt p-6">
			<h3 class="mb-2 text-xl font-semibold text-text">Invoice tools: "free forever" until the acquisition check clears</h3>
			<p class="mb-3 leading-relaxed text-text-muted">
				Wave served 400,000+ businesses for free, got acquired for <strong class="text-text">$405 million</strong>, then paywalled core features. BBB rating collapsed to <strong class="text-text">1.03 out of 5</strong>. FreshBooks locks your data when you cancel. An invoice is structured text rendered as a PDF.
			</p>
			<a href="/why/invoice" class="text-sm font-medium text-accent hover:text-accent-hover">Read the full investigation &rarr;</a>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What it actually costs to run these tools</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">What nah does</th>
						<th class="py-3 pr-4 font-semibold text-text">What it costs us</th>
						<th class="py-3 font-semibold text-text">What others charge</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Generate a QR code</td>
						<td class="py-3 pr-4">$0.00 (your browser)</td>
						<td class="py-3">$120–564/year</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Merge a PDF</td>
						<td class="py-3 pr-4">$0.00 (your browser)</td>
						<td class="py-3">$96/year</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Remove a background</td>
						<td class="py-3 pr-4">$0.00 (your browser)</td>
						<td class="py-3">$2/image or $99/month</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Build a resume</td>
						<td class="py-3 pr-4">$0.00 (your browser)</td>
						<td class="py-3">$24/month (every 4 weeks)</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Shorten a link</td>
						<td class="py-3 pr-4">~$0.000003 (one redirect)</td>
						<td class="py-3">$348/year (Bitly Pro)</td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Remove data broker listings</td>
						<td class="py-3 pr-4">$0.00 (pre-filled templates)</td>
						<td class="py-3">$78–129/year</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-6 leading-relaxed text-text-muted">
			nah.tools runs on Cloudflare Workers. Total infrastructure cost: <strong class="text-text">$5/month</strong> for up to 10 million dynamic requests. Static tools cost nothing to serve because the computation happens on your device, not ours.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			There is no business model pressure because there are almost no business costs. I don't need your email because I have nothing to email you about. I don't need your credit card because I have nothing to charge you for.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Why "free" tools aren't already winning</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Search results are bought, not earned.</strong> BOLD LLC runs four resume brands to take up multiple Google positions at once. PDFFiller outranks actual government websites for form searches. When you search "free resume builder," almost every top result is a subscription trap wearing the word "free."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">The audience isn't technical.</strong> The person who needs to merge a PDF doesn't know that pdf-lib exists. The person building a resume doesn't know that Reactive Resume has 28,000 GitHub stars. The gap between a polished website and a GitHub repo is the entire moat.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Urgency is the weapon.</strong> You need to merge a PDF before a meeting. You need a resume tonight for an application due tomorrow. You need a QR code before the print shop closes. The moment you're least likely to comparison-shop is the moment they ask for your credit card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Open-source alternatives are scattered.</strong> For every predatory tool, there are free replacements on GitHub. But they're spread across dozens of repos with different interfaces and no marketing. Nobody had put them all in one place with a real UI. That's what nah is.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What nah is</h2>
		<div class="space-y-3">
			<p class="leading-relaxed text-text-muted"><a href="/qr" class="font-semibold text-accent underline hover:text-accent-hover">QR Code Generator</a> — Seven QR types, full visual customization, batch export, dynamic codes. No trial, no expiration, no kill switch.</p>
			<p class="leading-relaxed text-text-muted"><a href="/pdf" class="font-semibold text-accent underline hover:text-accent-hover">PDF Tools</a> — Merge, split, compress, rotate, reorder, add page numbers, add watermarks, convert. 100% in your browser. Files never leave your device.</p>
			<p class="leading-relaxed text-text-muted"><a href="/links" class="font-semibold text-accent underline hover:text-accent-hover">Link Shortener</a> — Custom short links with click analytics and UTM tracking. No account.</p>
			<p class="leading-relaxed text-text-muted"><a href="/photo" class="font-semibold text-accent underline hover:text-accent-hover">Background Remover</a> — Full-resolution background removal. No upload, no watermark, no per-image fee.</p>
			<p class="leading-relaxed text-text-muted"><a href="/remove" class="font-semibold text-accent underline hover:text-accent-hover">Data Broker Removal</a> — Pre-filled opt-out emails and step-by-step guides for 25+ brokers. Your info stays on your device.</p>
			<p class="leading-relaxed text-text-muted"><a href="/resume" class="font-semibold text-accent underline hover:text-accent-hover">Resume Builder</a> — ATS-optimized templates with PDF and DOCX export. Your data never leaves your browser.</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The rules</h2>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No accounts.</strong> If a tool doesn't need to know who you are, it won't ask.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No tracking.</strong> No cookies, no fingerprinting. Basic Cloudflare analytics that count page views without identifying visitors.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No ads.</strong> Not now, not later.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No paywall.</strong> Every feature free for every user. No premium tiers, no daily limits, no watermarks.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Privacy by architecture, not policy.</strong> Static tools run in your browser. There is no server to send your data to. This isn't a promise. It's how the code works.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Open source.</strong> The <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">full codebase</a> is MIT-licensed. Read every line, verify every claim, self-host the whole thing.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Built to keep working without me.</strong> If I stopped maintaining this tomorrow, the static tools would keep running because they're just code in your browser. The tools are designed to outlast the person who built them.</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Why it's called nah</h2>
		<p class="mb-4 leading-relaxed text-text-muted">Because the correct response to a $564/year QR code generator is "nah."</p>
		<p class="mb-4 leading-relaxed text-text-muted">Because the correct response to a resume builder that holds your work history hostage is "nah."</p>
		<p class="mb-4 leading-relaxed text-text-muted">Because the correct response to a PDF tool that ranks above government websites and charges $96 for a form fill is "nah."</p>
		<p class="mb-4 leading-relaxed text-text-muted">Because the correct response to paying $2 per image for something your browser does for free is "nah."</p>
		<p class="mb-4 leading-relaxed text-text-muted">The internet is full of tools that should be free but aren't. They survive because most people don't know there's an alternative. Now there is.</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What's under the hood</h2>
		<p class="mb-6 leading-relaxed text-text-muted">nah is built on open-source libraries written by developers who solved these problems and gave their work away for free.</p>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">Tool</th>
						<th class="py-3 pr-4 font-semibold text-text">Key libraries</th>
						<th class="py-3 font-semibold text-text">What they do</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">QR codes</td>
						<td class="py-3 pr-4">qr-code-styling</td>
						<td class="py-3">Styled QR generation with logos and gradients, client-side</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">PDF tools</td>
						<td class="py-3 pr-4">pdf-lib, PDF.js</td>
						<td class="py-3">PDF manipulation and rendering in the browser</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Background removal</td>
						<td class="py-3 pr-4">ONNX Runtime Web, Transformers.js</td>
						<td class="py-3">AI model inference in the browser via WebAssembly/WebGPU</td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Image compression</td>
						<td class="py-3 pr-4">jSquash</td>
						<td class="py-3">WASM-compiled MozJPEG, OxiPNG, WebP, AVIF codecs</td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Resume builder</td>
						<td class="py-3 pr-4">pdf-lib</td>
						<td class="py-3">PDF generation from HTML templates</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-6 leading-relaxed text-text-muted">
			Built with <a href="https://kit.svelte.dev/" class="text-accent underline hover:text-accent-hover">SvelteKit</a> and deployed on <a href="https://workers.cloudflare.com/" class="text-accent underline hover:text-accent-hover">Cloudflare Workers</a>. Infrastructure cost: $5/month. <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">Source code</a> is MIT-licensed.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Help make this work</h2>
		<p class="mb-4 leading-relaxed text-text-muted">nah has no marketing budget, no ads, no VC money. It grows when people share it.</p>
		<ul class="mb-4 list-disc space-y-3 pl-6 text-text-muted">
			<li class="leading-relaxed"><strong class="text-text">Share the link.</strong> Send <a href="/" class="text-accent underline hover:text-accent-hover">nah.tools</a> to someone who needs a QR code, a PDF merge, or a resume. Drop it in a Reddit thread next time someone asks for a free alternative.</li>
			<li class="leading-relaxed"><strong class="text-text">Star the <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">GitHub repo</a>.</strong> It helps with discoverability.</li>
			<li class="leading-relaxed"><strong class="text-text">Contribute.</strong> Bug reports, feature requests, PRs, new tools. It's all open source.</li>
			<li class="leading-relaxed"><strong class="text-text">Tell the story.</strong> Link to this page. The tools work, but they only help people who know they exist.</li>
		</ul>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			No one should pay $564/year for a QR code. Help make sure they don't.
		</p>
	</section>

	<div class="mt-12 rounded-xl border border-border bg-surface p-8 text-center">
		<p class="mb-4 text-lg text-text">Ready to try tools that are actually free?</p>
		<a
			href="/"
			class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover"
		>
			Explore all tools
		</a>
	</div>
</article>
