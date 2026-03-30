<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$components/ThemeToggle.svelte';

	let pathname = $derived(page.url.pathname as string);

	const links = [
		{ href: '/qr', label: 'QR', match: (p: string) => p.startsWith('/qr') },
		{ href: '/pdf', label: 'PDF', match: (p: string) => p.startsWith('/pdf') },
		{ href: '/links', label: 'Links', match: (p: string) => p.startsWith('/links') },
		{ href: '/photo', label: 'Photo', match: (p: string) => p.startsWith('/photo') },
		{ href: '/remove', label: 'Remove', match: (p: string) => p.startsWith('/remove') },
		{ href: '/resume', label: 'Resume', match: (p: string) => p.startsWith('/resume') }
	];
</script>

<header class="mx-auto w-full max-w-6xl px-4 pt-6 pb-2 sm:px-6 sm:pt-8 lg:px-8">
	<div class="flex items-center justify-between">
		<a href="/" class="font-display text-xl font-700 tracking-tight text-brand">
			nah
		</a>

		<div class="flex items-center gap-5">
			<nav class="hidden items-center gap-4 text-sm sm:flex">
				{#each links as link}
					<a
						href={link.href}
						class="transition-colors hover:text-accent {link.match(pathname) ? 'text-accent font-medium' : 'text-text-muted'}"
					>
						{link.label}
					</a>
				{/each}
			</nav>
			<ThemeToggle />
		</div>
	</div>
</header>
