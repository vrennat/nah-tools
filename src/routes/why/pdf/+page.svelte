<svelte:head>
	<title>The PDF Shakedown: How "Free" PDF Tools Charge $96/Year for Government Forms</title>
	<meta
		name="description"
		content="PDFFiller ranks above government websites and charges $96/year for forms your taxes paid for. Here's the evidence and a free alternative."
	/>
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The PDF Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How "free" PDF tools charge $96/year to fill out government forms your tax dollars already paid for.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			You need to fill out a DMV form. You search for the form name. The first result has it ready to fill out online. You spend twenty minutes entering your information. Name, address, Social Security number, date of birth. You click "Save."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			A login screen pops up. To download the form you just filled out, the government form that should be freely available, you need to create an account. To save or print, you need a "free trial." The trial needs your credit card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You're in a rush. The form is due. You enter your card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			$96 shows up on your statement. The trial converted to an annual subscription. No confirmation email. No warning. $96 for the privilege of saving a PDF that the government publishes for free.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			The company behind this is valued at $1.25 billion.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The government form trap</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			PDFFiller, owned by airSlate, has built landing pages for thousands of government forms. Tax documents, DMV applications, immigration paperwork, court filings. These pages are optimized to rank above the actual government websites that host the same forms for free.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			So when someone searches for "IRS Form W-4" or "DMV registration renewal," PDFFiller shows up before IRS.gov or the state DMV site. The page looks semi-official. The form is right there, ready to fill out. Nothing makes it obvious that this is a private company, not a government service.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			airSlate has raised <strong class="text-text">$185 million</strong>, reached a <strong class="text-text">$1.25 billion valuation</strong>, and pulled in <strong class="text-text">$141 million in revenue in 2024</strong>. A lot of that comes from people who didn't know they were using a paid product to access a free government document.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What the BBB found</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The Better Business Bureau ran an AI analysis of PDFFiller complaints in April 2024. The findings: the vast majority of complaints involved people being charged without their knowledge or consent. <strong class="text-text">$96 was the single most commonly reported unauthorized charge.</strong>
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Most complainants had never heard of airSlate and didn't realize their interaction with PDFFiller had enrolled them in a recurring subscription. Some were charged through linked payment methods like Venmo without realizing those were on file.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			airSlate's official response to the BBB: "99% of the complaints are, sadly, related to the fact that some people do not understand how free trial period works."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			PDFFiller has a <strong class="text-text">1.8 out of 5 on PissedConsumer</strong> from 88 reviews. 77% unfavorable.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The rest of the PDF tool market</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">SmallPDF</strong> is a top-200 website globally, with roughly $11 million in revenue. Its free tier gives you <strong class="text-text">two actions per day</strong>. Merging a PDF and downloading the result counts as two actions. One task per day on the free plan.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Soda PDF</strong>, owned by Avanquest (a subsidiary of publicly traded Claranova), has a <strong class="text-text">1.0 out of 5 on PissedConsumer</strong>. The lowest rating I found across every company I looked into.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Claranova's strategy is in their investor materials. They shifted from 50% subscription revenue in 2019 to <strong class="text-text">92% by 2024</strong>, hitting 21.3% EBITDA margins. The playbook: buy PDF tools, convert them to subscriptions. The technology doesn't change. The billing does.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">iLovePDF</strong> and <strong class="text-text">PDF24</strong> prove you can run PDF tools without dark patterns. PDF24 is entirely free with no account required. They exist. They just get outranked by the predatory ones in search results.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What PDF tools actually do</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Every operation that online PDF tools charge for can run entirely in your browser with no server involvement.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Merge:</strong> Combining PDF files is a file concatenation operation. <a href="https://pdf-lib.js.org/" class="text-accent underline hover:text-accent-hover">pdf-lib</a> does it in the browser in under a second.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Split:</strong> Extracting pages is the inverse. Same library, same speed.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Compress:</strong> Reducing file size by recompressing images and stripping metadata. Runs client-side.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Rotate:</strong> Changing page orientation modifies one property in the PDF's internal structure. Computationally free.</p>
		<p class="mb-4 leading-relaxed text-text-muted"><strong class="text-text">Fill forms:</strong> PDF forms use a standard interactive format. pdf-lib reads the fields, accepts input, writes the values back. All in your browser.</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			None of these require your files to leave your device. <a href="https://github.com/Stirling-Tools/Stirling-PDF" class="text-accent underline hover:text-accent-hover">Stirling-PDF</a> has <strong class="text-text">69,000+ GitHub stars</strong> and covers 60+ PDF operations. The entire category of paid PDF tools is built on manufactured scarcity.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">People filing government paperwork.</strong> Government forms are public documents, created with tax money, meant to be free. When a private company puts itself between citizens and their own government forms, collects their Social Security numbers, and charges $96/year for a save button, that's exploitation of a public service.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Students.</strong> Merging assignment PDFs or compiling research papers hits SmallPDF's two-action limit immediately.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small businesses.</strong> Invoices, contracts, tax filings, permits. A business owner who merges two invoices has exhausted SmallPDF's daily limit.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Anyone in a hurry.</strong> Same pattern as every other category. You need to merge something for a meeting in 30 minutes. The paywall appears when you're least able to walk away.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			I built <a href="/pdf" class="text-accent underline hover:text-accent-hover">nah.tools/pdf</a> because nobody should pay $96/year to merge two documents.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Ten PDF tools: merge, split, compress, rotate, reorder, remove pages, add page numbers, add watermarks, images to PDF, PDF to images. Every operation runs in your browser. Your files never leave your device. No upload, no server processing, no file size limit beyond your browser's memory.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			No daily action limit. No trial. No account. No credit card. The <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">source code</a> is public and MIT-licensed.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to protect yourself</h2>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Get government forms from government websites.</strong> IRS forms at IRS.gov. DMV forms at your state's DMV site. Immigration forms at USCIS.gov. Never fill out government forms on third-party sites.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Check the URL.</strong> If the site doesn't end in .gov, you're not on a government website.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Never enter a credit card for basic PDF operations.</strong> Merging, splitting, compressing, and rotating PDFs are simple file operations. If a tool charges for them, you're overpaying.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Use built-in tools first.</strong> macOS Preview can merge, split, annotate, and fill PDFs. Chrome and Edge can print anything to PDF. LibreOffice Draw can edit PDF content. All free.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">If you've been charged,</strong> dispute it with your bank. Document the misleading interface and file a chargeback.</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A PDF merge is like stapling two stacks of paper together. Nobody should pay $96/year to staple papers together. Nobody should pay $96/year to access a form their taxes already paid for.
		</p>
	</section>

	<div class="mt-12 rounded-xl border border-border bg-surface p-8 text-center">
		<p class="mb-4 text-lg text-text">Ready to use PDF tools that are actually free?</p>
		<a
			href="/pdf"
			class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover"
		>
			Use free PDF tools
		</a>
	</div>
</article>
