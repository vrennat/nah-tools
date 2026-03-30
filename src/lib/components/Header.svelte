<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$components/ThemeToggle.svelte';

	let pathname = $derived(page.url.pathname as string);
	let mobileOpen = $state(false);

	// Close mobile menu on navigation
	$effect(() => {
		pathname;
		mobileOpen = false;
	});

	const links = [
		{ href: '/qr', label: 'QR Generator', match: (p: string) => p.startsWith('/qr') },
		{ href: '/pdf', label: 'PDF Tools', match: (p: string) => p.startsWith('/pdf') },
		{ href: '/links', label: 'Links', match: (p: string) => p.startsWith('/links') },
		{ href: '/photo', label: 'Photo', match: (p: string) => p.startsWith('/photo') },
		{ href: '/why', label: 'Why Free?', match: (p: string) => p === '/why' },
		{ href: '/compare', label: 'Compare', match: (p: string) => p === '/compare' }
	];
</script>

<header class="fixed top-0 right-0 left-0 z-50 flex justify-center px-4 pt-4">
	<nav
		class="w-full max-w-3xl rounded-2xl border border-border bg-surface/80 px-4 py-2.5 shadow-lg backdrop-blur-lg sm:px-5"
	>
		<div class="flex items-center justify-between">
			<a href="/" class="font-display text-xl font-700 tracking-tight text-brand">
				nah<span class="text-accent">.tools</span>
			</a>

			<!-- Desktop links -->
			<div class="hidden items-center gap-1 text-sm font-medium md:flex">
				{#each links as link}
					<a
						href={link.href}
						class="rounded-lg px-3 py-1.5 transition-colors hover:bg-surface-alt hover:text-accent {link.match(pathname) ? 'text-accent bg-accent/10' : 'text-text-muted'}"
					>
						{link.label}
					</a>
				{/each}
				<div class="ml-1 border-l border-border pl-1">
					<ThemeToggle />
				</div>
			</div>

			<!-- Mobile controls -->
			<div class="flex items-center gap-1 md:hidden">
				<ThemeToggle />
				<button
					type="button"
					aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={mobileOpen}
					class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
					onclick={() => (mobileOpen = !mobileOpen)}
				>
					{#if mobileOpen}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					{:else}
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if mobileOpen}
			<div class="mt-2 flex flex-col gap-1 border-t border-border pt-2 md:hidden">
				{#each links as link}
					<a
						href={link.href}
						class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-surface-alt hover:text-accent {link.match(pathname) ? 'text-accent bg-accent/10' : 'text-text-muted'}"
					>
						{link.label}
					</a>
				{/each}
			</div>
		{/if}
	</nav>
</header>
