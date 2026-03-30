<script lang="ts">
	import FAQSchema from '$components/FAQSchema.svelte';

	const faqs = [
		{
			question: 'Is it really free?',
			answer:
				'Yes. Completely free, no limits, no hidden tiers. An email QR code is just an encoded mailto: link — there is nothing to charge for.'
		},
		{
			question: 'Can I pre-fill the subject and body?',
			answer:
				'Yes. You can set both the subject line and message body. The person scanning the code will see these pre-filled in their email app and can edit them before sending.'
		},
		{
			question: 'What email apps does it work with?',
			answer:
				'It works with whatever email app the person has set as their default — Gmail, Apple Mail, Outlook, Yahoo Mail, and others. The QR code creates a standard mailto: link that every email client understands.'
		}
	];
</script>

<FAQSchema {faqs} />

<svelte:head>
	<title>Free Email QR Code Generator — nah</title>
	<meta name="description" content="Create a free QR code that opens a pre-filled email. Set the recipient, subject line, and body text. Scan to compose instantly. No signup, no expiration." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-12">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Email QR Code Generator
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Create a QR code that opens an email with the recipient, subject, and body already filled in. People scan it and their email app opens with everything ready to send. Great for feedback forms, support contacts, and event RSVPs.
		</p>
		<a
			href="/qr"
			class="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free Email QR Code &rarr;
		</a>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">How to Create a Free Email QR Code</h2>
		<ol class="mt-6 space-y-6">
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">1</span>
				<div>
					<h3 class="font-semibold text-text">Enter the email address</h3>
					<p class="mt-1 text-text-muted">Type the email address that should receive the message. This is the only required field.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">2</span>
				<div>
					<h3 class="font-semibold text-text">Add a subject and body (optional)</h3>
					<p class="mt-1 text-text-muted">Pre-fill the subject line and message body so the person scanning does not have to write anything. They can still edit the message before sending. This is useful for things like "RSVP for [Event Name]" or "Feedback for [Product]."</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">3</span>
				<div>
					<h3 class="font-semibold text-text">Generate your QR code</h3>
					<p class="mt-1 text-text-muted">The QR code updates in real time as you type. Customize colors and style if you want.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">4</span>
				<div>
					<h3 class="font-semibold text-text">Download and share</h3>
					<p class="mt-1 text-text-muted">Download as PNG or SVG. Print it on posters, flyers, product packaging, or table tents. The QR code never expires.</p>
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
				<span><strong class="text-text">No expiration.</strong> The QR code encodes a standard mailto: link. It works forever, independent of any service.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">100% client-side.</strong> Your email address and message content never leave your browser.</span>
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
				<p class="mt-2 text-text-muted">Yes. Completely free, no limits, no hidden tiers. An email QR code is just an encoded mailto: link — there is nothing to charge for.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Can I pre-fill the subject and body?</h3>
				<p class="mt-2 text-text-muted">Yes. You can set both the subject line and message body. The person scanning the code will see these pre-filled in their email app and can edit them before sending.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">What email apps does it work with?</h3>
				<p class="mt-2 text-text-muted">It works with whatever email app the person has set as their default — Gmail, Apple Mail, Outlook, Yahoo Mail, and others. The QR code creates a standard mailto: link that every email client understands.</p>
			</div>
		</div>
	</section>

	<section class="text-center">
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free Email QR Code Now &rarr;
		</a>
	</section>
</div>
