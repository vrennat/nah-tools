<script lang="ts">
	import { allFamilies, getFamilyTools } from '$lib/registry/index';
	import ToolSearch from '$components/ToolSearch.svelte';

	// Plain links remain in prerendered HTML, including the complete directory.
	const sections = allFamilies.map((family) => ({ family, tools: getFamilyTools(family.id) }));
	const totalTools = sections.filter((section) => section.family.id !== 'guides').reduce((n, section) => n + section.tools.length, 0);
	const tasks = [
		{ name: 'Merge PDFs', description: 'Combine documents into one PDF.', path: '/pdf/merge' },
		{ name: 'Shrink a PDF', description: 'Make a PDF smaller for email or upload.', path: '/pdf/compress' },
		{ name: 'Convert an image', description: 'Change HEIC, WebP, PNG, JPG, and more.', path: '/convert' },
		{ name: 'Shrink a photo', description: 'Reduce image size with quality controls.', path: '/photo/compress' },
		{ name: 'Make a QR code', description: 'Share a link, WiFi details, or a contact.', path: '/qr' },
		{ name: 'Fill or sign a PDF', description: 'Add text and a signature to a document.', path: '/pdf/fill-sign' },
		{ name: 'Remove a background', description: 'Turn a photo into a transparent image.', path: '/photo/rm-bg' },
		{ name: 'Trim a video', description: 'Keep just the part you need.', path: '/media/trim-video' }
	];
</script>

<svelte:head>
	<title>nah — Free tools. No catch.</title>
	<meta name="description" content="Free browser tools to merge PDFs, shrink files, convert images, and make QR codes. Open source, with no subscription or account required." />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://nah.tools" />
	<meta property="og:title" content="nah — Free tools. No catch." />
	<meta property="og:description" content="Free browser tools to merge PDFs, shrink files, convert images, and make QR codes. Open source, with no subscription or account required." />
	<meta property="og:image" content="https://nah.tools/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="nah — Free tools. No catch." />
	<meta name="twitter:description" content="Free browser tools to merge PDFs, shrink files, convert images, and make QR codes. Open source, with no subscription or account required." />
	<meta name="twitter:image" content="https://nah.tools/og.png" />
</svelte:head>

<div>
	<section class="pt-6 pb-8 sm:pt-12 sm:pb-10" aria-labelledby="home-heading">
		<p class="font-mono text-xs tracking-widest text-text-muted uppercase">Free &middot; Open source &middot; No account required</p>
		<h1 id="home-heading" class="mt-5 max-w-3xl font-display text-4xl leading-tight font-800 tracking-tight sm:text-6xl">Everyday tasks.<br /><span class="text-accent">Without the subscription.</span></h1>
		<p class="mt-5 max-w-2xl text-base leading-relaxed text-text-muted sm:text-lg">Merge PDFs, shrink a file, convert an image, or make a QR code. Genuinely free browser tools, with no trial or payment to download your result.</p>
		<a href="#all-tools" class="mt-4 inline-block text-sm font-medium text-accent hover:underline">Browse all {totalTools} tools &darr;</a>
	</section>

	<section class="relative z-10" aria-label="Tool search">
		<ToolSearch />
	</section>

	<section class="mt-9" aria-labelledby="tasks-heading">
		<h2 id="tasks-heading" class="font-display text-xl font-700 tracking-tight">What do you need to do?</h2>
		<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each tasks as task}
				<a href={task.path} class="group rounded-xl border border-border bg-surface-alt p-5 transition-colors duration-150 hover:border-accent/50">
					<h3 class="font-medium text-text group-hover:text-accent">{task.name} <span aria-hidden="true">&rarr;</span></h3>
					<p class="mt-2 text-sm leading-relaxed text-text-muted">{task.description}</p>
				</a>
			{/each}
		</div>
		<p class="mt-4 text-sm text-text-muted">Need to shrink something else? <a href="/media/compress-video" class="text-accent hover:underline">Compress a video</a> or <a href="/media/compress-audio" class="text-accent hover:underline">compress audio</a>.</p>
	</section>

	<section class="mt-10 grid gap-6 rounded-xl border border-border p-5 sm:grid-cols-2 sm:p-6" aria-labelledby="browser-heading">
		<div>
			<h2 id="browser-heading" class="font-display text-lg font-700">Use the device you have</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">On Mac or Windows, open a tool and choose your files. On iPhone or Android, choose files from your device, then save or share the result. No app installation needed.</p>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">Large files and video or AI tasks work best on a computer. Support depends on your browser and device.</p>
		</div>
		<div>
			<h2 class="font-display text-lg font-700">Know where your data goes</h2>
			<p class="mt-2 text-sm leading-relaxed text-text-muted">Most tools process files on your device. Short links, dynamic QR codes, and published bio pages use our servers so others can open them.</p>
			<a href="/trust" class="mt-3 inline-block text-sm font-medium text-accent hover:underline">Read about privacy and how the tools work &rarr;</a>
		</div>
	</section>

	<section id="all-tools" class="mt-12 scroll-mt-6" aria-labelledby="directory-heading">
		<h2 id="directory-heading" class="font-display text-2xl font-700 tracking-tight">All {totalTools} tools</h2>
		<p class="mt-2 text-sm text-text-muted">Choose a category to see every tool, or open its overview.</p>
		<div class="mt-5 divide-y divide-border border-y border-border">
			{#each sections as { family, tools }}
				<details id={family.id} class="scroll-mt-6 py-1">
					<summary class="cursor-pointer rounded-lg px-2 py-4 font-medium text-text hover:text-accent">{family.name} <span class="ml-2 text-sm font-normal text-text-muted">{tools.length} {family.id === 'guides' ? 'guides' : 'tools'}</span></summary>
					<div class="px-2 pb-5">
						{#if family.hub}
							<a href={family.hub} class="mb-4 inline-block text-sm font-medium text-accent hover:underline">{family.name} overview &rarr;</a>
						{/if}
						<ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
							{#each tools as tool}
								<li><a href={tool.path} class="group block h-full rounded-lg border border-border p-3 hover:border-accent/50 hover:bg-surface-alt"><span class="text-sm font-medium text-text group-hover:text-accent">{tool.name}</span><span class="mt-1 block text-xs leading-relaxed text-text-muted">{tool.description}</span></a></li>
							{/each}
						</ul>
					</div>
				</details>
			{/each}
		</div>
	</section>
</div>
