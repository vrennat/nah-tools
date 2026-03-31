<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Background Removal Shakedown: How Image Tools Show the Result Then Charge $2 to Use It"
	description="remove.bg processes your photo at full resolution then delivers a thumbnail. The AI model now runs free in your browser."
	slug="photo"
	datePublished="2026-03-30"
	dateModified="2026-03-30"
/>

<svelte:head>
	<title>The Background Removal Shakedown: How Image Tools Show the Result Then Charge $2 to Use It</title>
	<meta
		name="description"
		content="remove.bg processes your photo at full resolution then delivers a thumbnail. The AI model now runs free in your browser. Here's the evidence."
	/>
	<meta property="og:title" content="The Background Removal Shakedown" />
	<meta property="og:description" content="remove.bg shows you the perfect result, then charges $2 for the pixels. The AI now runs free in your browser." />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/photo" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Background Removal Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How "free" image tools show you the perfect result, then charge $2 to actually use it.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			You need to remove the background from a photo. Product shot for your online store, headshot for LinkedIn, flyer for your kid's soccer team. You search for "remove background from image" and click the first result.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You upload your photo. Three seconds later, the background is gone. The result is perfect. Clean edges, natural hair detail, exactly what you needed. You right-click to save it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The image is 625 by 400 pixels. Tiny. Unusable. Your original was 4000 by 3000. The tool processed the full-resolution image, showed you it could do exactly what you wanted, and gave you a thumbnail.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			Full resolution: $1.99. Or subscribe for $9 to $99 per month.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Show, then ransom</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			This model is different from the other traps. QR code generators deactivate your codes after a trial. Resume builders paywall the download after you've typed for an hour. PDF tools lock the save button.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Background removal tools do something sharper. They show you the finished product. Not a preview. Not a mockup. The actual result, at full quality, right there on your screen. Then they shrink it.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">remove.bg</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://www.remove.bg/" target="_blank" rel="noopener noreferrer" class="text-accent underline hover:text-accent-hover">remove.bg</a>, originally built by Vienna-based Kaleido AI and acquired by Canva, is the biggest name in this space. <strong class="text-text">60 million monthly visits.</strong> The free tier processes your image at full resolution and delivers a <strong class="text-text">625x400 pixel download</strong>. About 3% of the pixels in a typical smartphone photo.
		</p>
		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-2 leading-relaxed text-text-muted">$1.99 per image on pay-as-you-go</p>
			<p class="mb-2 leading-relaxed text-text-muted">$9/month for 40 credits</p>
			<p class="mb-2 leading-relaxed text-text-muted">$29/month for 150 credits</p>
			<p class="leading-relaxed text-text-muted">$99/month for 500 credits</p>
		</div>
		<p class="mb-4 leading-relaxed text-text-muted">
			A small e-commerce seller photographing 50 products would pay $99/month. <strong class="text-text">$1,188/year</strong> for an operation that now runs entirely in a browser tab.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">PhotoRoom</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			PhotoRoom raised $62 million, hit <strong class="text-text">$94.5 million in annual recurring revenue</strong> (89% year-over-year growth), crossed 100 million app downloads, and reached a $500 million valuation.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			In 2024, PhotoRoom did something that went beyond aggressive pricing into breaking trust with paying customers. Users who had prepaid for annual "Pro" subscriptions, which explicitly included unlimited batch exports, found their accounts capped at <strong class="text-text">500 batch exports per month</strong> mid-contract. PhotoRoom introduced a new, more expensive "Ultra" tier and moved the features people had already paid for into it.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			They refused refunds. Downgrading a paid user's existing plan isn't a price increase. It's taking back something someone already bought.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">What changed</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Two years ago, charging for background removal was defensible. The AI models were big, needed GPUs, and couldn't run in a browser. Server costs were real. That changed fast.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://github.com/microsoft/onnxruntime" target="_blank" rel="noopener noreferrer" class="font-700 text-text underline hover:text-accent-hover">ONNX Runtime Web</a> brought neural network inference to the browser through WebAssembly and WebGPU. Models that needed a server with a GPU now run on the user's device. WebGPU + WebAssembly enables up to <strong class="text-text">20x speed improvement</strong> over CPU-only browser inference. Background removal is effectively instant after the initial model download (~30MB, cached). Not just possible in the browser — it's faster than uploading to their servers and waiting for a response.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://github.com/xuebinqin/DIS" target="_blank" rel="noopener noreferrer" class="font-700 text-text underline hover:text-accent-hover">IS-Net</a> and <a href="https://github.com/ZhengPeng7/BiRefNet" target="_blank" rel="noopener noreferrer" class="font-700 text-text underline hover:text-accent-hover">BiRefNet</a> are open-source segmentation models (Apache 2.0 and MIT licensed) that produce commercial-quality results. These aren't research demos. They match remove.bg's output quality.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<a href="https://github.com/nicolo-ribaudo/background-removal-js" target="_blank" rel="noopener noreferrer" class="font-700 text-text underline hover:text-accent-hover">@imgly/background-removal-js</a> (6,000+ GitHub stars) packages these models into a JavaScript library that runs entirely in the browser. Full resolution, no upload, no server.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The computation that remove.bg charges $1.99 per image for costs <strong class="text-text">$0.00</strong> to run in your browser.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">E-commerce sellers.</strong> A seller listing 200 products needs background-free images for every listing. At $1.99 per image, that's $398 for one batch. Small sellers on thin margins absorb this because they don't know there's an alternative.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Freelancers.</strong> Designers and photographers doing background removal for client work. A freelancer processing 20 images per week pays over $2,000/year at remove.bg's per-image rate.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Anyone who already paid for PhotoRoom.</strong> The users who committed to annual plans got hit hardest. Prepaying is supposed to be a discount in exchange for commitment. When the company downgrades your plan after payment, it penalizes the people who trusted them the most.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			I built <a href="/photo" class="text-accent underline hover:text-accent-hover">nah.tools/photo</a> because there's no reason to pay per image for something your browser does for free.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The background remover processes images entirely in your browser using open-source AI models. Your photos never go to any server. Full resolution output, same pixels as your original minus the background. No watermark. No resolution gate. No per-image fee.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			First use downloads the AI model (about 40MB), which your browser caches automatically. Every use after that is instant. <a href="https://github.com/vrennat/nah-tools" class="text-accent underline hover:text-accent-hover">Source code</a> is public. Verify that no image data leaves your browser.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How to protect yourself</h2>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Check output resolution before uploading sensitive images.</strong> If a tool processes your photo but delivers a shrunken version, the restriction is artificial.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Prefer tools that process locally.</strong> When you upload to a server-based tool, your image is on someone else's computer.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">Watch for mid-contract changes.</strong> If you're on an annual plan, screenshot the feature list when you subscribe.</li>
			<li class="leading-relaxed text-text-muted"><strong class="text-text">For batch processing, free tools exist.</strong> <a href="https://github.com/danielgatis/rembg" class="text-accent underline hover:text-accent-hover">rembg</a> (16,000+ GitHub stars) handles unlimited images locally in Python.</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			A background removal tool that shows you the perfect result and then asks you to pay for the pixels is not offering a free trial. It's showing you what it's withholding.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The AI is open source. The runtime is open source. The computation happens on your device. The only thing between you and your image is a business model built on artificial scarcity.
		</p>
	</section>

	<InvestigationFooter slug="photo" />
</article>
