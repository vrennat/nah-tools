<script lang="ts">
	interface FAQ {
		question: string;
		answer: string;
	}

	let { faqs }: { faqs: FAQ[] } = $props();

	const schema = $derived({
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"mainEntity": faqs.map((faq) => ({
			"@type": "Question",
			"name": faq.question,
			"acceptedAnswer": {
				"@type": "Answer",
				"text": faq.answer
			}
		}))
	});
</script>

<!--
Usage example:

<script lang="ts">
	import FAQSchema from '$lib/components/FAQSchema.svelte';

	const faqs = [
		{ question: "Is this WiFi QR code generator free?", answer: "Yes, completely free with no signup required." },
		{ question: "How do I create a QR code for my WiFi?", answer: "Enter your network name, password, and encryption type, then download the QR code." }
	];
</script>

<FAQSchema {faqs} />
-->

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify(schema)}</script>`}
</svelte:head>
