<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	const faqs = [
		{
			question: 'Does a high ATS score guarantee my resume gets through?',
			answer:
				'No — and be skeptical of any tool that implies otherwise. Every applicant tracking system parses differently, and no free or paid checker can simulate the specific software a specific employer uses. A high score here means the common structural red flags are handled, not that a specific ATS will process it cleanly.'
		},
		{
			question: 'What does the nah.tools ATS checker actually check?',
			answer:
				'A fixed checklist: presence of your name, email, and phone number; a professional summary; at least one work experience entry with real bullet points; an education section; and a skills section. It flags what\'s missing and deducts points for each gap — it does not parse or simulate any real ATS vendor.'
		},
		{
			question: 'What does the job-description match do?',
			answer:
				'Paste a job posting in and it compares the posting\'s keywords against the words already in your resume, showing what overlaps and what\'s missing. It uses extracted-keyword overlap and some phrase matching, not a judgment of whether you\'re actually qualified.'
		},
		{
			question: 'Is my resume uploaded anywhere?',
			answer:
				'No. Building, analyzing, and exporting all happen in your browser.'
		}
	];
</script>

<ArticleShell
	path="/guides/format-a-resume-for-ats"
	dek="Resume formatting can affect text extraction. Use a clear structure and check your content without treating a compatibility score as a hiring prediction."
	seoTitle="How to Format a Resume for ATS (Applicant Tracking Systems) | nah"
	description="Learn common resume formatting pitfalls and what the free nah.tools compatibility checklist can and cannot tell you about ATS parsing."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What actually breaks ATS parsing</h2>
		<p class="leading-relaxed text-text-muted">
			Applicant tracking systems extract text from your resume file and slot it into fields — name,
			experience, skills — for a recruiter to search and filter later. Potential extraction problems vary by parser and include multi-column layouts (text may be read out of order), text
			embedded in images or graphics (which may require OCR), tables used for layout rather than
			data, contact info stuck in a header or footer some parsers skip, and section titles that
			don't match what the system expects (a "Where I've Worked" heading instead of "Experience," for
			instance).
		</p>
		<p class="leading-relaxed text-text-muted">
			None of this is about being visually plain — a well-designed single-column resume with
			standard section headers can still be easy to parse. It's specifically the layout
			tricks that confuse text extraction that cause problems.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What nah.tools' checker actually checks</h2>
		<p class="leading-relaxed text-text-muted">
			The <a href="/resume" class="text-accent underline hover:text-accent-hover">resume builder</a>'s
			ATS panel runs a fixed structural checklist, based on the builder's structured data, rather than testing how an employer parses your
			exported file: does your resume have a name, email, and phone number; a professional summary; at
			least one work experience entry with actual bullet points describing what you did; an
			education section; and a dedicated skills section. Each gap it finds costs points off a
			100-point score, and it tells you exactly what's missing.
		</p>
		<p class="leading-relaxed text-text-muted">
			Paste in a job description and it separately compares that posting's keywords against the
			words already in your resume — an extracted-keyword overlap check with some phrase matching, showing which terms from the posting
			show up in your resume and which don't.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What it doesn't do</h2>
		<p class="leading-relaxed text-text-muted">
			It's not a simulation of Workday, Greenhouse, Taleo, or any other specific ATS — an employer's configuration and screening rules can differ from this checklist. A high score here means the fields in this checklist are present. It doesn't mean a specific employer's system
			will process your resume perfectly, and it doesn't evaluate whether you're actually qualified
			for the role — that part is still on you.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Steps</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Build your resume or import a DOCX file at <a href="/resume" class="text-accent underline hover:text-accent-hover">/resume</a>.</li>
			<li class="leading-relaxed text-text-muted">Open the ATS panel and paste in the job description you're applying against.</li>
			<li class="leading-relaxed text-text-muted">Review the compatibility score and the list of missing keywords.</li>
			<li class="leading-relaxed text-text-muted">Fix the flagged structural gaps first — these checks help you review completeness — then work through the keyword gaps that genuinely apply to your experience.</li>
		</ul>
	</section>
</ArticleShell>
