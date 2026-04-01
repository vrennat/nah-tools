<script lang="ts">
	interface Props {
		html: string;
	}

	let { html }: Props = $props();
</script>

<div class="flex flex-col h-full">
	<div class="mb-4 pb-4 border-b border-border">
		<h3 class="text-sm font-semibold text-text">Generated Document</h3>
	</div>

	<div class="flex-1 overflow-auto">
		<article class="doc-preview">
			{@html html}
		</article>
	</div>
</div>

<style>
	:global(.doc-preview) {
		font-size: 0.875rem;
		line-height: 1.625;
	}

	:global(.doc-preview h1) {
		font-size: 1.5rem;
		font-weight: bold;
		margin-top: 1.5rem;
		margin-bottom: 1rem;
	}

	:global(.doc-preview h2) {
		font-size: 1.125rem;
		font-weight: bold;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid rgb(var(--color-border) / 1);
		padding-bottom: 0.5rem;
	}

	:global(.doc-preview h3) {
		font-size: 1rem;
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 0.5rem;
	}

	:global(.doc-preview p) {
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
	}

	:global(.doc-preview ul) {
		list-style-type: disc;
		list-style-position: inside;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		padding-left: 1rem;
	}

	:global(.doc-preview ol) {
		list-style-type: decimal;
		list-style-position: inside;
		margin-top: 0.75rem;
		margin-bottom: 0.75rem;
		padding-left: 1rem;
	}

	:global(.doc-preview li) {
		margin-top: 0.25rem;
		margin-bottom: 0.25rem;
	}

	:global(.doc-preview a) {
		color: rgb(var(--color-accent) / 1);
		text-decoration: none;
	}

	:global(.doc-preview a:hover) {
		text-decoration: underline;
	}

	:global(.doc-preview strong) {
		font-weight: 600;
	}

	:global(.doc-preview em) {
		font-style: italic;
	}
</style>
