<script lang="ts">
	import FAQSchema from '$components/FAQSchema.svelte';

	const faqs = [
		{
			question: 'Is it really free?',
			answer:
				'Yes. Completely free, no limits. An SMS QR code is just an encoded sms: link — there is nothing to charge for.'
		},
		{
			question: 'Can I pre-fill the message?',
			answer:
				'Yes. You can set a default message body that appears when someone scans the code. They can edit it before sending if they want.'
		},
		{
			question: 'Does it work on all phones?',
			answer:
				'Yes. Both iPhone and Android phones recognize sms: links from QR codes and open the default messaging app. The user taps send to complete the message — it is never sent automatically.'
		}
	];
</script>

<FAQSchema {faqs} />

<svelte:head>
	<title>Free SMS QR Code Generator — Text Message QR Code — nah</title>
	<meta name="description" content="Create a free QR code that opens a pre-filled text message. Set the phone number and message. Scan to text instantly. No signup, no expiration." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-12">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free SMS QR Code Generator
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Create a QR code that opens a text message with the phone number and message body already filled in. People scan it and their messaging app opens, ready to send. Useful for opt-ins, RSVPs, customer support, and quick-response campaigns.
		</p>
		<a
			href="/qr"
			class="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free SMS QR Code &rarr;
		</a>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">How to Create a Free SMS QR Code</h2>
		<ol class="mt-6 space-y-6">
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">1</span>
				<div>
					<h3 class="font-semibold text-text">Enter the phone number</h3>
					<p class="mt-1 text-text-muted">Type the phone number that should receive the text message. Include the country code for international numbers (e.g., +1 for US/Canada).</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">2</span>
				<div>
					<h3 class="font-semibold text-text">Pre-fill the message (optional)</h3>
					<p class="mt-1 text-text-muted">Add a default message body so people do not have to type anything. For example: "Yes, I'd like to RSVP" or "I'm interested in learning more." The sender can still edit the message before sending.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">3</span>
				<div>
					<h3 class="font-semibold text-text">Generate your QR code</h3>
					<p class="mt-1 text-text-muted">The QR code updates in real time. Customize colors and dot style if you want it to match your branding.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">4</span>
				<div>
					<h3 class="font-semibold text-text">Download and share</h3>
					<p class="mt-1 text-text-muted">Download as PNG or SVG. Print on flyers, posters, event materials, or product packaging. The QR code never expires.</p>
				</div>
			</li>
		</ol>
	</section>

	<section class="rounded-xl border border-border bg-surface p-6">
		<h2 class="text-xl font-bold text-text">Why Use nah</h2>
		<ul class="mt-4 space-y-3 text-text-muted">
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">No signup required.</strong> Just open the page and start creating.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">No expiration.</strong> The QR code encodes a standard sms: link. It works forever, no server dependency.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">100% client-side.</strong> Your phone number and message text never leave your browser.</span>
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
				<p class="mt-2 text-text-muted">Yes. Completely free, no limits. An SMS QR code is just an encoded sms: link — there is nothing to charge for.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Can I pre-fill the message?</h3>
				<p class="mt-2 text-text-muted">Yes. You can set a default message body that appears when someone scans the code. They can edit it before sending if they want.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Does it work on all phones?</h3>
				<p class="mt-2 text-text-muted">Yes. Both iPhone and Android phones recognize sms: links from QR codes and open the default messaging app. The user taps send to complete the message — it is never sent automatically.</p>
			</div>
		</div>
	</section>

	<section class="text-center">
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free SMS QR Code Now &rarr;
		</a>
	</section>
</div>
