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
	<Header />
	<main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
		{@render children()}
	</main>
	<Footer />
</div>
