<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Email Signature Shakedown"
	description="Email signature builders charge $9–189/month for what is literally an HTML table. Here's how the industry works, who gets hurt, and why your browser can do it for free."
	slug="signature"
	datePublished="2026-04-01"
	dateModified="2026-04-01"
/>

<svelte:head>
	<title>The Email Signature Shakedown — nah</title>
	<meta
		name="description"
		content="Email signature builders charge $9–189/month for what is literally an HTML table. Here's how the industry works, who gets hurt, and why your browser can do it for free."
	/>
	<meta property="og:title" content="The Email Signature Shakedown" />
	<meta
		property="og:description"
		content="Email signature builders charge $9–189/month for what is literally an HTML table."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/signature" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Email Signature Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How email signature generators charge $9 to $189 a month for string concatenation that takes
			your browser a fraction of a millisecond to compute.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A freelance designer named Sarah needs to look professional when emailing new clients. She
			wants her name, title, phone number, and a headshot in her email footer — the kind of thing
			every corporate employee has had automatically since 2005. She searches "email signature
			generator," clicks the first result, and spends twenty minutes getting everything just right.
			She hits the button to copy her signature, pastes it into Gmail, and it looks great.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			A month later, her signature stops rendering. The headshot is a broken image. The formatting
			is gone. She goes back to the site to check and discovers she's been on a free trial — one she
			never knowingly started — and the trial expired while she was busy sending client emails with
			a broken footer. To get her signature back, she needs to subscribe. The cheapest plan is $9 a
			month. The one with the features she used is $29. Per user.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			She spent twenty minutes. They want $108 a year. For an HTML table.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What an email signature actually is
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Before getting into the business practices, it helps to understand the raw technical reality
			of what you're paying for. Because the gap between what email signature companies charge and
			what they actually compute is, by any objective measure, staggering.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			An email signature is an HTML <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">&lt;table&gt;</code>
			with inline <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">style</code>
			attributes. That's the entire technical product. Not a metaphor — literally a table element, with
			cells for your photo and your text, each styled with inline CSS. No JavaScript. No server-side
			logic at runtime. No API. No database query when someone receives your email.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Email clients — Gmail, Outlook, Apple Mail, Yahoo — are notoriously restrictive about what
			HTML they'll render. They strip <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">&lt;style&gt;</code>
			blocks. They ignore CSS classes. They discard almost everything except inline-styled
			HTML elements. And the element that has survived this gauntlet since the early days of email
			is the <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">&lt;table&gt;</code>.
			So email signatures are tables — not because someone designed it that way, but because
			tables are the only thing guaranteed to survive the email client rendering gauntlet intact.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This constraint, known to every email developer for two decades, is also the reason email
			signature generators exist as a category. Most people don't know HTML, and even developers
			don't want to hand-write table markup. So there's genuine value in a tool that generates
			this markup from a form. The question is what that tool is worth — and how the industry has
			answered that question tells you a lot about modern software pricing.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-text">
				What a signature generator computes
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				You fill in a form: name, title, phone, email, company, website. You pick a layout. You
				upload a photo. The generator takes those values and slots them into an HTML template:
			</p>
			<pre class="overflow-x-auto rounded bg-surface p-4 text-sm text-text"><code
