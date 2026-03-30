<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';

	let { children } = $props();

	let isHome = $derived(page.url.pathname === '/');
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "Nah Tools",
		"url": "https://nah.tools",
		"description": "Free, open-source QR code generator. No signup, no expiration, no catch.",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://nah.tools/?q={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	})}</script>`}
</svelte:head>

<div class="flex min-h-screen flex-col">
	{#if !isHome}
		<Header />
	{/if}
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 sm:px-6 lg:px-8 {isHome ? 'pt-8 sm:pt-12' : 'pt-24'}">
		{@render children()}
	</main>
	<Footer />
</div>
