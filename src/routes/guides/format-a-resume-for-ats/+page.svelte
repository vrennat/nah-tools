<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	// STUB — structural scaffold only. "content" owns: dek, seoTitle,
	// description, publishedDate, the body prose below, and faqs. Swap the
	// placeholder strings for the real article and delete this comment block.
	const faqs: { question: string; answer: string }[] = [];
</script>

<ArticleShell
	path="/guides/format-a-resume-for-ats"
	dek="TBD — content: one-line summary shown under the headline."
	seoTitle="TBD — content: Format a Resume for ATS | nah"
	description="TBD — content: meta description for search results and social cards."
	publishedDate="2026-07-28"
	{faqs}
>
	<p class="text-sm leading-relaxed text-text-muted">
		TBD — content: article body goes here. Cross-link to <a href="/resume" class="text-accent hover:underline">/resume</a> where relevant.
	</p>
</ArticleShell>
