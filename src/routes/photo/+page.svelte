<svelte:head>
	<title>Photo Tools — nah.tools</title>
	<meta name="description" content="Free, client-side photo editing tools. Background removal, and more coming soon. No upload, no signup." />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8">
	<section class="text-center">
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
			Photo <span class="text-accent">Tools</span>
		</h1>
		<p class="mt-2 text-text-muted">
			AI-powered image editing that runs entirely in your browser.
		</p>
	</section>

	<div class="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
		<a
			href="/photo/rm-bg"
			class="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent hover:shadow-md"
		>
			<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
				<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
					/>
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-text group-hover:text-accent">Background Remover</h2>
			<p class="mt-1 text-sm text-text-muted">
				Remove image backgrounds instantly. Free, unlimited, full resolution.
			</p>
		</a>

		<div
			class="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface p-6 text-center"
		>
			<p class="text-sm text-text-muted">More tools coming soon</p>
		</div>
	</div>
</div>
