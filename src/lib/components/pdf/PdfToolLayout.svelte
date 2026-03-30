<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		description,
		children
	}: {
		title: string;
		description: string;
		children: Snippet;
	} = $props();
</script>

<div class="space-y-8">
	<section class="text-center">
		<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
		<p class="mx-auto mt-3 max-w-2xl text-text-muted">{description}</p>
		<p class="mt-2 text-xs text-text-muted">
			<svg
				class="mr-1 inline-block h-3.5 w-3.5"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			Files never leave your device — 100% client-side
		</p>
	</section>

	{@render children()}
</div>
