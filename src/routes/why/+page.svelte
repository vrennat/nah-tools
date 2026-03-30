<svelte:head>
	<title>The QR Code Shakedown: How 'Free' QR Generators Charge Hundreds per Year</title>
	<meta
		name="description"
		content="QR Code Generator Pro has thousands of 1-star reviews. Here's how the subscription trap works and a genuinely free alternative."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The QR Code Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How "free" QR code generators extract hundreds of dollars a year for something that costs
			a fraction of a penny.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Imagine this: you've spent weeks planning your wedding. The invitations are gorgeous — letterpress
			on heavy cotton stock, with a custom QR code linking guests to your RSVP page. Two hundred
			invitations, already stamped and mailed to every friend and family member on the list.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Three weeks later, your aunt calls. "Honey, the little square thing on your invitation
			doesn't work." You pull out your phone and scan it yourself. Instead of your RSVP page,
			you get a screen telling you your "free trial has expired." To reactivate your QR code —
			the one already printed on two hundred invitations sitting on two hundred kitchen counters —
			you need to subscribe. Plans start around $5 a month, billed annually. That's $60 or more
			per year for a QR code that took a computer less than a millisecond to generate.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You have two options: pay the ransom, or reprint everything.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			This isn't a bug. It's the business model.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Why did my QR code stop working?
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			To understand the trap, you need to understand what a QR code actually is. A QR code is a
			picture that encodes text. That's it. The black-and-white pixel pattern is a visual
			representation of data — usually a URL — following an international standard called
			ISO/IEC 18004. Your phone's camera reads the pixels, decodes the text, and opens the link.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			There are two fundamentally different types of QR codes, and the distinction between them
			is the entire basis of the subscription trap.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Static QR codes</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			A static QR code encodes your URL directly into the pixel pattern. When someone scans it,
			their phone reads the pixels and goes straight to your website. There is no middleman, no
			server involved, no company that can flip a switch. The data is the code. A static QR code
			works the same way today, next year, and fifty years from now — as long as the destination
			URL exists. Generating one takes three lines of JavaScript and about one millisecond of
			computation. It is, in every practical sense, free.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Dynamic QR codes</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			A dynamic QR code does something different. Instead of encoding your URL, it encodes the
			QR company's URL — something like <code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text">qr-company.com/redirect/abc123</code>.
			When someone scans the code, their phone goes to the company's server first, and the server
			redirects them to your actual destination. This means the company controls whether your code
			works. If they turn off the redirect — because your trial expired, because you cancelled,
			because they went out of business — your QR code is dead. The printed pixels haven't changed,
			but the link behind them has been severed.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Dynamic codes have a legitimate use case: if you need to change where a QR code points after
			printing, a redirect lets you update the destination without reprinting. Event organizers,
			for instance, might update a schedule link after printing programs.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">The deception</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Here's what makes this predatory: every major "free" QR code generator defaults to dynamic
			codes without explaining what that means. They don't tell you that a static code would serve
			you permanently for free. They don't explain that by choosing dynamic, you're handing them
			a kill switch for your QR code. The interface simply creates a dynamic code, starts a 14-day
			trial timer, and waits for you to print it on something permanent. Most people searching for
			"free QR code generator" have a URL that will never change. They need a static code. They
			get a dynamic one — and a subscription invoice two weeks later.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How much do QR code generators actually charge?
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The scale of the problem becomes clear when you look at the review data. These are not
			isolated complaints. This is a pattern operating at industrial scale.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">QR Code Generator Pro</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			QR Code Generator Pro, one of the largest players in the space, has accumulated
			<strong class="text-text">over 9,000 reviews on Trustpilot with an average rating of 1.5 out of 5 stars</strong>.
			On Sitejabber, they hold 350+ reviews at 1.2 out of 5. The complaints follow a strikingly
			consistent pattern: user creates a "free" QR code, prints it on physical materials, discovers
			within 14 days that the code has been deactivated, and is presented with a paid subscription.
			Plans range from around $5 to $38 per month, billed annually — meaning users face charges
			of $60 to over $450 per year.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The trial period is not accidental. Fourteen days is long enough for most people to design
			their materials, approve the print run, and distribute. By the time the code stops working,
			it's already on wedding invitations, business cards, restaurant tables, and event flyers.
			The switching cost isn't the subscription — it's the cost of reprinting everything.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">The broader pattern</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			QR Code Generator Pro isn't alone. QRCodeCreator has over 4,000 Trustpilot reviews — and
			while its overall rating is better, it still draws complaints about the same trial-expiry
			pattern. QR.io's Product Hunt page is dominated by reports of unexpected charges. QRfy
			follows the same trial-to-subscription model. The playbook is the same everywhere: offer
			a "free" tool, default to dynamic codes, start a trial timer, wait for the user to print,
			then charge.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">The markup math</h3>
		<div
			class="my-6 rounded-lg border border-border bg-surface-alt p-6"
		>
			<p class="mb-3 leading-relaxed text-text-muted">
				QR Code Generator Pro's top-tier plan costs roughly <strong class="text-text">$38/month</strong>, which
				includes up to 250 dynamic QR codes.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				That works out to about <strong class="text-text">$0.15 per QR code per month</strong>.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				The raw compute cost to generate a QR code is roughly <strong class="text-text">$0.00001</strong> —
				a hundred-thousandth of a penny.
			</p>
			<p class="leading-relaxed text-text">
				That's a markup of roughly <strong class="text-2xl text-accent">1,500,000%</strong>.
			</p>
		</div>
		<p class="mb-4 leading-relaxed text-text-muted">
			To be clear, companies are entitled to charge for services. Hosting, bandwidth, analytics,
			and customer support cost money — the raw compute comparison doesn't capture all of that.
			But even accounting for infrastructure overhead, the gap between cost and price is enormous,
			and the thousands of 1-star reviews suggest the value proposition isn't computing power or
			customer service. It's leverage over people who already printed something.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Who gets hurt
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Behind the review scores are real people who got caught in a trap they didn't know existed.
			The common thread is physical printing — once a QR code is on a tangible object, you can't
			change it. You can only pay or reprint.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Wedding couples</strong> put QR codes on invitations, save-the-dates,
			programs, and table cards. A wedding invitation gets printed once, mailed once, and can't be
			recalled. When the code dies, the couple either pays the subscription or asks two hundred
			guests to manually type a URL.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small restaurants</strong> print QR menus on table tents, counter
			cards, and takeout bags. Replacing them means a new print run and the staff time to swap
			every table in the restaurant.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small businesses</strong> put QR codes on business cards, product
			packaging, trade show banners, and storefront signage. A box of 500 business cards costs
			$30 to print. The subscription to keep the QR code alive costs $60 or more a year.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Nonprofits</strong> add QR codes to fundraiser materials, event
			programs, and donation posters — often printed by volunteers with razor-thin budgets.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Teachers</strong> use QR codes on classroom worksheets, assignment
			handouts, and resource guides. When the code stops working mid-semester, thirty students
			lose access to their materials.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Why this keeps working
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Three structural forces keep the subscription trap profitable.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">SEO dominance.</strong> These companies spend heavily on search ads
			and have years of domain authority. When you search "free QR code generator," nearly every
			top result is a subscription trap wearing the word "free" as a mask. The genuinely free
			alternatives are buried.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Technical opacity.</strong> Most people don't know that a QR code
			is just encoded text. The difference between static and dynamic codes is invisible unless
			someone explains it — and the companies creating dynamic codes have no incentive to explain.
			This isn't a failure of intelligence; it's specialized knowledge that most people have no
			reason to possess.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Printing creates lock-in.</strong> This is the most important one.
			The 14-day trial is calibrated to outlast the printing timeline. By day 14, the code is on
			physical materials. The company knows that once you've printed, the cost of switching isn't
			the subscription fee — it's the cost of reprinting your entire run of invitations, menus, business cards,
			or signage. That asymmetry is the engine of the business model.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The free alternative
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			We built <a href="/qr" class="text-accent underline hover:text-accent-hover">nah</a> because
			the alternative shouldn't cost hundreds of dollars a year.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			nah is a free, open-source QR code generator. It supports every feature the paid
			tools charge for: custom colors, dot styles, logo embedding, gradients, SVG and high-resolution
			PNG export, WiFi codes, vCard codes, and batch generation. There is no signup, no trial,
			no account, no expiration, and no catch.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Static QR codes are generated entirely in your browser. Your data never touches our servers.
			There's nothing to expire because there's no server involved — the code is computed on your
			device, and the result belongs to you.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We also offer <a href="/qr" class="text-accent underline hover:text-accent-hover">dynamic QR codes</a>
			for cases where you genuinely need to change a destination after printing. These run through
			a lightweight redirect service on Cloudflare Workers. The total infrastructure cost is $5
			per month for up to 10 million redirects. We don't charge for this because, at that price
			point, there's nothing meaningful to charge for.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			There are no ads, no tracking cookies, no email collection, and no analytics beyond basic
			redirect counts for dynamic codes. The source code is
			<a href="https://github.com/tannerbroberts/nah-tools" class="text-accent underline hover:text-accent-hover">public on GitHub</a>.
			You can read every line, verify every claim, and self-host the entire thing if you want to.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We didn't build this to compete with enterprise QR platforms. We built it because 90% of
			people who search for "free QR code generator" need a static code that never expires.
			That's a solved problem. It shouldn't cost money.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How do I make a QR code that never expires?
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Whether you use our tool or someone else's, here's how to protect yourself.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Always create static codes for permanent materials.</strong>
				If the QR code is going on a business card, a sign, a menu, an invitation, or anything
				else that gets printed — use a static code. Static codes encode your URL directly and
				cannot be deactivated by anyone.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Only use dynamic codes when you genuinely need to change the destination later.</strong>
				Event-specific campaigns, A/B testing URLs, temporary promotions — these are valid
				use cases for dynamic codes. Your restaurant menu URL that won't change? Static.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If you already have a dynamic code from a paid service,</strong>
				check whether you can replace it with a static code that encodes the same URL. If the
				destination won't change, you don't need dynamic.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Read the fine print before creating any QR code.</strong>
				If a "free" tool asks for your credit card, it's a trial, not a free tool. If it
				requires an account to download your code, ask yourself why.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If you've already been charged unexpectedly,</strong>
				dispute the charge with your bank or credit card company. Many users report success
				with chargebacks for services they didn't knowingly consent to. Document the
				misleading marketing and the lack of clear trial disclosure.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			The QR code industry is one example of a broader pattern in software: wrapping trivial
			computation in subscriptions propped up by dark patterns. A QR code is encoded text.
			Generating one is a solved problem that takes less than a millisecond. There's no ongoing
			service, no complex infrastructure, no reason for a recurring charge — unless the business
			model depends on manufacturing one.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We're building nah as a set of free browser-based utilities that replace this kind
			of predatory software, starting with QR codes. The code is open. The tools are free.
			And if you find them useful, the best thing you can do is share them with someone who
			needs a QR code and doesn't know about the trap.
		</p>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			Your QR codes belong to you. They always did.
		</p>
	</section>

	<div class="mt-12 rounded-xl border border-border bg-surface p-8 text-center">
		<p class="mb-4 text-lg text-text">Ready to make a QR code that actually stays free?</p>
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover"
		>
			Create a free QR code
		</a>
	</div>
</article>
