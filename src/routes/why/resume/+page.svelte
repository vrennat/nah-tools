<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Resume Shakedown: How 'Free' Resume Builders Trap Job Seekers into Paying $389/Year"
	description="BOLD LLC runs four resume brands that look like competitors. Same company, same trap. Here's the evidence."
	slug="resume"
	datePublished="2026-03-30"
	dateModified="2026-03-30"
/>

<svelte:head>
	<title>The Resume Shakedown: How "Free" Resume Builders Trap Job Seekers into Paying $389/Year</title>
	<meta
		name="description"
		content="BOLD LLC runs four resume brands that look like competitors. Same company, same trap. Here's how it works and a free alternative."
	/>
	<meta property="og:title" content="The Resume Shakedown" />
	<meta property="og:description" content="BOLD LLC runs four resume brands that look like competitors. Same company, same trap." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/resume" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Resume Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How "free" resume builders trap job seekers into paying $389/year for a PDF.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			You're applying for a job. The posting closes tomorrow. You don't have an updated resume, so you search for "free resume builder." The first result looks great. Modern templates, ATS optimization, the works. You spend 45 minutes entering your work history, education, skills, references. You pick a template, tweak the layout, and it looks perfect.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You click "Download."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			A payment screen shows up. Your resume, the one you just spent 45 minutes building, is locked behind a $2.95 "14-day trial." You're running out of time. The application is due tonight. You enter your credit card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Four weeks later, $25.95 disappears from your bank account. No email, no receipt, no notification. Four weeks after that, another $25.95. You don't notice for months. By the time you check your statement, you've been charged over $150 for a document you used once.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You try to cancel. The cancel button doesn't work. You try with your ad-blocker off. Still broken. You finally find a multi-step cancellation flow designed to talk you out of leaving. You submit it. The charges keep coming.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			This isn't a bug. It's a $628 million business.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">One company, four brands, one trap</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			BOLD LLC, based in Puerto Rico, runs four of the most-visited resume builders on the internet:
		</p>
		<ul class="mb-4 list-disc space-y-2 pl-6 text-text-muted">
			<li class="leading-relaxed"><strong class="text-text">Zety</strong> (zety.com)</li>
			<li class="leading-relaxed"><strong class="text-text">LiveCareer</strong> (livecareer.com)</li>
			<li class="leading-relaxed"><strong class="text-text">MyPerfectResume</strong> (myperfectresume.com)</li>
			<li class="leading-relaxed"><strong class="text-text">Resume Genius</strong> (resumegenius.com, through subsidiary Sonaga Tech)</li>
		</ul>
		<p class="mb-4 leading-relaxed text-text-muted">
			Four brands. Four websites. Four sets of Google Ads. Same parent company. Same billing system. Same trap.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			When you have a bad experience with Zety and search for an alternative, you're likely to land on LiveCareer or MyPerfectResume. Same company. Same bait-and-switch. BOLD's multi-brand strategy isn't about offering different products. It's about taking up as many search results as possible so that switching feels like choosing when it's really just staying.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			BOLD employs between 1,000 and 5,000 people across 21 locations. Estimated annual revenue: <strong class="text-text">$628 million</strong>. The overall resume builder market is worth about $1.64 billion in 2025 and is projected to hit $3.06 billion by 2032. BOLD captured a huge chunk of a billion-dollar market by running the same trick through four storefronts.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How the billing actually works</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			You build your resume for free. The tool works great. AI suggestions, formatting options, ATS scoring. Then you try to download and find out that usable formats need a credit card.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">The prices after the trial converts:</p>
		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 leading-relaxed text-text-muted"><strong class="text-text">Zety:</strong> $25.95 every four weeks</p>
			<p class="mb-3 leading-relaxed text-text-muted"><strong class="text-text">MyPerfectResume:</strong> $34.95 every four weeks</p>
			<p class="mb-3 leading-relaxed text-text-muted"><strong class="text-text">Resume.io:</strong> $29.95 every four weeks</p>
			<p class="leading-relaxed text-text-muted">Every four weeks, not monthly. That's <strong class="text-text">13 billing cycles per year</strong> instead of 12. The same four-week billing trick appears across <a href="/why/pdf" class="text-accent underline hover:text-accent-hover">PDF tools</a> too.</p>
		</div>
		<p class="mb-4 leading-relaxed text-text-muted">
			On Zety, that works out to <strong class="text-text">$337/year</strong>. On Resume.io, it's <strong class="text-text">$389/year</strong>. For a PDF export of an HTML template.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Resume Genius does something especially shady. It routes billing receipts to the email address on the resume, not the account email. The email you put on your resume is the one you're sending to potential employers. You're not checking it for billing notifications. That's not an accident.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What the reviews say</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Zety:</strong> <a href="https://www.pissedconsumer.com/zety/reviews.html" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">1.3 out of 5 on PissedConsumer</a>. 87% unfavorable.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Resume Genius:</strong> <a href="https://www.pissedconsumer.com/resume-genius/reviews.html" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">1.3 out of 5 on PissedConsumer</a>. Users consistently report unauthorized charges and difficulty canceling.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Resume.io:</strong> <a href="https://www.producthunt.com/products/resume-io/reviews" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">1.5 out of 5 on ProductHunt</a>. Their own FAQ page admits users may have "selected a subscription extension instead of completing the full cancellation process." They're acknowledging the interface is confusing and framing it as your fault.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			One Trustpilot reviewer reported being charged <strong class="text-text">$590 over two years</strong> without using the service. A PissedConsumer user: "Resume Genius stole $167.65 from me."
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Resume builders don't target everyone equally. They hit the most vulnerable people hardest.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Job seekers under pressure.</strong> Someone whose unemployment is running out, who has an application due tonight, who just got laid off. They're the least able to shop around and the most likely to enter a credit card under stress.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Young people building their first resume.</strong> College students and recent grads with no existing template. Most likely to search "free resume builder," least likely to know about alternatives, least likely to catch recurring charges on a card they're still learning to manage.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Non-native English speakers.</strong> Interfaces that are intentionally confusing become doubly effective for people navigating them in a second language.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Career changers and people re-entering the workforce.</strong> Returning to work after caregiving, illness, or incarceration. Same time pressure, fewer resources, less familiarity with current tools.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The common thread: the people who need resume help the most urgently are the most vulnerable to the trap. A $25.95 charge every four weeks is annoying for a senior engineer. For someone between jobs, it's groceries.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What a resume actually is</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			A resume is structured text rendered into a layout and exported as a PDF. That's it. There is no complex computation. No server processing. It's a form that outputs a formatted document.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text"><a href="https://rxresu.me" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Reactive Resume</a></strong> (<a href="https://github.com/AmruthPillworking/Reactive-Resume" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">GitHub</a>) has 28,000+ GitHub stars. Full-featured, multiple templates, drag-and-drop, PDF export. Free, open source, no data collection.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text"><a href="https://www.open-resume.com/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">OpenResume</a></strong> (<a href="https://github.com/xitanggg/open-resume" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">GitHub</a>) has 7,200+ GitHub stars. Runs entirely in the browser. No signup, no data leaving your device.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			These aren't demos. They're mature tools that do everything the paid ones do, minus the billing trap.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			I built <a href="/resume" class="text-accent underline hover:text-accent-hover">nah.tools/resume</a> because looking for a job is stressful enough without your resume builder scamming you.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			It's a free, open-source resume builder with ATS-optimized templates, real-time preview, and PDF/DOCX export. No signup, no trial, no credit card. Your data lives in your browser's local storage with auto-save. It never touches a server. I couldn't see your resume if I wanted to. There's nowhere for it to go.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			It's free because it costs me nothing to run. Your browser does all the work.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to protect yourself</h2>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Never enter a credit card for a "free" tool.</strong> If it asks for payment info, it's a trial. Walk away.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Check who owns the product.</strong> If you had a bad experience with one resume builder, look up the parent company before trying another. Four of the biggest brands are the same company.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text"><a href="https://docs.google.com/document/u/0/?ftv=1&tgif=c" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">Google Docs</a> has free resume templates.</strong> So does Microsoft Word online. So does LibreOffice. They're not marketed as "resume builders" but they produce the same output.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">If you've already been charged,</strong> check your statement for recurring charges from names you don't recognize. Dispute with your bank. Many people report success with chargebacks.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Watch for four-week billing.</strong> If a service bills "every four weeks" instead of "monthly," that's 13 charges per year, not 12.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Your resume data belongs to you.</strong> Any builder that won't export to PDF or DOCX without payment is holding your own information hostage.</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A resume is your work history formatted as a PDF. That's all it is. It shouldn't cost $389 per year. It shouldn't cost anything.
		</p>
	</section>

	<InvestigationFooter slug="resume" />
</article>