>&lt;table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif;"&gt;
  &lt;tr&gt;
    &lt;td style="padding-right: 16px;"&gt;
      &lt;img src="[YOUR_PHOTO]" width="80" style="border-radius: 50%;" /&gt;
    &lt;/td&gt;
    &lt;td&gt;
      &lt;p style="font-size: 16px; font-weight: bold;"&gt;[YOUR_NAME]&lt;/p&gt;
      &lt;p style="font-size: 14px; color: #666;"&gt;[YOUR_TITLE]&lt;/p&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;</code></pre>
			<p class="mt-3 leading-relaxed text-text-muted">
				That's it. String interpolation. The computation takes microseconds. There is no ongoing
				service. There is no complex infrastructure. The "product" is a template with your
				values filled in.
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How much do they charge for this?
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The answer is: a lot, with escalating tiers designed to push you toward the expensive ones.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">WiseStamp: $9–189/month</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			WiseStamp is one of the most recognized names in the space. Their individual plan starts at
			$9/month. Their team plans run from $36/month to $189/month. The $189/month "Enterprise"
			tier is aimed at companies that want centralized signature management — which is a real
			operational need, but one that amounts to pushing the same template to a list of email
			addresses.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			WiseStamp was acquired by vCita, a small business software company that operates on a
			recurring revenue model. The acquisition turned what was once a utility tool into a
			subscription product with a pricing page designed around capturing monthly commitments.
			The underlying technology — HTML table generation — did not become more complex after the
			acquisition. The business model did.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Newoldstamp: $7–29/user/month</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Newoldstamp charges per user per month, which means costs compound as organizations grow.
			A ten-person team on their mid-tier plan is paying around $1,740 per year for signatures.
			Their feature list includes "analytics" — tracking pixels embedded in outgoing signatures
			that report when recipients open emails or click links. More on that below.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">MySignature: $4–8/user/month</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			MySignature is positioned as the affordable option, but $4–8/user/month still works out
			to $48–96/user/year. For a twenty-person sales team, that's nearly $2,000 annually for
			a product that, at its core, generates the same HTML table your browser could assemble
			in milliseconds.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Exclaimer: $2–4/user/month (enterprise)</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Exclaimer, backed by Insight Partners, targets larger organizations and positions itself
			as an IT-managed solution. Their pricing runs $2–4/user/month billed annually — which
			sounds cheap until you apply it to a company of 200 people. At that scale it's $5,000–
			$10,000 per year for centralized signature management. Exclaimer integrates with Microsoft
			365 and Google Workspace and applies signatures server-side before delivery, which is a
			genuinely different technical approach — but the core value proposition is still: here is
			your employee's name and title, formatted in a table, appended to their emails.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-text">The markup math</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				WiseStamp's most popular individual plan: <strong class="text-text">$9/month</strong> ($108/year).
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				What you get: one signature template, generated once, stored as a string.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				Actual compute cost to generate that signature: roughly
				<strong class="text-text">$0.000001</strong> — a millionth of a cent.
			</p>
			<p class="leading-relaxed text-text">
				That's a markup of roughly <strong class="text-2xl text-accent">10,000,000,000%</strong>.
			</p>
			<p class="mt-3 text-sm leading-relaxed text-text-muted">
				Yes, there's hosting and support overhead. No, that does not explain the gap.
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The image hosting trap
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The subscription model works because these companies insert themselves between your signature
			and anyone who reads it — and that insertion creates ongoing dependency.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			When you upload your headshot or company logo to a signature generator, they host that image
			on their servers. Your signature doesn't contain the image — it contains a URL pointing to
			their server. Something like:
		</p>
		<pre class="mb-4 overflow-x-auto rounded bg-surface-alt p-4 text-sm text-text"><code
