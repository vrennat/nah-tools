<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
</script>

<ArticleSchema
	title="Consumer Protection Resources: How to Fight Back Against Predatory SaaS"
	description="Step-by-step guides for disputing charges, filing complaints, finding free alternatives, and protecting your data."
	slug="protect"
	datePublished="2026-03-30"
	dateModified="2026-03-30"
/>

<svelte:head>
	<title>Consumer Protection Resources — How to Fight Back Against Predatory SaaS</title>
	<meta
		name="description"
		content="Step-by-step guides for disputing unauthorized charges, filing complaints, removing your data from brokers, and finding free alternatives."
	/>
	<meta property="og:title" content="Consumer Protection Resources" />
	<meta property="og:description" content="How to dispute charges, file complaints, find free alternatives, and protect your data." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/protect" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Resources</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Protect Yourself
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How to dispute charges, file complaints, find free alternatives, and take back control of your data.
		</p>
	</header>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to dispute unauthorized charges</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			If you've been charged by a "free" tool that auto-converted to a paid subscription, you have options. Most banks will issue chargebacks for subscriptions you didn't knowingly consent to.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Call your bank or credit card company.</strong> Tell them you're disputing an unauthorized recurring charge. Use the words "I did not consent to this subscription." Most banks will immediately stop future charges and begin the chargeback process.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Document everything.</strong> Screenshot the misleading pricing page, the hidden trial terms, the broken cancel button. Take screenshots of any marketing that said "free." This evidence strengthens your dispute.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">File a complaint with the CFPB.</strong> The <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Consumer Financial Protection Bureau</a> handles complaints about unauthorized charges. Companies are legally required to respond.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Report to the FTC.</strong> File at <a href="https://reportfraud.ftc.gov/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">reportfraud.ftc.gov</a>. The FTC uses these reports to build cases against companies with patterns of deceptive practices.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Contact your state Attorney General.</strong> Find yours at <a href="https://www.naag.org/find-my-ag/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">naag.org/find-my-ag</a>. State AGs have enforcement power over businesses operating in their state.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Where to file complaints</h2>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">Organization</th>
						<th class="py-3 pr-4 font-semibold text-text">What they handle</th>
						<th class="py-3 font-semibold text-text">Link</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">CFPB</td>
						<td class="py-3 pr-4">Unauthorized financial charges</td>
						<td class="py-3"><a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">File complaint</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">FTC</td>
						<td class="py-3 pr-4">Deceptive business practices, fraud</td>
						<td class="py-3"><a href="https://reportfraud.ftc.gov/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Report fraud</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">BBB</td>
						<td class="py-3 pr-4">Business complaints (public record)</td>
						<td class="py-3"><a href="https://www.bbb.org/file-a-complaint" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">File complaint</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">State AG</td>
						<td class="py-3 pr-4">Consumer protection enforcement</td>
						<td class="py-3"><a href="https://www.naag.org/find-my-ag/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Find your AG</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Apple App Store</td>
						<td class="py-3 pr-4">Subscription fraud in iOS apps</td>
						<td class="py-3"><a href="https://reportaproblem.apple.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Report a problem</a></td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Google Play</td>
						<td class="py-3 pr-4">Subscription fraud in Android apps</td>
						<td class="py-3"><a href="https://support.google.com/googleplay/answer/2853570" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Request refund</a></td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Free alternatives directory</h2>
		<p class="mb-6 leading-relaxed text-text-muted">
			For every predatory tool, there's a free open-source alternative. These are the ones we've verified.
		</p>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">Category</th>
						<th class="py-3 pr-4 font-semibold text-text">Open-source alternatives</th>
						<th class="py-3 font-semibold text-text">nah tool</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">QR codes</td>
						<td class="py-3 pr-4"><a href="https://github.com/nickinchiling/qr-code-styling-examples" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">qr-code-styling</a></td>
						<td class="py-3"><a href="/qr" class="text-accent underline hover:text-accent-hover">nah.tools/qr</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">PDF tools</td>
						<td class="py-3 pr-4"><a href="https://github.com/Stirling-Tools/Stirling-PDF" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Stirling-PDF</a>, <a href="https://tools.pdf24.org/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">PDF24</a>, <a href="https://pdf-lib.js.org/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">pdf-lib</a></td>
						<td class="py-3"><a href="/pdf" class="text-accent underline hover:text-accent-hover">nah.tools/pdf</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Resumes</td>
						<td class="py-3 pr-4"><a href="https://rxresu.me" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Reactive Resume</a>, <a href="https://www.open-resume.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">OpenResume</a></td>
						<td class="py-3"><a href="/resume" class="text-accent underline hover:text-accent-hover">nah.tools/resume</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Background removal</td>
						<td class="py-3 pr-4"><a href="https://github.com/danielgatis/rembg" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">rembg</a>, <a href="https://github.com/nicolo-ribaudo/background-removal-js" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">@imgly/background-removal-js</a></td>
						<td class="py-3"><a href="/photo/rm-bg" class="text-accent underline hover:text-accent-hover">nah.tools/photo</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Link shorteners</td>
						<td class="py-3 pr-4"><a href="https://github.com/YOURLS/YOURLS" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">YOURLS</a>, <a href="https://github.com/sethcottle/littlelink" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">LittleLink</a></td>
						<td class="py-3"><a href="/links" class="text-accent underline hover:text-accent-hover">nah.tools/links</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Data broker removal</td>
						<td class="py-3 pr-4"><a href="https://cppa.ca.gov/data_broker_registry/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">CA DROP platform</a>, <a href="https://easyoptouts.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">EasyOptOuts</a> ($20/yr)</td>
						<td class="py-3"><a href="/remove" class="text-accent underline hover:text-accent-hover">nah.tools/remove</a></td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Invoices</td>
						<td class="py-3 pr-4"><a href="https://github.com/bpampuch/pdfmake" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">pdfmake</a>, <a href="https://invoiceninja.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Invoice Ninja</a></td>
						<td class="py-3"><a href="/invoice" class="text-accent underline hover:text-accent-hover">nah.tools/invoice</a></td>
					</tr>
				</tbody>
			</table>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Data broker opt-out quick reference</h2>
		<p class="mb-6 leading-relaxed text-text-muted">
			These 13 brokers cover the vast majority of your online exposure. Start here.
		</p>
		<div class="overflow-x-auto">
			<table class="w-full text-left text-sm">
				<thead>
					<tr class="border-b border-border">
						<th class="py-3 pr-4 font-semibold text-text">Broker</th>
						<th class="py-3 pr-4 font-semibold text-text">Method</th>
						<th class="py-3 font-semibold text-text">Opt-out link</th>
					</tr>
				</thead>
				<tbody class="text-text-muted">
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Spokeo</td>
						<td class="py-3 pr-4">Web form + email verification</td>
						<td class="py-3"><a href="https://www.spokeo.com/optout" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">BeenVerified</td>
						<td class="py-3 pr-4">Web form + email verification</td>
						<td class="py-3"><a href="https://www.beenverified.com/faq/opt-out/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Whitepages</td>
						<td class="py-3 pr-4">Web form + phone verification</td>
						<td class="py-3"><a href="https://www.whitepages.com/suppression-requests" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Intelius</td>
						<td class="py-3 pr-4">Web form (covers 18+ subsidiaries)</td>
						<td class="py-3"><a href="https://suppression.peopleconnect.us/login" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">TruePeopleSearch</td>
						<td class="py-3 pr-4">Web form + human verification</td>
						<td class="py-3"><a href="https://www.truepeoplesearch.com/removal" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Radaris</td>
						<td class="py-3 pr-4">Web form</td>
						<td class="py-3"><a href="https://radaris.com/control/privacy" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">MyLife</td>
						<td class="py-3 pr-4">Email request</td>
						<td class="py-3"><a href="https://www.mylife.com/privacy-policy#rights" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Privacy policy</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">Acxiom</td>
						<td class="py-3 pr-4">Web form</td>
						<td class="py-3"><a href="https://www.acxiom.com/optout/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">LexisNexis</td>
						<td class="py-3 pr-4">Web form + identity verification</td>
						<td class="py-3"><a href="https://optout.lexisnexis.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">FastPeopleSearch</td>
						<td class="py-3 pr-4">Web form</td>
						<td class="py-3"><a href="https://www.fastpeoplesearch.com/removal" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">PeopleFinder</td>
						<td class="py-3 pr-4">Web form</td>
						<td class="py-3"><a href="https://www.peoplefinder.com/optout.php" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr class="border-b border-border/50">
						<td class="py-3 pr-4">USSearch</td>
						<td class="py-3 pr-4">Web form</td>
						<td class="py-3"><a href="https://www.ussearch.com/privacylock" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Opt out</a></td>
					</tr>
					<tr>
						<td class="py-3 pr-4">Pipl</td>
						<td class="py-3 pr-4">Email request</td>
						<td class="py-3"><a href="https://pipl.com/privacy/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Privacy policy</a></td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-4 leading-relaxed text-text-muted">
			California residents: use the <a href="https://cppa.ca.gov/data_broker_registry/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">DROP platform</a> to submit a single deletion request covering all 543+ registered brokers. Or use <a href="/remove" class="text-accent underline hover:text-accent-hover">nah.tools/remove</a> to generate pre-filled opt-out emails for the brokers above.
		</p>
		<p class="mt-4 leading-relaxed text-text-muted">
			Read the <a href="/why/remove" class="text-accent underline hover:text-accent-hover">full data broker investigation</a> for more context on how these companies operate.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Credit and identity protection</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Freezing your credit is free, takes about 10 minutes per bureau, and prevents unauthorized accounts from being opened in your name. It does not affect your credit score.
		</p>
		<div class="space-y-3">
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.equifax.com/personal/credit-report-services/credit-freeze/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Freeze your Equifax credit</a>
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.experian.com/freeze/center.html" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Freeze your Experian credit</a>
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.transunion.com/credit-freeze" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Freeze your TransUnion credit</a>
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.annualcreditreport.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Get your free annual credit report</a> (the only site authorized by federal law)
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.identitytheft.gov/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">identitytheft.gov</a> — FTC's recovery plan if your identity has been stolen
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Government form sources</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Never fill out government forms on third-party websites. These are the official sources:
		</p>
		<div class="space-y-3">
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.irs.gov/forms-instructions" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">IRS.gov</a> — All federal tax forms (W-4, 1099, W-9, etc.)
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.uscis.gov/forms" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">USCIS.gov</a> — Immigration forms
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.usa.gov/motor-vehicle-services" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">USA.gov</a> — DMV and motor vehicle forms by state
			</p>
			<p class="leading-relaxed text-text-muted">
				<a href="https://www.uscourts.gov/forms" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">USCourts.gov</a> — Federal court forms
			</p>
		</div>
		<p class="mt-4 leading-relaxed text-text-muted">
			Read the <a href="/why/pdf" class="text-accent underline hover:text-accent-hover">PDF tools investigation</a> for details on how companies like PDFFiller rank above these sites and charge $96/year for forms that are free.
		</p>
	</section>

	<footer class="mt-12 border-t border-border pt-8 pb-4">
		<p class="text-sm text-text-muted">
			Part of the <a href="/why" class="text-accent hover:text-accent-hover">nah investigation series</a>. All tools at <a href="/" class="text-accent hover:text-accent-hover">nah.tools</a> are free, open source, and run in your browser.
		</p>
	</footer>
</article>
