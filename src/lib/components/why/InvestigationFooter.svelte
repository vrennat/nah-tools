<script lang="ts">
	import { getArticle, getRelatedArticles } from '$lib/why/articles';

	interface Props {
		slug: string;
	}

	let { slug }: Props = $props();

	const article = $derived(getArticle(slug));
	const related = $derived(getRelatedArticles(slug));
</script>

{#if article}
	<div class="mx-auto max-w-3xl">
		<!-- CTA card -->
		<div class="mt-12 rounded-xl border border-border bg-surface p-8 text-center">
			<p class="mb-4 text-lg text-text">Ready to skip the trap?</p>
			<a
				href={article.toolHref}
				class="inline-block rounded-lg bg-accent px-6 py-3 font-semibold text-white hover:bg-accent-hover"
			>
				{article.toolCta}
			</a>
		</div>

		<!-- Series footer -->
		<footer class="mt-12 border-t border-border pt-8 pb-4">
			<div class="mb-6 flex items-center justify-between">
				<p class="text-sm text-text-muted">
					Part of the <a href="/why" class="text-accent hover:text-accent-hover">nah investigation series</a>
				</p>
				<a href="/why/protect" class="text-sm text-accent hover:text-accent-hover">
					Consumer protection resources &rarr;
				</a>
			</div>

			{#if related.length > 0}
				<div class="grid gap-3 sm:grid-cols-2">
					{#each related as rel}
						<a
							href="/why/{rel.slug}"
							class="group rounded-lg border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface-alt"
						>
							<p class="text-sm font-medium text-text group-hover:text-accent">{rel.title}</p>
							<p class="mt-1 text-xs text-text-muted">{rel.summary}</p>
						</a>
					{/each}
				</div>
			{/if}
		</footer>
	</div>
{/if}
