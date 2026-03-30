<script lang="ts">
	import FAQSchema from '$components/FAQSchema.svelte';

	const faqs = [
		{
			question: 'Is it really free?',
			answer:
				'Yes. No limits, no premium tier, no watermarks. vCard QR codes are simple data encodings — there is no reason to charge for them.'
		},
		{
			question: 'What information can I include?',
			answer:
				'Name, phone number, email, company, job title, website URL, and street address. The vCard format is a standard supported by every phone — all of these fields are recognized automatically.'
		},
		{
			question: 'Will it work on all phones?',
			answer:
				'Yes. Both iPhone and Android devices recognize vCard QR codes natively. When scanned, the phone prompts the user to save the contact. No special app required.'
		},
		{
			question: 'Can I update my contact info after printing?',
			answer:
				'No. A static QR code encodes data directly, so the information is fixed once printed. If your details change, you will need to generate a new QR code and reprint your cards. The upside is that it never expires and does not depend on any service staying online.'
		},
		{
			question: 'What format should I download for printing?',
			answer:
				'SVG is best for print. It is a vector format, meaning it scales to any size without becoming blurry. PNG works well for digital use like email signatures or websites.'
		}
	];
</script>

<FAQSchema {faqs} />

<svelte:head>
	<title>Free vCard QR Code Generator — Business Card QR Code — nah</title>
	<meta name="description" content="Create a free QR code for your business card. Add name, phone, email, company, and more. Scan to save contact info instantly. No signup, no expiration." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-12">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Free Business Card QR Code Generator
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Create a QR code that saves your contact info directly to someone's phone. They scan it, tap save, and your name, phone number, email, and company are added to their contacts. No typing, no misspellings.
		</p>
		<a
			href="/qr"
			class="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free vCard QR Code &rarr;
		</a>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-text">How to Create a Free Business Card QR Code</h2>
		<ol class="mt-6 space-y-6">
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">1</span>
				<div>
					<h3 class="font-semibold text-text">Enter your contact details</h3>
					<p class="mt-1 text-text-muted">Fill in your name, phone number, email address, company, job title, and website. Include as much or as little as you want — only the fields you fill in will be encoded.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">2</span>
				<div>
					<h3 class="font-semibold text-text">Customize the appearance</h3>
					<p class="mt-1 text-text-muted">Change colors, dot styles, and corner shapes to match your brand. You can also add your company logo to the center of the QR code.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">3</span>
				<div>
					<h3 class="font-semibold text-text">Download in high resolution</h3>
					<p class="mt-1 text-text-muted">Download as SVG for print (scalable to any size without losing quality) or PNG for digital use. SVG is best for business cards since printers need high resolution.</p>
				</div>
			</li>
			<li class="flex gap-4">
				<span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">4</span>
				<div>
					<h3 class="font-semibold text-text">Print on your business cards</h3>
					<p class="mt-1 text-text-muted">Add the QR code to your business card design. Most people put it on the back. Make sure it is at least 2cm x 2cm (about 0.8 inches) for reliable scanning.</p>
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
				<span><strong class="text-text">No expiration.</strong> Your vCard QR code encodes your info directly. It does not route through any server, so it works forever.</span>
			</li>
			<li class="flex items-start gap-3">
				<span class="mt-0.5 text-accent">&bull;</span>
				<span><strong class="text-text">100% client-side.</strong> Your contact details never leave your browser. Nothing is uploaded or stored.</span>
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
				<p class="mt-2 text-text-muted">Yes. No limits, no premium tier, no watermarks. vCard QR codes are simple data encodings — there is no reason to charge for them.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">What information can I include?</h3>
				<p class="mt-2 text-text-muted">Name, phone number, email, company, job title, website URL, and street address. The vCard format is a standard supported by every phone — all of these fields are recognized automatically.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Will it work on all phones?</h3>
				<p class="mt-2 text-text-muted">Yes. Both iPhone and Android devices recognize vCard QR codes natively. When scanned, the phone prompts the user to save the contact. No special app required.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">Can I update my contact info after printing?</h3>
				<p class="mt-2 text-text-muted">No. A static QR code encodes data directly, so the information is fixed once printed. If your details change, you will need to generate a new QR code and reprint your cards. The upside is that it never expires and does not depend on any service staying online.</p>
			</div>
			<div>
				<h3 class="font-semibold text-text">What format should I download for printing?</h3>
				<p class="mt-2 text-text-muted">SVG is best for print. It is a vector format, meaning it scales to any size without becoming blurry. PNG works well for digital use like email signatures or websites.</p>
			</div>
		</div>
	</section>

	<section class="text-center">
		<a
			href="/qr"
			class="inline-block rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			Create Your Free vCard QR Code Now &rarr;
		</a>
	</section>
</div>
