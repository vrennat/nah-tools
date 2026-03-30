<script lang="ts">
	import { page } from '$app/state';
	import ThemeToggle from '$components/ThemeToggle.svelte';

	let pathname = $derived(page.url.pathname as string);
</script>

<header class="border-b border-border bg-surface">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
		<a href="/" class="text-xl font-bold tracking-tight text-brand">
			nah<span class="text-accent">.tools</span>
		</a>

		<div class="flex items-center gap-4 text-sm font-medium">
			<a
				href="/qr"
				class="transition-colors hover:text-accent"
				class:text-accent={pathname.startsWith('/qr')}
				class:text-text-muted={!pathname.startsWith('/qr')}
			>
				QR Generator
			</a>
			<a
				href="/links"
				class="transition-colors hover:text-accent"
				class:text-accent={pathname.startsWith('/links')}
				class:text-text-muted={!pathname.startsWith('/links')}
			>
				Links
			</a>
			<a
				href="/photo"
				class="transition-colors hover:text-accent"
				class:text-accent={pathname.startsWith('/photo')}
				class:text-text-muted={!pathname.startsWith('/photo')}
			>
				Photo
			</a>
			<a
				href="/why"
				class="transition-colors hover:text-accent"
				class:text-accent={pathname === '/why'}
				class:text-text-muted={pathname !== '/why'}
			>
				Why Free?
			</a>
			<a
				href="/compare"
				class="transition-colors hover:text-accent"
				class:text-accent={pathname === '/compare'}
				class:text-text-muted={pathname !== '/compare'}
			>
				Compare
			</a>
			<ThemeToggle />
		</div>
	</nav>
</header>
