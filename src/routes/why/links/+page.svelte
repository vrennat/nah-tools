<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Link Shortener Shakedown: $348/Year for a Database Lookup That Takes 4 Milliseconds"
	description="A URL redirect costs half a millionth of a dollar. Bitly charges $348/year. Here's the evidence."
	slug="links"
	datePublished="2026-03-30"
	dateModified="2026-03-30"
/>

<svelte:head>
	<title>The Link Shortener Shakedown: $348/Year for a Database Lookup That Takes 4 Milliseconds</title>
	<meta
		name="description"
		content="A URL redirect costs half a millionth of a dollar. Bitly charges $348/year. Here's the evidence and a free alternative."
	/>
	<meta property="og:title" content="The Link Shortener Shakedown" />
	<meta property="og:description" content="A URL redirect costs half a millionth of a dollar. Bitly charges $348/year." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/links" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Link Shortener Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How companies charge $348/year for a database lookup that takes four milliseconds.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A short link does one thing. Someone clicks it. A server checks a table: "short code <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">abc123</code> maps to <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">https://your-actual-long-url.com/page</code>." The server sends a redirect. The browser goes to the real URL.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			That's the entire product. A database lookup and a redirect. Four milliseconds of computation. One of the simplest operations a server can perform.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			Bitly charges $348/year for this.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What a URL shortener actually does</h2>
		<ol class="mb-4 list-decimal space-y-2 pl-6 text-text-muted">
			<li class="leading-relaxed">A user clicks <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">short.link/abc123</code></li>
			<li class="leading-relaxed">The server looks up <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">abc123</code> in a key-value store</li>
			<li class="leading-relaxed">It finds the destination URL</li>
			<li class="leading-relaxed">It responds with an HTTP 301 or 302 redirect</li>
			<li class="leading-relaxed">The browser goes to the real URL</li>
		</ol>
		<p class="mb-4 leading-relaxed text-text-muted">
			Steps 2 through 4 take about <strong class="text-text">4 milliseconds</strong> on modern infrastructure. On Cloudflare Workers, a key-value lookup costs $0.50 per million reads. A single redirect costs roughly <strong class="text-text">$0.0000005</strong>. Half a millionth of a dollar.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The analytics features that paid plans offer (click counts, geographic data, device breakdowns, UTM tracking) are just metadata logged during step 2. This adds basically nothing to an already negligible cost.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What Bitly charges</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://www.crunchbase.com/organization/bitly" target="_blank" rel="noopener noreferrer">Bitly</a> has raised <strong class="text-text">$80 million+</strong> in venture capital. It's also the parent company of QR Code Generator Pro, <a href="/why/qr" class="text-accent underline hover:text-accent-hover">the QR tool with 9,000+ Trustpilot reviews at 1.5 stars</a>.
		</p>
		<div class="my-6 overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">Plan</th>
						<th class="py-3 pr-4 font-semibold text-text">Price</th>
						<th class="py-3 font-semibold text-text">Links/month</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50"><td class="py-3 pr-4">Free</td><td class="py-3 pr-4">$0</td><td class="py-3">10 links, 5 custom back-halves</td></tr>
					<tr class="border-b border-border/50"><td class="py-3 pr-4">Core</td><td class="py-3 pr-4">$96/year</td><td class="py-3">100 links/month</td></tr>
					<tr class="border-b border-border/50"><td class="py-3 pr-4">Growth</td><td class="py-3 pr-4">$348/year</td><td class="py-3">3,000 links/month</td></tr>
					<tr><td class="py-3 pr-4">Premium</td><td class="py-3 pr-4">$2,388/year</td><td class="py-3">10,000 links/month</td></tr>
				</tbody>
			</table>
		</div>
		<p class="mb-4 leading-relaxed text-text-muted">
			The free tier is capped at 10 links per month. That pushes anyone with regular use toward paid plans immediately.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Everyone else</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Rebrandly:</strong> $89 to $499/year. <strong class="text-text">Short.io:</strong> $240 to $600/year. <strong class="text-text">TinyURL</strong>, which was free for nearly two decades, now has paid plans at $120 to $600/year. <strong class="text-text"><a href="https://dub.co" target="_blank" rel="noopener noreferrer">Dub.co</a>:</strong> $288/year for Pro.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The Linktree connection</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://www.crunchbase.com/organization/linktree" target="_blank" rel="noopener noreferrer"><strong class="text-text">Linktree</strong></a> raised <strong class="text-text">$167 million</strong> and hit a <strong class="text-text">$1.3 billion valuation</strong> in 2022. The product is a single HTML page with a profile picture and a list of links. Hosting a static HTML page on Cloudflare costs $0.00.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Linktree Pro costs <strong class="text-text">$60/year</strong>. Premium is <strong class="text-text">$180/year</strong>. The free plan forces Linktree branding and takes a <strong class="text-text">12% commission on every digital product sale</strong>. A creator making $1,000/month through Linktree's free plan pays $1,440/year in fees for what is architecturally a static HTML page with a Stripe integration.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Linktree was created by its founders <strong class="text-text">in six hours</strong>. <a href="https://github.com/sethcottle/littlelink" class="text-accent underline hover:text-accent-hover">LittleLink</a> (8,000+ GitHub stars) replicates the whole thing as pure HTML/CSS with 100/100 PageSpeed scores.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who pays for this</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small businesses.</strong> A local shop using short links on menus and flyers needs maybe 20 to 50 links total. But Bitly's free tier caps at 10 per month, pushing them to a $96/year plan for redirects that cost nothing to maintain.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Content creators and marketers.</strong> The analytics are genuinely useful but they're just metadata logged alongside a redirect. Not a separate product.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Nonprofits.</strong> $348/year for a link shortener is a real budget line for organizations that count spending in hundreds.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Anyone with links already in circulation.</strong> Once a short link is on a flyer, in a PDF, or shared in a post, leaving the provider means either paying to keep old links alive or accepting that they'll break.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			I built <a href="/links" class="text-accent underline hover:text-accent-hover">nah.tools/links</a> because a database lookup shouldn't cost $348/year.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Custom short links at <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">go.nah.tools/your-alias</code> with click analytics, UTM parameter tracking, QR code generation for each link, and bulk creation via CSV (up to 500 links). No account. No signup. No credit card. No limit on the number of links.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The redirect infrastructure runs on Cloudflare Workers. Cost to me: <strong class="text-text">$5/month</strong> for up to 10 million redirects. <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">Source code</a> is MIT-licensed.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to protect yourself</h2>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Figure out what you actually need.</strong> A handful of short links with basic click counting doesn't require a $348/year plan.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Think about link longevity.</strong> If short links are going on printed materials, the provider's survival matters. Open-source and self-hostable options give you control.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Custom domains don't need a paid plan.</strong> Branded short links require a one-time DNS configuration, not a monthly fee.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">UTM parameters are free.</strong> Campaign tracking through UTM parameters is a URL convention, not a product feature.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Check what happens when you stop paying.</strong> If existing links break when you cancel, you're not paying for a tool. You're paying rent on your own URLs.</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A URL redirect is the web equivalent of a forwarding address at the post office. It takes a fraction of a second, costs a fraction of a penny, and requires a fraction of the infrastructure these companies charge for.
		</p>
	</section>

	<InvestigationFooter slug="links" />
</article>
