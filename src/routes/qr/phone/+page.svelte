<script lang="ts">
	import FAQSchema from '$components/FAQSchema.svelte';

	const faqs = [
		{
			question: 'Is it really free?',
			answer:
				'Yes. Completely free, no limits. A phone number QR code is just an encoded tel: link — there is nothing to charge for.'
		},
		{
			question: 'Does it work with international numbers?',
			answer:
				'Yes. Include the country code (e.g., +44 for UK, +81 for Japan) and the QR code will work from anywhere in the world. The person scanning still pays their normal calling rates.'
		},
		{
			question: 'Will it call immediately or just dial the number?',
			answer:
				'On most phones, scanning the QR code opens the dialer with the number filled in. The user then taps the call button to connect. This is a security feature — phones do not auto-dial without user confirmation.'
		}
	];
</script>

<FAQSchema {faqs} />

<svelte:head>
	<title>Free Phone Number QR Code Generator — Nah Tools</title>
	<meta name="description" content="Create a free QR code for a phone number. Scan to call instantly. No signup, no expiration. Works with any phone number worldwide." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-12">
	<section class="text-center">
		<h1 class="text-4xl font-bold tracking-tight text-text sm:text-5xl">
			Free Phone Number QR Code Generator
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Create a QR code that dials a phone number when scanned. Put it on business cards, flyers, signage, or anywhere you want people to call you with one scan instead of typing a number.
		</p>
		<a
			href="/qr"
			class="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free Phone QR Code &rarr;
		</a>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">How to Create a Free Phone Number QR Code</h2>
		<ol class="mt-6 space-y-6">
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">1</span>
				<div>
					<h3 class="font-semibold text-text">Enter the phone number</h3>
					<p class="mt-1 text-text-muted">Type the full phone number including country code for international numbers (e.g., +1 for US/Canada, +44 for UK). For local numbers, the format you normally dial works fine.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">2</span>
				<div>
					<h3 class="font-semibold text-text">Generate your QR code</h3>
					<p class="mt-1 text-text-muted">The QR code appears instantly. You can customize colors and style if needed.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">3</span>
				<div>
					<h3 class="font-semibold text-text">Download and use</h3>
					<p class="mt-1 text-text-muted">Download as PNG or SVG. Print it on business cards, brochures, menus, real estate signs, or any material where you want people to call you. The QR code never expires.</p>
				</div>
			</li>
		</ol>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6">
		<h2 class="text-xl font-bold text-text">Why Use Nah Tools</h2>
		<ul class="mt-4 space-y-3 text-text-muted">
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">No signup required.</strong> Just open the page and start creating.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">No expiration.</strong> The QR code encodes a standard tel: link. It works forever.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">100% client-side.</strong> Your phone number is encoded in your browser. Nothing is sent to any server.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">Open source.</strong> The code is public on GitHub. You can verify exactly what it does.</span>
			</li>
		</ul>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">Frequently Asked Questions</h2>
		<div class="mt-6 space-y-6">
			<div>
				<h3 class="font-semibold text-text">Is it really free?</h3>
				<p class="mt-2 text-text-muted">Yes. Completely free, no limits. A phone number QR code is just an encoded tel: link — there is nothing to charge for.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Does it work with international numbers?</h3>
				<p class="mt-2 text-text-muted">Yes. Include the country code (e.g., +44 for UK, +81 for Japan) and the QR code will work from anywhere in the world. The person scanning still pays their normal calling rates.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Will it call immediately or just dial the number?</h3>
				<p class="mt-2 text-text-muted">On most phones, scanning the QR code opens the dialer with the number filled in. The user then taps the call button to connect. This is a security feature — phones do not auto-dial without user confirmation.</p>
			</div>
		</div>
	</section>

	<section class="text-center">
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free Phone QR Code Now &rarr;
		</a>
	</section>
</div>
