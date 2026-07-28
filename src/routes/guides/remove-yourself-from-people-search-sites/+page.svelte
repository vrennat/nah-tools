<script lang="ts">
	import ArticleShell from '$components/ArticleShell.svelte';

	// STUB — structural scaffold only. "content" owns: dek, seoTitle,
	// description, publishedDate, the body prose below, and faqs. Swap the
	// placeholder strings for the real article and delete this comment block.
	const faqs: { question: string; answer: string }[] = [];
</script>

<ArticleShell
	path="/guides/remove-yourself-from-people-search-sites"
	dek="TBD — content: one-line summary shown under the headline."
	seoTitle="TBD — content: Remove Yourself From People-Search Sites | nah"
	description="TBD — content: meta description for search results and social cards."
	publishedDate="2026-07-28"
	{faqs}
>
	<p class="text-sm leading-relaxed text-text-muted">
		TBD — content: article body goes here. Cross-link to <a href="/remove" class="text-accent hover:underline">/remove</a> where relevant.
	</p>
</ArticleShell>
