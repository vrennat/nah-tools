<script lang="ts">
	import FAQSchema from '$components/FAQSchema.svelte';

	const faqs = [
		{
			question: 'Is it really free?',
			answer:
				'Yes. Completely free, no limits, no hidden tiers. WiFi QR codes are trivial to generate — there is no reason to charge for them. Other sites charge because they can, not because it costs them anything.'
		},
		{
			question: 'Does the QR code expire?',
			answer:
				'No. The QR code encodes your WiFi credentials directly (this is called a static QR code). It does not go through any server, so there is nothing to expire or shut off. It will work for as long as your WiFi network exists with those credentials.'
		},
		{
			question: 'Is my WiFi password safe?',
			answer:
				'Your password is encoded into the QR code entirely in your browser. It is never transmitted to any server. That said, anyone who scans the QR code will be able to connect to your network, so treat the printed code the way you would treat a written-down password.'
		},
		{
			question: 'What encryption type should I choose?',
			answer:
				'Almost all modern networks use WPA/WPA2 — pick that if you are unsure. WEP is an older, less secure standard. If your network has no password, select None.'
		},
		{
			question: 'Does it work on both iPhone and Android?',
			answer:
				'Yes. Both iOS (11 and later) and Android phones can scan WiFi QR codes using the built-in camera app. No special app is needed.'
		}
	];
</script>

<FAQSchema {faqs} />

<svelte:head>
	<title>Free WiFi QR Code Generator — Nah Tools</title>
	<meta name="description" content="Create a free WiFi QR code so guests can join your network instantly. No signup, no expiration. Enter your network name and password, download, and print." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-12">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free WiFi QR Code Generator
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Create a QR code that lets anyone join your WiFi network instantly. Guests scan it with their phone camera — no typing long passwords, no asking you to repeat it. It takes about 10 seconds and costs nothing.
		</p>
		<a
			href="/qr"
			class="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free WiFi QR Code &rarr;
		</a>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">How to Create a Free WiFi QR Code</h2>
		<ol class="mt-6 space-y-6">
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">1</span>
				<div>
					<h3 class="font-semibold text-text">Enter your network name (SSID)</h3>
					<p class="mt-1 text-text-muted">This is the WiFi network name that appears when people search for available networks. It needs to match exactly, including capitalization.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">2</span>
				<div>
					<h3 class="font-semibold text-text">Enter your WiFi password</h3>
					<p class="mt-1 text-text-muted">Type the password for your network. It is encoded directly into the QR code and never sent to any server — everything runs in your browser.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">3</span>
				<div>
					<h3 class="font-semibold text-text">Select your encryption type</h3>
					<p class="mt-1 text-text-muted">Choose WPA/WPA2 (most common for home and business networks), WEP (older, less secure), or None for open networks. If you are unsure, WPA/WPA2 is almost certainly correct.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">4</span>
				<div>
					<h3 class="font-semibold text-text">Generate your QR code</h3>
					<p class="mt-1 text-text-muted">The QR code appears instantly as you type. You can customize colors and dot styles if you want it to match your branding or decor.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">5</span>
				<div>
					<h3 class="font-semibold text-text">Download and print</h3>
					<p class="mt-1 text-text-muted">Download as PNG or SVG. Print it and place it near your router, on a table tent, at the front desk, or wherever guests need it. The QR code never expires — it works forever.</p>
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
				<span><strong class="text-text">No expiration.</strong> Your QR code is a static encoding of your WiFi credentials. It works as long as your network does.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">100% client-side.</strong> Your WiFi password never leaves your browser. Nothing is sent to any server.</span>
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
				<p class="mt-2 text-text-muted">Yes. Completely free, no limits, no hidden tiers. WiFi QR codes are trivial to generate — there is no reason to charge for them. Other sites charge because they can, not because it costs them anything.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Does the QR code expire?</h3>
				<p class="mt-2 text-text-muted">No. The QR code encodes your WiFi credentials directly (this is called a static QR code). It does not go through any server, so there is nothing to expire or shut off. It will work for as long as your WiFi network exists with those credentials.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Is my WiFi password safe?</h3>
				<p class="mt-2 text-text-muted">Your password is encoded into the QR code entirely in your browser. It is never transmitted to any server. That said, anyone who scans the QR code will be able to connect to your network, so treat the printed code the way you would treat a written-down password.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">What encryption type should I choose?</h3>
				<p class="mt-2 text-text-muted">Almost all modern networks use WPA/WPA2 — pick that if you are unsure. WEP is an older, less secure standard. If your network has no password, select None.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Does it work on both iPhone and Android?</h3>
				<p class="mt-2 text-text-muted">Yes. Both iOS (11 and later) and Android phones can scan WiFi QR codes using the built-in camera app. No special app is needed.</p>
			</div>
		</div>
	</section>

	<section class="text-center">
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free WiFi QR Code Now &rarr;
		</a>
	</section>
</div>
