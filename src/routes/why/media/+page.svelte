<script lang="ts">
	import ArticleSchema from '$lib/components/why/ArticleSchema.svelte';
	import InvestigationFooter from '$lib/components/why/InvestigationFooter.svelte';
</script>

<ArticleSchema
	title="The Video Compressor Shakedown"
	description="Your browser has a video encoder. These companies charge you not to use it."
	slug="media"
	datePublished="2026-04-01"
	dateModified="2026-04-01"
/>

<svelte:head>
	<title>The Video Compressor Shakedown — nah</title>
	<meta
		name="description"
		content="Your browser has a video encoder. These companies charge you not to use it."
	/>
	<meta property="og:title" content="The Video Compressor Shakedown" />
	<meta
		property="og:description"
		content="Clideo, Kapwing, and VEED charge up to $59/month to compress video. Your browser can do it for free."
	/>
	<meta property="og:type" content="article" />
	<meta property="og:url" content="https://nah.tools/why/media" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<article class="mx-auto max-w-3xl py-8">
	<header class="mb-12">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-accent">Investigation</p>
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			The Video Compressor Shakedown
		</h1>
		<p class="mt-4 text-xl text-text-muted">
			How "free" video tools charge up to $59 a month for something FFmpeg has done for free since
			2000 — and now runs entirely in your browser.
		</p>
	</header>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			You recorded a video on your phone. Maybe it's a birthday clip you want to email to your
			parents. Maybe it's a product demo for your small business. Maybe it's footage from a school
			event. The file is 180 megabytes. Gmail's attachment limit is 25 megabytes. You search "compress
			video online free."
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The results look helpful. Clideo. Kapwing. VEED.io. Online-video-cutter.com. They all promise
			to make your video smaller — fast, free, no download required. You pick one. You upload your
			180MB file, wait several minutes for the upload to complete, wait more minutes for the
			processing to finish, preview the result — and discover a watermark stamped across the center
			of your video. "Made with Clideo." To remove it, you need to subscribe. Plans start at $9 a
			month.
		</p>
		<p class="mb-4 text-lg font-semibold leading-relaxed text-text">
			You just uploaded 180 megabytes to a stranger's server, waited ten minutes, and got a
			watermarked video back. This is not a free tool. It's a trap.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The upload absurdity
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Let's be precise about what is actually happening when you use one of these tools.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			You have a 150MB video. You want a 20MB video. To accomplish this, these tools require you to:
			upload 150MB to their servers, wait for it to arrive and queue, wait for their server to
			process it, then download 20MB back. You have transferred 170MB of data over the internet for
			an operation that could have run on your own device — the same device that recorded the video
			in the first place — in a matter of seconds.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			On a slow or metered connection, the upload alone takes longer than local compression would
			have. On a phone data plan, you may be paying per megabyte to upload a file you're trying to
			make smaller. The entire sequence is backwards.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Video compression is computation. It is a well-understood mathematical operation that modern
			processors handle efficiently. Your phone, your laptop, and even your browser are fully capable
			of performing it without involving any third party. The server is not necessary. It is a
			business decision, not a technical one.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">How much do they charge?</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The players in this market have raised extraordinary sums of venture capital to build GUI
			wrappers around video encoding — something the open-source community solved definitively two
			decades ago.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Clideo</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Clideo's free tier processes your video and adds a watermark. To download a clean file, you
			need a subscription: $9/month billed annually, or $18/month billed monthly. Clideo is a
			product of Softo — the same company that operates Convertio, the file conversion service that
			runs the same watermark-gate model. One parent company, multiple surfaces, same trap.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Kapwing</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Kapwing has raised <strong class="text-text">$97 million in venture capital</strong>. Its free
			tier is aggressively limited: watermarks on exports, caps on video length and resolution, and
			a restricted feature set. Full access costs $16–$33 per month. The pitch is a collaborative
			video editor — but the product that shows up in search results for "compress video online" is
			a video compressor that stamps your output with their logo if you don't pay.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">VEED.io</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			VEED has raised <strong class="text-text">$46 million</strong>. Pricing runs $18–$59 per
			month. The free tier watermarks exports. The company's marketing is polished and its feature
			set is broad — but the core compression and trimming functionality, the thing most people
			searching for "video compressor" actually need, is gated behind a subscription that costs more
			per year than most software people intentionally purchase.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">Clipchamp</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			Microsoft acquired Clipchamp for a reported <strong class="text-text">$100 million or more</strong>
			and bundled it into Windows 11. Read that twice. A company paid nine figures to acquire a video
			compressor that now ships with the world's most common operating system at no additional cost.
			Microsoft's decision to treat video editing as a bundled utility — like Notepad or Calculator
			— is the clearest possible signal about the actual commodity nature of this software. If it's
			worth bundling for free with Windows, it was never worth $18 a month.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 leading-relaxed text-text-muted">
				Total VC raised by Kapwing and VEED alone:
				<strong class="text-text">$143 million.</strong>
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				Microsoft's reported Clipchamp acquisition:
				<strong class="text-text">$100+ million.</strong>
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				FFmpeg — the open-source tool that does everything these products do — has been free since
				<strong class="text-text">the year 2000.</strong>
			</p>
			<p class="leading-relaxed text-text">
				Hundreds of millions of dollars raised to build subscription wrappers around
				<strong class="text-2xl text-accent">free software.</strong>
			</p>
		</div>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The watermark hostage</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The watermark mechanic deserves its own examination because it is a deliberately constructed
			trap, not an incidental limitation.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Here is the sequence: you spend time uploading your video. You wait for processing. You watch
			the preview. The result looks correct — the right length, the right file size, the right
			quality. Then you notice the watermark. You have now invested time and bandwidth into a result
			you cannot use. You can pay to unlock it, or you start over somewhere else — and lose all that
			time.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is not an accident of design. The watermark is revealed after processing, not before.
			You are not warned at upload time that your output will be branded. The UI does not say
			"free tier includes watermark" in a prominent location before you commit your time and
			bandwidth. The disclosure is buried or absent. The watermark appears at the moment of maximum
			leverage: after you've already paid with your time.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			For a video you're emailing to a family member, a watermark across the frame is not a minor
			inconvenience. It's the difference between a usable file and an unusable one.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">Who gets hurt</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			The people searching for "compress video for email" are not professionals with video
			production budgets. They are:
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Teachers</strong> recording classroom lessons or feedback videos
			for students. A ten-minute screen recording from a laptop routinely hits 200MB. Email won't
			take it. The teacher needs it smaller, now, without setting up software.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Parents</strong> trying to share a soccer game clip or a birthday
			video with grandparents. Phone cameras record in high-definition formats that produce enormous
			files. The family group chat has a size limit. Nobody wants to sign up for a subscription to
			share a birthday video.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Small business owners</strong> making social media content — a
			product walkthrough, a testimonial clip, a quick announcement. They need it under the platform
			size limit, and they need it without a watermark from a third party they've never heard of.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Nonprofit and community organizations</strong> recording events,
			board meetings, or fundraiser appeals. Volunteer-run, no budget for software subscriptions.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Anyone who just needs to trim the first ten seconds off a clip.</strong>
			The most common video edit in existence — cutting dead air from the start of a recording — is
			gated behind subscriptions at every major online tool.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			These are not users who chose to engage with a video editing platform. They searched for a
			basic utility, found what looked like a free tool, and walked into a subscription funnel.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			What FFmpeg is and why it matters
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			FFmpeg is an open-source multimedia framework that has been in continuous development since
			2000. It handles encoding, decoding, transcoding, muxing, demuxing, streaming, filtering, and
			playback for virtually every audio and video format in existence. It is the backbone of
			YouTube's video processing pipeline. It is used by VLC, Handbrake, Plex, and hundreds of
			other applications. It is the closest thing the video world has to a universal standard tool.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What every online video compressor is doing — what Clideo and Kapwing and VEED are doing on
			their servers when they process your upload — is running FFmpeg. Or something equivalent. The
			actual compression is FFmpeg. The subscription is for the GUI and the upload infrastructure.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			HandBrake is a free, open-source desktop application built on FFmpeg. It compresses video,
			converts formats, and does batch processing. It is excellent software. The only reason most
			people don't use it for quick compressions is that it requires installation. Searching
			"compress video" from a browser produces instant results. Installing HandBrake takes a few
			minutes and a download. For a one-time task, the online tool feels faster — until you hit the
			paywall.
		</p>

		<h3 class="mb-3 mt-8 text-xl font-semibold text-text">FFmpeg.wasm closes the gap</h3>
		<p class="mb-4 leading-relaxed text-text-muted">
			WebAssembly is a binary instruction format that runs in modern browsers at near-native speed.
			The FFmpeg.wasm project compiles the entire FFmpeg codebase to WebAssembly. The result: the
			full FFmpeg engine, running inside your browser tab, with no installation required and no
			server involved.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			The engine is approximately 25MB — comparable to loading a few high-resolution images. It
			downloads on first use and caches locally. After that, every compression, every trim, every
			format conversion runs entirely on your device. Your video data never leaves your machine.
			There is nothing to upload. There is nothing to wait for except the processing itself, which
			runs on your own processor at full speed.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is not a workaround or a compromise. FFmpeg.wasm runs the same algorithms as the server-
			side tools. The output quality is identical. The only difference is where the computation
			happens: your device instead of theirs.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			The privacy problem nobody mentions
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			When you upload a video to Clideo, Kapwing, or VEED, you are sending your video to a third-
			party server. This matters more than people realize.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Videos contain metadata — GPS location from phones, timestamps, device identifiers. Videos
			contain faces, voices, locations, and events. A video of your child's birthday party, your
			home's interior, a medical appointment, a confidential business presentation — all of it
			uploaded to a server you have no control over, processed by infrastructure you can't inspect,
			stored for an unknown retention period under a privacy policy you didn't read.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			None of the major online video tools prominently disclose how long they retain uploaded videos
			or what happens to them after processing. The free tier of Clideo states files are deleted
			after 24 hours. Kapwing stores projects in your account. VEED retains content associated with
			your account. If you didn't create an account, the terms vary.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			A tool that processes your video locally never has this problem. There is no upload. There is
			no server. There is no retention question because your video never left your device.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			Why the alternatives stay buried
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Kapwing has $97 million to spend. VEED has $46 million. Clideo is part of a multi-product
			software operation with significant revenue. HandBrake has volunteer maintainers and no
			marketing budget. FFmpeg has excellent documentation written for developers, not for the
			person who just wants to email a birthday video.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			Search results for "compress video online" are a direct function of SEO spend, domain
			authority, and paid advertising. The free tools — the ones that actually cost the user nothing
			and respect their privacy — don't have the budget to compete for placement against VC-backed
			subscription businesses. The subscription businesses don't need their tools to be better.
			They just need to be found first.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			This is the structural condition that makes the shakedown work. It is not that better tools
			don't exist. It is that better tools are invisible to someone who searches from a browser and
			clicks the first reasonable-looking result.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">The free alternative</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			We built <a href="/media" class="text-accent underline hover:text-accent-hover">nah's video tools</a>
			on FFmpeg.wasm. Everything runs in your browser. Nothing is uploaded. No watermarks. No
			account. No trial. No subscription.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Compress video</strong> with presets tuned for email, social media,
			and web — or set your own target size and quality. The first time you use the tool, the ~25MB
			FFmpeg engine downloads and caches in your browser. After that, compression is instant and
			works offline.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Trim video and audio</strong> — cut dead air from the start, remove
			the end, or pull a specific segment from a longer clip. No upload, no processing queue, no
			watermark.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			<strong class="text-text">Convert video to GIF</strong> for shareable loops and previews.
			<strong class="text-text">Extract audio</strong> from video — pull the MP3 from a recording
			without re-encoding the video track.
		</p>

		<div class="my-6 rounded-lg border border-border bg-surface-alt p-6">
			<p class="mb-3 text-sm font-semibold uppercase tracking-wider text-text">How it works</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				First visit: downloads ~25MB FFmpeg engine to your browser cache. This is a one-time cost.
			</p>
			<p class="mb-3 leading-relaxed text-text-muted">
				Every subsequent use: fully local. No network request for your video. Compresses at
				whatever speed your device allows. Works offline.
			</p>
			<p class="leading-relaxed text-text-muted">
				Your video data never leaves your machine. No account required. No watermarks. Free.
			</p>
		</div>

		<p class="mb-4 leading-relaxed text-text-muted">
			The source code is
			<a
				href="https://github.com/vrennat/nah-tools"
				class="text-accent underline hover:text-accent-hover">public on GitHub</a
			>. You can read the implementation, verify that no upload occurs, and self-host the entire
			thing if you prefer. There is nothing hidden.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			We didn't build this to compete with full-featured video editing suites. We built it because
			compressing a video to email it, trimming dead air from a clip, and converting a recording
			to a GIF are solved problems. They were solved in 2000. They shouldn't cost money in 2026.
		</p>
	</section>

	<section class="mb-12">
		<h2 class="mb-4 mt-12 font-display text-2xl font-700 text-text">
			How to compress video without getting trapped
		</h2>
		<p class="mb-4 leading-relaxed text-text-muted">
			Whether you use our tool or not, here's how to avoid the subscription trap.
		</p>
		<ol class="mb-4 list-decimal space-y-4 pl-6">
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Look for client-side tools.</strong> Any tool that processes your
				video without uploading it is both faster and safer. The giveaway: no upload progress bar,
				no waiting for a server. If processing starts immediately after you select your file, the
				work is happening locally.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">Watch for the watermark reveal.</strong> If a tool processes
				your video before showing you the watermark, the UI is designed to extract your time before
				disclosing the cost. That's intentional. Close the tab.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If you need a desktop tool, use HandBrake.</strong> It's free,
				open-source, runs entirely locally, and handles every format. The installation takes two
				minutes and it works without an internet connection.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">For regular use, install FFmpeg directly.</strong> It's a
				command-line tool, but the compression command is a single line:
				<code class="rounded bg-surface-alt px-1.5 py-0.5 text-sm text-text"
					>ffmpeg -i input.mp4 -crf 28 output.mp4</code
				>. That one command reduces most videos by 60–80% with no watermark, no upload, and no
				subscription.
			</li>
			<li class="leading-relaxed text-text-muted">
				<strong class="text-text">If you've already been charged unexpectedly,</strong> dispute
				the charge with your bank or card issuer. Document that the watermark disclosure happened
				after processing, not before. Many users report success with chargebacks in these
				circumstances.
			</li>
		</ol>
	</section>

	<section class="mb-12">
		<p class="mb-4 leading-relaxed text-text-muted">
			Compressing a video is a math problem. It was solved in the 1990s. The open-source
			implementation has been freely available since 2000. The computation is trivial for modern
			hardware. There is no technical reason — none — that it should cost money.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			What these companies sell is not video compression. They sell placement in search results.
			They sell the gap between what a non-technical user knows and what is actually possible. They
			sell the friction of "I just need it done now" against the alternative of figuring out a
			command-line tool. That friction is real. It has value. But it does not justify watermarks,
			subscription fees, or uploading your personal videos to a stranger's server.
		</p>
		<p class="mb-4 leading-relaxed text-text-muted">
			FFmpeg.wasm means the entire gap is closed. The full compression engine runs in the browser.
			The installation friction is gone. The upload is gone. The watermark business model no longer
			has a technical justification. There's nothing left but the pricing.
		</p>
		<p class="mt-8 text-lg font-semibold leading-relaxed text-text">
			Your video shouldn't leave your device just to get smaller.
		</p>
	</section>

	<InvestigationFooter slug="media" />
</article>
