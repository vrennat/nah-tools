<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Data Broker Shakedown: How Companies Charge $129/Year to Exercise Rights You Already Have"
	description="DeleteMe charges $129/year but only achieves a 27% removal rate. The $20/year option hits 65%. Here's the evidence."
	slug="remove"
	datePublished="2026-03-30"
	dateModified="2026-03-30"
/>

<svelte:head>
	<title>The Data Broker Shakedown: How Companies Charge $129/Year to Exercise Rights You Already Have</title>
	<meta
		name="description"
		content="DeleteMe charges $129/year but only achieves a 27% removal rate. The $20/year option hits 65%. Here's the evidence and a free alternative."
	/>
	<meta property="og:title" content="The Data Broker Shakedown" />
	<meta property="og:description" content="DeleteMe charges $129/year but only achieves a 27% removal rate. The $20 option hits 65%." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/remove" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Data Broker Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How companies charge you $129/year to exercise rights you already have.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Search your own name on Google.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Somewhere in the first few pages, you'll find websites you've never heard of. Spokeo. BeenVerified. Whitepages. TruePeopleSearch. Radaris. They're showing your full name, home address, phone number, age, estimated income, family members' names. Sometimes your political affiliation. All freely available to anyone who searches for you.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You didn't sign up for any of these sites. Your data was collected from public records, data purchases, and commercial sharing agreements, then published without your knowledge.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You want it removed. So you search "how to remove my information from data brokers." The top results are paid services: DeleteMe at $129/year, Incogni at $78/year, Optery at $249/year. They're real services that do real work. But the core of what they do is something you can do yourself if someone shows you how.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What data brokers actually are</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Data brokers collect, package, and sell personal information. Some run consumer-facing people-search sites. Others sell data in bulk to marketers, insurance companies, and employers. Many do both. <strong class="text-text">543 data brokers are registered in California alone.</strong>
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Spokeo</strong> pulls from public records, social networks, and commercial sources. Opt-out requires finding your profile URL, submitting a form, solving a CAPTCHA, confirming via email.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">BeenVerified</strong> (also owns PeopleLooker and PeopleSmart) uses a web form with email verification. One opt-out per email address.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Whitepages</strong> has one of the hardest opt-out processes. It requires an actual automated phone call where you enter a verification code.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Intelius</strong> owns <strong class="text-text">18+ subsidiary sites</strong> including TruthFinder, Instant Checkmate, Zabasearch, and US Search. Opting out of Intelius should cover the subsidiaries, but users report inconsistent results.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The opt-out process is intentionally tedious. Each broker has its own form, its own verification method, its own processing time. The complexity isn't a technical limitation. It's a deterrent.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What the paid services actually do</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text"><a href="https://joindeleteme.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">DeleteMe</a></strong> ($129/year) uses a mix of automated scripts for 85 to 125 brokers and human "Privacy Advisors" for the rest. Their advertised "750+ brokers" count is misleading. Most are "Custom Requests" where the work shifts back to you.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text"><a href="https://incogni.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Incogni</a></strong> ($78/year, owned by Surfshark/Nord Security) sends templated deletion requests citing CCPA, GDPR, or PIPEDA to 420+ brokers.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text"><a href="https://easyoptouts.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">EasyOptOuts</a></strong> ($19.99/year) is the most interesting data point. 100% automated, zero human involvement, 200+ brokers.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Consumer Reports tested them</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			In 2024, <a href="https://www.consumerreports.org/electronics/personal-data-removal-services/personal-data-removal-services-review-a5765894036/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Consumer Reports ran a rigorous study</a> tracking removal rates across thirteen major brokers over four months.
		</p>
		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 leading-relaxed text-text-muted"><strong class="text-text">EasyOptOuts</strong> ($19.99/year): <strong class="text-accent">65% removal rate</strong></p>
			<p class="mb-3 leading-relaxed text-text-muted"><strong class="text-text">Optery</strong> ($249/year): <strong class="text-text">68% removal rate</strong></p>
			<p class="leading-relaxed text-text-muted"><strong class="text-text">DeleteMe</strong> ($129/year): <strong class="text-text">27% removal rate</strong></p>
		</div>
		<p class="mb-4 leading-relaxed text-text-muted">
			The $20/year automated service outperformed the $129/year service by more than double. The most expensive option barely beat one in four.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The re-listing problem</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Here's why data broker removal is such a good subscription business: <strong class="text-text">73% of brokers re-add your data within 90 days</strong>. Average re-listing happens about 23 days after removal.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The problem recreates itself, guaranteeing demand forever. That's real value from paid services. But it's also what makes the subscription model so sticky.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The law is on your side</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">19 to 20 US states</strong> now have privacy laws with deletion rights. Under <a href="https://oag.ca.gov/privacy/ccpa" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">CCPA</a>, you have the legal right to demand any data broker delete your personal information.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">California's DELETE Act</strong> is the big one. The <a href="https://cppa.ca.gov/data_broker_registry/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">DROP platform</a> launched <strong class="text-text">January 1, 2026</strong>, letting California residents submit a single deletion request covering all 543+ registered brokers. Starting August 1, 2026, brokers must process these requests within 90 days. Penalties: <strong class="text-text">$200 per unfulfilled request per day</strong>.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The government just made the core function of DeleteMe and Incogni a free public utility. For everyone else, CCPA-style requests still work with most major brokers.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Domestic violence survivors.</strong> Having your home address on people-search sites is a physical safety threat. Every day a profile stays live is a day an abuser can find a new address.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Stalking victims.</strong> The same people-search sites that list your address and phone number are tools for stalkers.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Public-facing professionals.</strong> Teachers, social workers, healthcare providers, judges, law enforcement. People whose home addresses being searchable creates real personal safety risks.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Everyone else.</strong> Your published data enables spam calls, phishing, identity theft. The default state — your information published without your consent and removable only through hours of work or a paid subscription — is the actual problem.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			I built <a href="/remove" class="text-accent underline hover:text-accent-hover">nah.tools/remove</a> because exercising your legal right to privacy shouldn't require a subscription.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The tool covers <strong class="text-text">25+ of the most impactful data brokers</strong>. You enter your information once, and it generates pre-filled opt-out emails citing CCPA/GDPR, step-by-step removal guides, direct links to each broker's opt-out page, and progress tracking.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Your personal information stays on your device. It's stored in your browser's local storage and never sent to any server. The tool prepares everything, you click send.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Is this more work than paying DeleteMe $129/year? Yeah. You'll spend a few hours. But Consumer Reports showed that DeleteMe only achieved a 27% removal rate anyway. You'll probably do better yourself.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to protect yourself</h2>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Start with the top 13 brokers.</strong> You don't need to hit all 500+. Spokeo, Whitepages, BeenVerified, Radaris, Intelius (and its 18 subsidiaries), TruePeopleSearch, MyLife, Acxiom, and LexisNexis cover the vast majority of exposure.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">If you're in California, use <a href="https://cppa.ca.gov/data_broker_registry/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">DROP</a>.</strong> Single request, all registered brokers. Launched January 2026.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Expect re-listing.</strong> Your data will probably reappear within 30 to 90 days on some brokers. Plan to re-check every few months.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Use a dedicated email for opt-outs.</strong> Some brokers send marketing to addresses used for removal requests.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Know your rights.</strong> Under CCPA, brokers are legally required to process your deletion request. If they ignore it, <a href="https://oag.ca.gov/contact/consumer-complaint-against-business-or-company" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">file a complaint with the California AG</a>.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Freeze your credit.</strong> Freezing your credit at <a href="https://www.equifax.com/personal/credit-report-services/credit-freeze/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Equifax</a>, <a href="https://www.experian.com/freeze/center.html" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Experian</a>, and <a href="https://www.transunion.com/credit-freeze" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">TransUnion</a> is free, takes about 10 minutes per bureau, and prevents unauthorized accounts.</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Your personal information is being collected and sold without your consent. The law gives you the right to demand deletion. That right shouldn't cost $129/year.
		</p>
	</section>

	<InvestigationFooter slug="remove" />
</article>
