<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description: string;
		children: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl">
			{title}
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			{description}
		</p>
	</section>

	<div class="rounded-lg border border-border bg-surface-alt px-4 py-3 text-center text-sm text-text-muted">
		<span class="font-medium">Privacy first:</span> Files never leave your device — 100% client-side processing.
	</div>

	<div class="mx-auto max-w-3xl">
		{@render children?.()}
	</div>
</div>
