<script lang="ts">
	import '../app.css';
	import Header from '$components/Header.svelte';
	import Footer from '$components/Footer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "WebSite",
		"name": "nah",
		"url": "https://nah.tools",
		"description": "Free, open-source browser tools — QR codes, PDF tools, image editing, link shortening, and more. No signup, no tracking, no catch.",
		"potentialAction": {
			"@type": "SearchAction",
			"target": "https://nah.tools/?q={search_term_string}",
			"query-input": "required name=search_term_string"
		}
	})}</script>`}
</svelte:head>

<a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg">
	Skip to content
</a>

<div class="flex min-h-screen flex-col">
	<Header />
	<main id="main-content" class="mx-auto w-full max-w-6xl flex-1 px-4 pb-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
	<Footer />
</div>
