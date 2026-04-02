<svelte:head>
	<title>How it works — nah</title>
	<meta
		name="description"
		content="How nah.tools stays free: client-side architecture, $5/month infrastructure, no accounts, no tracking, open source. Here's the proof."
	/>
	<meta property="og:title" content="How it works — nah" />
	<meta property="og:description" content="How nah.tools stays free forever. Client-side tools, $5/month infrastructure, open source code." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools/trust" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			How it works
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			Other "free" tools upload your files, limit your usage, then paywall the download. We don't. Here's how.
		</p>
	</header>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Your files stay on your device</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			PDF merges, QR codes, background removal, resume builds, invoice generation — all of it runs in your browser. There is no upload. There is no server processing your files. The computation happens on your device using JavaScript and WebAssembly.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This isn't a privacy policy. It's architecture. You can verify it yourself: open the browser's network tab while using any tool. No file data leaves your machine.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The only features that touch a server are dynamic QR codes and short links, which need a database to store redirect URLs. Those use <a href="https://developers.cloudflare.com/d1/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Cloudflare D1</a> with passphrase-based auth — no accounts, no email collection.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What it costs us</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			nah.tools runs on <a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Cloudflare Workers</a> with KV caching and Analytics Engine. Static tools (PDF, QR codes, background removal, resumes, invoices) cost nothing to serve because they run entirely on your device. Dynamic features (short links, dynamic QR codes, link in bio) cost about <strong class="text-text">$0.80 per million requests</strong>.
		</p>
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
						<td class="py-3 pr-4">~$0.0000008 (one redirect)</td>
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
					<tr>
						<td class="py-3 pr-4">Link in bio page</td>
						<td class="py-3 pr-4">~$0.0000008 (one visit)</td>
						<td class="py-3">$5–24/month</td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Sustainability</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is a one-person project. The maintainer personally covers infrastructure costs. At current architecture, that budget handles <strong class="text-text">over a billion dynamic requests per month</strong> before it becomes a conversation. For reference, most funded startups never reach that.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			If nah.tools gets popular enough to matter, the plan is simple: accept donations from people who want to help, and keep running. If that ever stops working, the code is <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">MIT-licensed</a> — anyone can self-host the whole thing.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			There's no donate button yet. When there is, it'll be here. The tools are free either way.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The rules</h2>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No accounts.</strong> If a tool doesn't need to know who you are, it won't ask.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No tracking.</strong> No cookies, no fingerprinting. Basic <a href="https://www.cloudflare.com/web-analytics/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Cloudflare Web Analytics</a> that count page views without identifying visitors.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No ads.</strong> Not now, not later.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">No paywall.</strong> Every feature free for every user. No premium tiers, no daily limits, no watermarks.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Open source.</strong> The <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">full codebase</a> is MIT-licensed. Read every line, verify every claim, self-host the whole thing.</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Why these tools cost $0</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Over <strong class="text-text">$2.2 billion in venture capital</strong> has gone into companies that charge subscriptions for things your browser already does for free. The Better Business Bureau has documented <a href="https://www.bbb.org/all/scamstudies/free_trial_scams/free_trial_scams_full_study" target="_blank" rel="noopener noreferrer" class="text-text underline decoration-border underline-offset-4 hover:decoration-accent"><strong>$1.3 billion in consumer losses</strong></a> from the free trial traps these companies use.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The tools exist because the underlying technology is free. QR codes are an open ISO standard. PDF manipulation uses open-source JavaScript libraries. Background removal runs on open-source AI models. None of this requires a server, a subscription, or your credit card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Read the full investigation: <a href="/why" class="text-accent underline hover:text-accent-hover">Why nah exists</a>.
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
