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
				'Paste a job posting in and it compares the posting\'s keywords against the words already in your resume, showing what overlaps and what\'s missing. It\'s literal keyword overlap, not a judgment of whether you\'re actually qualified.'
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
	dek="Applicant tracking systems don't reject you for typos — they reject resumes they can't parse. Here's what actually trips them up, and how to check for it."
	seoTitle="How to Format a Resume for ATS (Applicant Tracking Systems) | nah"
	description="Many resumes get filtered before a human ever sees them, because an applicant tracking system fails to parse the formatting. Learn what actually breaks ATS parsing and how to check for free."
	publishedDate="2026-07-28"
	{faqs}
>
	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What actually breaks ATS parsing</h2>
		<p class="leading-relaxed text-text-muted">
			Applicant tracking systems extract text from your resume file and slot it into fields — name,
			experience, skills — for a recruiter to search and filter later. The well-established list of
			things that trip that extraction up: multi-column layouts (text gets read out of order), text
			embedded in images or graphics (nothing to extract at all), tables used for layout rather than
			data, contact info stuck in a header or footer some parsers skip, and section titles that
			don't match what the system expects (a "Where I've Worked" heading instead of "Experience," for
			instance).
		</p>
		<p class="leading-relaxed text-text-muted">
			None of this is about being visually plain — a well-designed single-column resume with
			standard section headers parses just as cleanly as a boring one. It's specifically the layout
			tricks that confuse text extraction that cause problems.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What nah.tools' checker actually checks</h2>
		<p class="leading-relaxed text-text-muted">
			The <a href="/resume" class="text-accent underline hover:text-accent-hover">resume builder</a>'s
			ATS panel runs a fixed structural checklist, not a simulation of any specific vendor's
			software: does your resume have a name, email, and phone number; a professional summary; at
			least one work experience entry with actual bullet points describing what you did; an
			education section; and a dedicated skills section. Each gap it finds costs points off a
			100-point score, and it tells you exactly what's missing.
		</p>
		<p class="leading-relaxed text-text-muted">
			Paste in a job description and it separately compares that posting's keywords against the
			words already in your resume — a literal overlap check, showing which terms from the posting
			show up in your resume and which don't.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">What it doesn't do</h2>
		<p class="leading-relaxed text-text-muted">
			It's not a simulation of Workday, Greenhouse, Taleo, or any other specific ATS — none of them
			publish their exact parsing logic, and no tool, free or paid, can promise it replicates a
			particular employer's software. A high score here means the common structural red flags are
			handled and the standard sections are present. It doesn't mean a specific employer's system
			will process your resume perfectly, and it doesn't evaluate whether you're actually qualified
			for the role — that part is still on you.
		</p>
	</section>

	<section class="space-y-4">
		<h2 class="font-display text-2xl font-700 text-text">Steps</h2>
		<ul class="list-disc space-y-2 pl-6">
			<li class="leading-relaxed text-text-muted">Build or import your resume at <a href="/resume" class="text-accent underline hover:text-accent-hover">/resume</a>.</li>
			<li class="leading-relaxed text-text-muted">Open the ATS panel and paste in the job description you're applying against.</li>
			<li class="leading-relaxed text-text-muted">Review the compatibility score and the list of missing keywords.</li>
			<li class="leading-relaxed text-text-muted">Fix the flagged structural gaps first — those are the fixes most likely to matter across any ATS — then work through the keyword gaps that genuinely apply to your experience.</li>
		</ul>
	</section>
</ArticleShell>
