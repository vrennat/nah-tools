<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Does nah.tools remove my data automatically?',
			answer:
				'No, and it\'s worth being direct about that: the tool generates the opt-out request for a given broker — grounded in CCPA or GDPR where applicable — but you review and send it yourself. nah.tools doesn\'t act as your authorized agent and can\'t guarantee any broker actually removes your listing.'
		},
		{
			question: 'Why do I need to do this more than once?',
			answer:
				'Listings can reappear as brokers acquire or refresh data. Keep confirmation records and recheck periodically; a successful request is not a guarantee against future listings.'
		},
		{
			question: 'Is this actually free?',
			answer:
				'Yes, completely — no account, no subscription, no upsell. The tool covers 25+ brokers with links to broker search pages to find your listing and CCPA/GDPR-grounded opt-out email templates.'
		},
		{
			question: 'Is this legal advice?',
			answer:
				'No. The templates are grounded in real privacy law (CCPA, GDPR) but this isn\'t a substitute for a lawyer, and nothing here guarantees a specific outcome.'
		}
	];
</script>

<ArticleShell
	path="/guides/remove-yourself-from-people-search-sites"
	dek="People-search sites may publish your address and phone number. Here's how the opt-out process actually works, and how to run it yourself for free."
	seoTitle="How to Remove Yourself From People-Search Sites (Free) | nah"
	description="People-search sites like Spokeo and Whitepages publish your address, phone number, and relatives. Learn how opt-out requests actually work and do it yourself for free."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What people-search sites are, briefly</h2>
		<p class="leading-relaxed text-text-muted">
			Sites like Spokeo, Whitepages, BeenVerified, and TruePeopleSearch compile personal
			information — name, address, phone number, age, relatives — from public records and
			commercial data sources, then publish it for anyone to search. You didn't sign up for any of
			it. For the full story on why paid removal services charge what they do and whether it's worth
			it, see our <a href="/why/remove" class="text-accent underline hover:text-accent-hover">investigation into the data broker industry</a>.
			This guide is the practical follow-up: how to actually send the opt-out requests yourself.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">How an opt-out request actually works</h2>
		<p class="leading-relaxed text-text-muted">
			Deletion rights depend on your location, the business, and the data involved. California's
			CCPA and the EU's GDPR provide rights in qualifying circumstances, with exceptions; a
			template citing one of them does not establish that it applies to you. In practice, exercising that right usually means finding
			your listing on a given broker's site, then submitting a removal request through whatever
			process that broker uses — a web form, an email, sometimes even a phone call with a
			verification code.
		</p>
		<p class="leading-relaxed text-text-muted">
			Removal may not be permanent: listings can reappear when information is refreshed. Save the
			request date and confirmation, then recheck periodically. A public-listing opt-out can also
			differ from deletion of every record a company holds.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Using nah.tools to generate the requests</h2>
		<p class="leading-relaxed text-text-muted">
			The <a href="/remove" class="text-accent underline hover:text-accent-hover">data removal tool</a> covers
			25+ brokers. For each one, it gives you a link to its search page so you can find your own
			listing, and generates an opt-out request using CCPA or GDPR wording that you must check for applicability, then review and send yourself, whether that's by email or through the
			broker's own form.
		</p>
		<p class="leading-relaxed text-text-muted">
			Be direct with yourself about what this is: a generator for the request, not an automated
			removal service. Nothing is submitted on your behalf, and no account or payment is involved —
			you stay in control of what gets sent and to whom.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What this won't do</h2>
		<p class="leading-relaxed text-text-muted">
			It won't guarantee removal — no tool can, free or paid, since the brokers control whether they
			actually honor a request. It isn't legal advice. And it won't stop a broker from re-listing
			your data months later, which is why it's worth treating this as something to revisit
			periodically rather than a single pass.
		</p>
	</section>
	<p class="leading-relaxed text-text-muted">Check eligibility, exceptions, and submission requirements in the <a href="https://www.oag.ca.gov/privacy/ccpa" class="text-accent underline hover:text-accent-hover">California Attorney General’s CCPA guidance</a> and each broker’s current privacy policy.</p>
</ArticleShell>
