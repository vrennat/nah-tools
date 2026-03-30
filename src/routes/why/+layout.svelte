<script lang="ts">
	import { page } from '$app/state';

	let { children } = $props();

	let pathname = $derived(page.url.pathname);

	const articles = [
		{ href: '/why', label: 'Why nah', short: 'Manifesto' },
		{ href: '/why/qr', label: 'QR Codes', short: 'QR Codes' },
		{ href: '/why/resume', label: 'Resumes', short: 'Resumes' },
		{ href: '/why/pdf', label: 'PDF Tools', short: 'PDFs' },
		{ href: '/why/photo', label: 'Photos', short: 'Photos' },
		{ href: '/why/links', label: 'Links', short: 'Links' },
		{ href: '/why/remove', label: 'Data Brokers', short: 'Data Brokers' }
	];

	let navOpen = $state(false);

	let currentIndex = $derived(articles.findIndex((a) => a.href === pathname));
	let prev = $derived(currentIndex > 0 ? articles[currentIndex - 1] : null);
	let next = $derived(currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null);
</script>

<div class="mt-6 mb-8">
	<!-- Mobile nav toggle -->
	<div class="lg:hidden">
		<button
			onclick={() => (navOpen = !navOpen)}
			class="flex w-full items-center justify-between rounded-lg border border-border bg-surface-alt px-4 py-3 text-sm font-medium text-text"
		>
			<span>Investigations</span>
			<svg
				class="h-4 w-4 text-text-muted transition-transform {navOpen ? 'rotate-180' : ''}"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
		{#if navOpen}
			<nav class="mt-2 rounded-lg border border-border bg-surface-alt p-2">
				{#each articles as article}
					<a
						href={article.href}
						onclick={() => (navOpen = false)}
						class="block rounded-md px-3 py-2 text-sm transition-colors {pathname === article.href
							? 'bg-accent/10 font-medium text-accent'
							: 'text-text-muted hover:text-text'}"
					>
						{article.label}
					</a>
				{/each}
			</nav>
		{/if}
	</div>

	<!-- Desktop sidebar nav -->
	<div class="mx-auto hidden max-w-3xl lg:block">
		<nav class="flex flex-wrap items-center gap-2 border-b border-border pb-4">
			{#each articles as article}
				<a
					href={article.href}
					class="rounded-md px-3 py-1.5 text-sm transition-colors {pathname === article.href
						? 'bg-accent/10 font-medium text-accent'
						: 'text-text-muted hover:text-text'}"
				>
					{article.short}
				</a>
			{/each}
		</nav>
	</div>
</div>

{@render children()}

<!-- Prev / Next navigation -->
{#if prev || next}
	<nav class="mx-auto mt-12 flex max-w-3xl items-stretch gap-4 border-t border-border pt-8 pb-4">
		{#if prev}
			<a
				href={prev.href}
				class="group flex flex-1 flex-col rounded-lg border border-border p-4 transition-colors hover:border-accent/50 hover:bg-surface-alt"
			>
				<span class="text-xs text-text-muted">&larr; Previous</span>
				<span class="mt-1 text-sm font-medium text-text group-hover:text-accent">{prev.label}</span>
			</a>
		{:else}
			<div class="flex-1"></div>
		{/if}
		{#if next}
			<a
				href={next.href}
				class="group flex flex-1 flex-col items-end rounded-lg border border-border p-4 text-right transition-colors hover:border-accent/50 hover:bg-surface-alt"
			>
				<span class="text-xs text-text-muted">Next &rarr;</span>
				<span class="mt-1 text-sm font-medium text-text group-hover:text-accent">{next.label}</span>
			</a>
		{/if}
	</nav>
{/if}
