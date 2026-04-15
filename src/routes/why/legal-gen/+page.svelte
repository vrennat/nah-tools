<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Privacy Policy Shakedown"
	description="$20/month for template mail-merge on a document you are legally required to have."
	slug="legal-gen"
	datePublished="2026-04-01"
	dateModified="2026-04-01"
/>

<svelte:head>
	<title>The Privacy Policy Shakedown — nah</title>
	<meta
		name="description"
		content="$20/month for template mail-merge on a document you are legally required to have."
	/>
	<meta property="og:title" content="The Privacy Policy Shakedown" />
	<meta
		property="og:description"
		content="Legal document generators charge $20–90/month for fill-in-the-blank templates. Here's what they're actually selling and how to get it free."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/legal-gen" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Privacy Policy Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How legal document generators charge $20 to $90 per month for fill-in-the-blank templates —
			on documents you are legally required to have.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			You just launched your app. Maybe it's a simple tool, a newsletter, a side project with a
			contact form. You did the research. You know you need a privacy policy — GDPR in Europe, CCPA
			in California, and a dozen other frameworks make it a legal requirement the moment you collect
			so much as an email address. So you search "privacy policy generator" and click the first result.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The tool asks you a series of questions: your company name, your website URL, what data you
			collect, which third-party services you use. You answer. A document appears. It looks
			professional. It has sections about cookies, data retention, user rights, contact information.
			You're relieved — this is exactly what you needed.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Then you try to copy it. Or download it. Or link to it on your site. And that's when you find
			out: the document is locked behind a subscription. $10 a month, minimum. More if you want it
			to cover your mobile app as well as your website. More still if you want it to include certain
			jurisdiction-specific sections. And this repeats every month, forever — for a document that
			doesn't change.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			You're being charged a monthly fee for a document you filled in yourself, built from template
			paragraphs a generator assembled on your behalf. This is the compliance fear tax.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What a privacy policy actually is
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			A privacy policy is a legal disclosure document. It tells your users what personal data you
			collect, why you collect it, how long you keep it, who you share it with, and what rights users
			have over that data. Laws like the
			<a
				href="https://gdpr.eu/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-accent underline hover:text-accent-hover">GDPR</a
			> (EU),
			<a
				href="https://oag.ca.gov/privacy/ccpa"
				target="_blank"
				rel="noopener noreferrer"
				class="text-accent underline hover:text-accent-hover">CCPA</a
			> (California),
			<a
				href="https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/"
				target="_blank"
				rel="noopener noreferrer"
				class="text-accent underline hover:text-accent-hover">PIPEDA</a
			> (Canada), and others require this disclosure if you collect personal information from residents
			in those jurisdictions.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			For the vast majority of small websites and apps — a SaaS tool that collects email addresses
			for login, a blog with an email newsletter, a mobile app that stores user preferences — a
			privacy policy is a standardized document. The structure is the same everywhere: what you
			collect, why, how long, who sees it, your contact info, and a list of user rights. The legal
			language is largely boilerplate. Lawyers have been producing these from templates for decades.
			The generators simply automated the template.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			That doesn't make compliance unimportant. You genuinely need these documents. GDPR enforcement
			is real — the Irish Data Protection Commission fined Meta €1.2 billion in 2023. CCPA complaints
			are processed by the California Privacy Protection Agency. The stakes exist. But the stakes are
			about what your policy says, not which platform generated it. A well-written template with your
			details accurately filled in covers the same ground as one produced by a $35/month SaaS tool.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How much do these generators actually charge?
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The market for legal document generators is crowded and the pricing is, charitably, aggressive.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Termly</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Termly charges $10 to $35 per month, per website. Their marketing leans heavily on "AI-powered"
			language — but what they're describing is conditional template logic. The system asks you
			questions, then selects pre-written paragraphs based on your answers. This is string
			interpolation. It is not artificial intelligence in any meaningful sense. The underlying
			paragraphs were written by lawyers once, years ago, and have barely changed since.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">iubenda</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			iubenda, an Italian company popular in the EU market, charges $9 to $90 per month — and that's
			per site. If you have a main domain and a subdomain for your app, that may count as two
			products. If you have a mobile app, that's another subscription. The document itself is the
			same template filled in differently each time, but the per-property pricing structure ensures
			that anyone with more than one web property pays multiple times for the same underlying work.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Termageddon</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Termageddon charges $12 to $50 per month and markets primarily on "auto-updating" policies:
			when laws change, they update your document automatically. This sounds compelling until you ask
			how often major privacy laws change. The answer is: rarely. GDPR went into effect in 2018. CCPA
			in 2020. Significant amendments come every few years, not monthly. You are paying $12 to $50
			every month for an event that might occur once every two or three years — and when it does
			occur, updating a template document takes minutes. The "auto-update" feature is a subscription
			justification, not a service.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Others in the market</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">PrivacyPolicies.com</strong> charges one-time fees of $50 to $300 or
			ongoing subscriptions, with pricing tiers confusing enough that many users report not knowing
			what they actually paid for. <strong class="text-text">Enzuzo</strong> offers a "free" tier — but
			that tier places their branding on your legal pages, which is an interesting proposition: pay us
			nothing and we advertise on the document you're legally required to display to your users.
			<strong class="text-text">GetTerms.io</strong> charges $9 to $39 per month. The variation between
			tiers is largely cosmetic — more document types, removal limits — but the underlying template
			output is identical.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 leading-relaxed text-text-muted">
				A mid-tier plan across the major generators averages roughly
				<strong class="text-text">$20/month</strong>, or $240/year.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				A one-hour consultation with a business attorney to review a template privacy policy
				typically costs <strong class="text-text">$150 to $350</strong> — a one-time fee, for actual
				legal review by an actual lawyer.
			</p>
			<p class="leading-relaxed text-text">
				After three years on a $20/month generator, you have spent
				<strong class="text-2xl text-accent">$720</strong> — twice the cost of a real attorney review
				— on a document no lawyer ever touched.
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The compliance fear tax
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every legal document generator leads with the same marketing: fines. "GDPR violations can cost
			up to 4% of global annual revenue!" "California law requires this!" "Don't risk a lawsuit!" The
			fear is real — penalties for non-compliance exist and have been enforced against large companies.
			But that fear is being used to sell you something that doesn't match the threat.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Regulators pursuing GDPR enforcement against small businesses are not asking whether you used
			Termly or iubenda or wrote your policy yourself. They are asking what your policy says — whether
			your disclosed data practices match your actual practices, whether users have the rights they're
			legally entitled to, whether your contact information is accurate. The generator is irrelevant.
			The content is everything.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What these generators are actually selling is not compliance. It is the feeling of compliance —
			a branded, hosted document with a professional layout that signals legitimacy. That feeling has
			value. But it's priced as if it were ongoing legal counsel, when it's actually a one-time
			template fill that gets cached and served.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The monthly subscription model persists not because privacy law changes monthly, but because
			it's far more profitable than a one-time fee. If Termly charged $30 once, customers would pay
			once and leave. At $10 per month, the average customer pays $120 in year one, $240 by year two,
			and keeps paying indefinitely — because cancelling feels risky when a legal document is
			involved.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What the generator is actually doing
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Strip away the branding and every privacy policy generator does the same thing. It asks you a
			series of questions:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">What is your business name?</li>
			<li class="leading-relaxed text-text-muted">What is your website or app URL?</li>
			<li class="leading-relaxed text-text-muted">
				What data do you collect? (email, name, IP address, payment info, location, usage data...)
			</li>
			<li class="leading-relaxed text-text-muted">
				Which third-party services do you use? (Google Analytics, Stripe, Mailchimp, Facebook
				Pixel...)
			</li>
			<li class="leading-relaxed text-text-muted">
				Which jurisdictions apply? (EU, California, Canada...)
			</li>
			<li class="leading-relaxed text-text-muted">What is your contact email address?</li>
		</ul>
		<p class="mb-4 leading-relaxed text-text-muted">
			Based on your answers, the system selects pre-written paragraphs and concatenates them into a
			document. Your business name is interpolated into the header. Your contact email goes in the
			footer. The data types you checked get their own boilerplate disclosure paragraph. The
			third-party services you selected pull from a library of pre-written service-specific clauses
			("We use Google Analytics to collect usage information..."). Jurisdiction toggles add or remove
			sections for GDPR, CCPA, COPPA, and PIPEDA.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is, at its core, string interpolation and conditional rendering. It is the most basic
			programming operation that exists. A developer could build a functional version of this in an
			afternoon. The template paragraphs took a lawyer time to write — but they wrote them once. The
			generator has been collecting subscriptions on that same work ever since.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The practical consequence of this pricing model falls on the people least able to absorb it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Indie developers</strong> launching their first app are legally required
			to have a privacy policy before they have a single paying user. They're told to get compliant
			before launch. So they pay $10 to $35 a month — sometimes more than their actual hosting costs —
			for a document their handful of early users will never read.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small business owners</strong> with a single website and no technical
			background search for a solution, find a polished generator at the top of the search results, and
			assume the subscription price is the cost of compliance. It isn't. It's the cost of convenience
			dressed as necessity.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Nonprofits</strong> collecting email addresses for a mailing list, running
			a donor portal, or operating any website with a contact form technically need these documents. Many
			are paying $20 a month for a template because they don't know there's an alternative.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Bloggers and creators</strong> who added an email newsletter to their
			site now collect personal data — email addresses — which brings them into the scope of privacy law
			in most jurisdictions. They're being funneled into subscription products built for SaaS companies,
			at SaaS company prices.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Developers in emerging markets</strong> building products for global audiences
			face the same compliance requirements as companies in San Francisco, but at a fraction of the purchasing
			power. A $20/month subscription is a trivial line item in a US startup's budget. It is a meaningful
			expense for a solo developer in Brazil, India, or Nigeria building something real.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The per-site pricing trap
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			iubenda's per-property pricing deserves specific attention because it's the most aggressive
			example of a pattern several generators use. The premise is that each website or app is a
			separate product requiring a separate subscription. In practice, this means:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">
				A main website and a blog on a subdomain: two subscriptions.
			</li>
			<li class="leading-relaxed text-text-muted">
				A website and a mobile app that does the same thing: two subscriptions.
			</li>
			<li class="leading-relaxed text-text-muted">
				An iOS app and an Android app: potentially two more subscriptions.
			</li>
			<li class="leading-relaxed text-text-muted">
				A staging environment you want covered: another subscription.
			</li>
		</ul>
		<p class="mb-4 leading-relaxed text-text-muted">
			In each case, the underlying document is the same template filled in with slightly different
			details. The URL is different. Perhaps the app-specific section varies. But the legal
			substance — the data practices, the rights disclosures, the contact information — is identical
			across all your properties. You're paying per URL for a document that differs by a handful
			of fields.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The "auto-updating" justification
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Termageddon's core value proposition is that they monitor privacy law changes worldwide and
			update your policy automatically when regulations change. This is the most sophisticated
			argument for a recurring subscription in the space, and it deserves a direct examination.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Major privacy legislation that affects most small businesses:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">GDPR</strong> — effective May 2018
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">CCPA</strong> — effective January 2020, amended by CPRA effective
				January 2023
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">PIPEDA / Bill C-27 (Canada)</strong> — Bill C-27 was introduced in
				2022 and had not received royal assent as of early 2026
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Virginia CDPA, Colorado CPA, Connecticut CTDPA</strong> — all
				effective 2023, and largely modeled on CCPA with minor variations
			</li>
		</ul>
		<p class="mb-4 leading-relaxed text-text-muted">
			The pattern is clear: major changes come infrequently — measured in years, not months. Smaller
			regulatory guidance updates happen more often, but they rarely require changes to a boilerplate
			privacy policy for a typical small website or app. The auto-update feature is real in the sense
			that Termageddon does track regulatory changes. But you are paying for a service that triggers
			a meaningful output roughly once every one to three years. The subscription model extracts $144
			to $600 per cycle for what amounts to one document update.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			When a significant law does change, the information about what changed is publicly available
			immediately, covered extensively in legal and tech press. Updating a template document takes
			minutes, not a managed service.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			We built the
			<a href="/legal" class="text-accent underline hover:text-accent-hover"
				>nah legal document generator</a
			> because the barrier to a basic privacy policy shouldn't be a monthly subscription.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The tool works the same way every generator works: you answer questions about your business,
			toggle the data types you collect and the third-party services you use, select which
			jurisdictions apply, and a document generates. It covers privacy policies, terms of service,
			cookie policies, and DMCA notices. Jurisdiction-specific sections for GDPR, CCPA, COPPA, and
			PIPEDA are included. You can export as plain text, Markdown, HTML, or PDF.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Everything happens in your browser. No account, no subscription, no per-site fees, no branding
			on your documents, no email required. The generation is a client-side operation — your business
			details never touch our servers.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-2 font-semibold text-text">A note on legal advice</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				nah generates starting-point templates, not legal advice. For most simple websites and apps
				— a SaaS tool, a newsletter, a portfolio with a contact form — a well-written template
				accurately filled in covers the basics. The legal substance of what these generators produce
				is template text either way.
			</p>
			<p class="leading-relaxed text-text-muted">
				If your business has complex data practices — you process sensitive health data, you operate
				in highly regulated industries, you share data with many third parties — have a lawyer review
				your policy. A one-time consultation with a privacy attorney costs $150 to $350 and produces
				a document an actual lawyer read. That is money better spent than two years of subscription
				fees on a service where no lawyer is reading anything.
			</p>
		</div>

		<p class="mb-4 leading-relaxed text-text-muted">
			The point is not to replace lawyers. It is to replace the template generators sitting between
			you and the legal work you could have gotten from a real attorney for what you would have
			spent on subscriptions in four months.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What to actually do about your privacy policy
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Whether you use our tool or any other, here is a practical approach.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Determine which laws apply to you.</strong> GDPR applies if you have
				users in the EU — regardless of where your company is located. CCPA applies if you're a
				California business or have California users and meet certain thresholds (generally, businesses
				doing over $25M in revenue, handling data of 100,000+ consumers annually, or deriving 50%+
				of revenue from selling personal information). COPPA applies if your service is directed at
				children under 13. Most small sites primarily need to address GDPR if they have any EU
				visitors.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Be accurate about what you actually collect.</strong> The policy
				is only as good as its accuracy. If you say you don't collect IP addresses but your analytics
				tool does, that's the problem — not which generator you used. Know your third-party services
				and what data they collect on your behalf.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Host it yourself.</strong> A privacy policy is a text document.
				You can paste it into a page on your site. You do not need a hosted service to serve it.
				Generators that host your policy and charge for that hosting are charging you for a static
				text file.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Update it when your practices change.</strong> If you add a new
				analytics tool, add the disclosure. If you stop collecting something, remove it. This takes
				five minutes and requires no subscription.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If your situation is genuinely complex, hire a lawyer for an
				hour.</strong> A $200 attorney consultation for a business processing sensitive data, handling
				payments with complex arrangements, or operating in multiple regulated industries is money
				well spent. It is not money well spent for a simple SaaS tool or a personal website with
				a mailing list.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Legal document generators are one of the cleaner examples of compliance anxiety converted into
			recurring revenue. The anxiety is legitimate — privacy law is real and enforcement exists. But
			the solution being sold doesn't match the problem being feared. What most small sites need is
			accurate template text filled in correctly and kept up to date. That has never required a
			monthly subscription. It has required someone to tell you that clearly.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We're building nah as a set of free browser-based utilities that replace software that charges
			subscription prices for one-time work. A privacy policy is text. Generating it is a solved
			problem. The ongoing fee is manufactured leverage — fear that cancelling might leave you
			non-compliant, when in reality you'd still have the document you downloaded on day one.
		</p>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			Compliance is required. The subscription isn't.
		</p>
	</section>

	<InvestigationFooter slug="legal-gen" />
</article>
