<script lang="ts">
	import { articles } from '$lib/why/articles';
</script>

<svelte:head>
	<title>Why nah exists — $2.2 Billion in VC to Charge You for Things Your Browser Can Do for Free</title>
	<meta
		name="description"
		content="Over $2.2 billion in venture capital has gone into companies that charge subscriptions for things your browser already does for free. Here's the evidence."
	/>
	<meta property="og:title" content="Why nah exists" />
	<meta property="og:description" content="$2.2 billion in VC to charge you for things your browser can do for free. Here's the evidence." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools/why" />
	<meta name="twitter:card" content="summary_large_image" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		"name": "Why nah — Investigation Series",
		"description": "Investigations into predatory SaaS companies charging subscriptions for things your browser can do for free.",
		"url": "https://nah.tools/why",
		"isPartOf": { "@type": "WebSite", "name": "nah", "url": "https://nah.tools" }
	})}</script>`}
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
			So I built <a href="/" class="text-accent underline hover:text-accent-hover">nah.tools</a>. It's a free, open-source set of browser-based tools that replaces the worst offenders. No signup, no ads, no tracking, no catch.
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
		<h2 class="mb-6 mt-12 font-display text-2xl font-700 text-text">The investigations</h2>

		{#each articles as article}
			<a href="/why/{article.slug}" class="group mb-4 flex items-baseline justify-between rounded-lg border border-border p-5 transition-colors hover:border-accent/50 hover:bg-surface-alt">
				<div>
					<h3 class="text-lg font-semibold text-text group-hover:text-accent">{article.title}</h3>
					<p class="mt-1 text-sm text-text-muted">{article.summary}</p>
				</div>
				<span class="ml-4 shrink-0 text-sm text-text-muted group-hover:text-accent">&rarr;</span>
			</a>
		{/each}
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
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Remove data broker listings</td>
						<td class="py-3 pr-4">$0.00 (pre-filled templates)</td>
						<td class="py-3">$78–129/year</td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Create an invoice</td>
						<td class="py-3 pr-4">$0.00 (your browser)</td>
						<td class="py-3">$16–60/month</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-6 leading-relaxed text-text-muted">
			nah.tools runs on Cloudflare Workers. Total infrastructure cost: <strong class="text-text">$5/month</strong> for up to 10 million dynamic requests. Static tools cost nothing to serve because the computation happens on your device, not ours.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The rules</h2>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No accounts.</strong> If a tool doesn't need to know who you are, it won't ask.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No tracking.</strong> No cookies, no fingerprinting. Basic Cloudflare analytics that count page views without identifying visitors.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No ads.</strong> Not now, not later.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No paywall.</strong> Every feature free for every user. No premium tiers, no daily limits, no watermarks.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Privacy by architecture, not policy.</strong> Static tools run in your browser. There is no server to send your data to. This isn't a promise. It's how the code works.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Open source.</strong> The <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">full codebase</a> is MIT-licensed. Read every line, verify every claim, self-host the whole thing.</p>
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
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Help make this work</h2>
		<p class="mb-4 leading-relaxed text-text-muted">nah has no marketing budget, no ads, no VC money. It grows when people share it.</p>
		<ul class="mb-4 list-disc space-y-3 pl-6 text-text-muted">
			<li class="leading-relaxed"><strong class="text-text">Share the link.</strong> Send <a href="/" class="text-accent underline hover:text-accent-hover">nah.tools</a> to someone who needs a QR code, a PDF merge, or a resume.</li>
			<li class="leading-relaxed"><strong class="text-text">Star the <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">GitHub repo</a>.</strong> It helps with discoverability.</li>
			<li class="leading-relaxed"><strong class="text-text">Contribute.</strong> Bug reports, feature requests, PRs, new tools. It's all open source.</li>
			<li class="leading-relaxed"><strong class="text-text">Tell the story.</strong> Link to this page. The tools work, but they only help people who know they exist.</li>
		</ul>
		<p class="mt-4 leading-relaxed text-text-muted">
			Been charged by one of these companies? Check our <a href="/why/protect" class="text-accent underline hover:text-accent-hover">consumer protection resources</a> for how to dispute charges, file complaints, and find free alternatives.
		</p>
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
