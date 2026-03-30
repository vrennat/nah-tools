<svelte:head>
	<title>Photo Tools — nah.tools</title>
	<meta name="description" content="Free, client-side photo editing tools. Background removal, and more coming soon. No upload, no signup." />
</svelte:head>

<div class="mx-auto max-w-4xl space-y-10">
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Photo <span class="text-accent">Tools</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			AI-powered image editing that runs entirely in your browser.
		</p>
	</section>

	<div class="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
		<a
			href="/photo/rm-bg"
			class="group rounded-2xl border border-border bg-surface-alt p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_8px_30px_-8px_rgba(59,130,246,0.15)]"
		>
			<div class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
					/>
				</svg>
			</div>
			<h2 class="font-display font-700 text-text transition-colors duration-300 group-hover:text-accent">Background Remover</h2>
			<p class="mt-1 text-sm text-text-muted">
				Remove image backgrounds instantly. Free, unlimited, full resolution.
			</p>
		</a>

		<div
			class="flex items-center justify-center rounded-2xl border border-dashed border-border p-6 text-center"
		>
			<p class="text-sm text-text-muted">More tools coming soon</p>
		</div>
	</div>
</div>
