<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} — nah</title>
</svelte:head>

<div class="flex flex-col items-center justify-center py-24 text-center">
	<p class="font-mono text-6xl font-bold text-accent">{page.status}</p>
	<p class="mt-4 text-xl font-medium text-text">
		{page.error?.message ?? 'Something went wrong'}
	</p>
	<p class="mt-2 text-sm text-text-muted">
		{#if page.status === 404}
			This page doesn't exist or was moved.
		{:else}
			An unexpected error occurred. Try refreshing, or go back home.
		{/if}
	</p>
	<a
		href="/"
		class="mt-8 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
	>
		Back to home
	</a>
</div>