>&lt;img src="https://cdn.wisestamp.com/images/users/abc123/photo.jpg" /&gt;</code></pre>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every time a recipient opens your email, their email client makes a request to that server
			to load your photo. If you cancel your subscription, the server stops responding to those
			requests. Every email you've ever sent — to clients, partners, prospects, friends —
			now shows a broken image where your photo used to be. The image wasn't in your email.
			It was rented from the signature company, and the rental expired.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is not a technical limitation. It's a structural choice. Images can be embedded
			directly into an email signature as base64-encoded data URIs — a standard web technique
			that puts the image data inline in the HTML, with no external server dependency. The
			resulting HTML is larger in bytes, but it's completely self-contained. It cannot break
			when you switch services. It does not require anyone's CDN to stay running.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Signature generators use external hosting instead of base64 for one reason: it creates
			lock-in. Your signature doesn't just live in your email client — it lives on their
			infrastructure. Cancelling doesn't just lose you the generator. It breaks everything
			you've already sent.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The tracking pixel problem
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Several email signature platforms — including Newoldstamp and others — sell "email analytics"
			as a premium feature. This means embedding a one-pixel invisible image in your outgoing
			signature. When a recipient opens your email, their client loads that pixel from the
			company's server.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The company's server logs the request: timestamp, IP address, approximate location, device
			type. That data gets surfaced to you as "email analytics" — open rates, click-through rates,
			geographic breakdowns. The feature is marketed as a productivity tool for salespeople who
			want to know if their emails were read.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What this means in practice: every person who receives your email — your clients, your
			family members, your job prospects — is being tracked without their knowledge or consent by
			a third-party company they've never heard of. The data flows to the signature company, which
			aggregates it across all their customers, and potentially shares or sells it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Most people who use these tools have no idea this is happening. The tracking pixel is
			invisible. It's bundled into the signature HTML the tool generates. The user sees "analytics"
			as a feature in the upgrade pitch, not as "we're surveilling your recipients."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Apple Mail's Mail Privacy Protection, introduced in 2021, specifically blocks tracking
			pixels like these. The advertising-technology arms race between email platforms and tracking
			pixels is a direct result of products like this.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			HubSpot gives it away for free. That tells you everything.
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			HubSpot — a publicly traded company with a market cap in the billions — built a free email
			signature generator and gives it away with no account required. You fill in your details,
			pick a template, copy the result. Done.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			HubSpot doesn't do this out of charity. They do it because generating an email signature
			is so computationally trivial that the tool costs them almost nothing to operate, and they
			can use it as a lead-generation touchpoint for their CRM and marketing platform. The signature
			generator is a free gift. The ask — a subtle CTA for HubSpot's paid products — comes after.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The existence of HubSpot's free signature generator is the clearest possible market signal
			about the actual value of signature generation as a standalone product. If a billion-dollar
			company uses signature generation as a throwaway marketing offer, the activity itself has
			essentially zero standalone value. The entire email signature SaaS industry is charging
			recurring fees for something that a well-resourced company treats as too cheap to monetize.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The companies charging $9–189/month aren't providing a more valuable product than HubSpot's
			free version. They're providing a product with better lock-in. The distinction matters.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Email signature subscriptions are not an enterprise software problem. Enterprise IT teams
			have budgets, procurement processes, and people whose job is to evaluate software costs.
			The people who get hurt by this pricing are the ones who most needed a straightforward free
			tool.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Freelancers</strong> are the most common victims. A graphic designer,
			copywriter, or consultant who wants to look professional in client emails doesn't have a
			company IT department buying their tools. They're paying for everything themselves — and
			$108/year for a signature is a meaningful expense against a variable income.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small business owners</strong> — a real estate agent, a therapist
			in private practice, a contractor — want professional communication without a tech stack.
			They find a signature tool, set it up, and forget about it until the invoice lands. The
			price is rarely enough to fight over, which is exactly why it works.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Salespeople</strong> at small companies are often expected to set
			up their own signatures. Their employer isn't paying for WiseStamp. They are. A $9/month
			charge against a personal card, every month, forever, for a signature they set up once
			and barely think about.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Job seekers</strong> are an underappreciated case. Someone actively
			applying for jobs wants to look professional. They create a signature for their job search,
			get absorbed in applications, and only notice the charge three months later. By then the
			signature is in every cover letter email they've sent.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			In every case, the tool was set up once, the value was delivered in that first session, and
			the monthly charge is pure extraction — ongoing payment for a computation that happened once
			and is now sitting idle in a template database.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Why the free trial is a trap, not a feature
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every major email signature service offers a free trial. The trial isn't generous — it's
			strategic.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The calculation is simple: the service needs to be free long enough for you to use it, and
			short enough to convert you before you start wondering whether you need to pay. For email
			signatures, that window is about two weeks. You set it up, you use it in a handful of emails,
			you stop thinking about it. Then the trial ends.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Unlike QR codes, which break spectacularly when printed on physical materials you've already
			distributed, an email signature breaks more quietly. Your headshot disappears. Your formatting
			collapses. People receiving new emails see something worse than no signature at all — a
			broken one. It looks unprofessional precisely at the moment the company is waiting for you
			to pay to fix it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The asymmetry is deliberate. You've already sent emails with this signature to clients and
			contacts. Your name is associated with this broken appearance. The fastest way to fix it is
			to pay. The alternative — finding a new tool, recreating your signature, updating it in
			your email client — feels like more work than just subscribing, especially if you're in the
			middle of something important.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			That friction is not accidental. It's the product.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The free alternative
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			We built <a href="/signature" class="text-accent underline hover:text-accent-hover">nah's email signature generator</a>
			because the gap between what this costs to compute and what the industry charges for it is
			wide enough to drive a truck through.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The tool generates your signature entirely in your browser. Your name, title, photo, links,
			and social handles never leave your device during generation. There's no account, no trial,
			no subscription, and no expiration. You fill in a form, copy the result, paste it into
			Gmail, Outlook, or Apple Mail, and you're done. The signature is yours.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Photos are embedded as base64 data URIs — the image data is encoded directly into the
			HTML output. This means your headshot is not hosted on any server. It cannot break when you
			stop paying anything. It cannot be used to track your recipients. The signature is
			entirely self-contained, and it will look exactly the same in five years as it does today.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The output is a clean HTML table with inline styles — the same format every email client
			has supported for two decades. Copy the rich-text version and paste directly into Gmail's
			signature settings. Copy the HTML and paste it anywhere that accepts raw markup. Download
			it as a file. The choice is yours.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We don't embed tracking pixels. We don't inject our branding into your signature. We don't
			host your images on infrastructure you'll eventually have to pay to keep alive. The source
			code is
			<a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">public on GitHub</a>.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-2 text-sm font-semibold uppercase tracking-wider text-text">
				What "free" actually means here
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				No account required. No credit card. No trial that converts to a subscription.
				No external hosting that can break. No tracking pixels. No expiration.
				The computation happens in your browser. The result belongs to you.
			</p>
			<p class="leading-relaxed text-text">
				<strong>One session. Yours permanently.</strong>
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How to set up a signature that you'll never have to pay for
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Whether you use our tool or another genuinely free one, here's how to make sure you're not
			setting yourself up for a subscription you didn't intend to start.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Never enter a credit card for a "free" signature tool.</strong>
				If the tool asks for payment information during a free trial, that trial will convert.
				If the free tier genuinely doesn't need your card, they won't ask for it.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Ask where your images are hosted.</strong>
				If the tool uploads your photo to their servers (you'll see a URL like
				<code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">cdn.signaturetool.com/...</code>
				in the generated HTML), cancelling will break your photo in every email you've ever sent.
				Use a tool that embeds images as base64, or host your own photo somewhere permanent.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Check for tracking pixels in the generated HTML.</strong>
				Look for tiny images with URLs that include words like "track," "open," "pixel," or "beacon."
				If you see them, they're watching your recipients.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If you're already paying for a signature service,</strong>
				export or copy the raw HTML before cancelling. Paste it into a text file. You'll still
				need to fix any broken image URLs, but the layout and formatting will be preserved.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Gmail, Outlook, and Apple Mail let you paste rich HTML directly.</strong>
				In Gmail, go to Settings > See all settings > General > Signature. Paste rich text there —
				no code editing required. The format will be preserved automatically.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			The email signature industry is a case study in what happens when a simple utility gets
			wrapped in recurring billing infrastructure. The underlying computation — take these inputs,
			produce this table — hasn't changed. What's changed is that SaaS pricing models have been
			applied to it, complete with trials, tiers, per-user costs, and image hosting dependencies
			designed to make cancellation painful.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			HubSpot's decision to give this away as a free marketing touchpoint isn't altruism — but it
			does tell you what the computation is worth when stripped of lock-in mechanisms. The answer
			is: not enough to charge for. The image hosting, the tracking pixels, the trial-to-subscription
			conversion — these aren't features. They're the mechanism by which a zero-dollar computation
			becomes a nine-dollar monthly bill.
		</p>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			Your email signature is an HTML table. It should cost you nothing.
		</p>
	</section>

	<InvestigationFooter slug="signature" />
</article>
