<script lang="ts">
	import { allFamilies, getFamilyTools } from '$lib/registry/index';

	// Same registry-driven groups as the header nav, so the two never disagree.
	const categories = allFamilies.filter((f) => f.hub !== null);
	const standalone = getFamilyTools('standalone');

	const siteLinks = [
		{ href: '/why', label: 'Why nah exists' },
		{ href: '/compare', label: 'Compare' },
		{ href: '/trust', label: 'Trust' },
		{ href: '/mcp', label: 'MCP Server' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' }
	];
</script>

<footer class="border-t border-border">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
		<div class="grid gap-8 sm:grid-cols-4">
			<nav class="sm:col-span-2" aria-label="Tool categories">
				<p class="mb-3 font-mono text-[11px] tracking-widest text-text-muted uppercase">Categories</p>
				<ul class="grid grid-cols-2 gap-x-4 gap-y-2">
					{#each categories as family}
						<li>
							<a href={family.hub} class="text-sm text-text-muted transition-colors hover:text-accent">{family.name}</a>
						</li>
					{/each}
				</ul>
			</nav>

			<nav aria-label="Standalone tools">
				<p class="mb-3 font-mono text-[11px] tracking-widest text-text-muted uppercase">Tools</p>
				<ul class="space-y-2">
					{#each standalone as tool}
						<li>
							<a href={tool.path} class="text-sm text-text-muted transition-colors hover:text-accent">{tool.name}</a>
						</li>
					{/each}
				</ul>
			</nav>

			<nav aria-label="Site">
				<p class="mb-3 font-mono text-[11px] tracking-widest text-text-muted uppercase">Site</p>
				<ul class="space-y-2">
					{#each siteLinks as link}
						<li>
							<a href={link.href} class="text-sm text-text-muted transition-colors hover:text-accent">{link.label}</a>
						</li>
					{/each}
					<li>
						<a href="https://github.com/vrennat/nah-tools" target="_blank" rel="noopener noreferrer" class="text-sm text-text-muted transition-colors hover:text-accent">GitHub</a>
					</li>
				</ul>
			</nav>
		</div>

		<p class="mt-10 border-t border-border pt-6 text-center text-sm text-text-muted">
			<a href="https://github.com/vrennat/nah-tools" class="underline decoration-border underline-offset-4 transition-colors hover:decoration-accent hover:text-accent">Open source</a>. No accounts. No tracking.
		</p>
	</div>
</footer>
