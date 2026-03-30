<script lang="ts">
	import { getTheme } from '$bio/themes';

	let {
		displayName = '',
		bio = '',
		avatarUrl = '',
		themeId = 'minimal',
		links = [] as { url: string; title: string }[],
	}: {
		displayName?: string;
		bio?: string;
		avatarUrl?: string;
		themeId?: string;
		links?: { url: string; title: string }[];
	} = $props();

	const theme = $derived(getTheme(themeId));
	const initials = $derived(
		(displayName || 'AB')
			.split(' ')
			.filter(Boolean)
			.map((w: string) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
	const isGradientBg = $derived(theme.bg.startsWith('linear-gradient'));
	const validLinks = $derived(links.filter((l) => l.title || l.url));
</script>

<div class="overflow-hidden rounded-xl border border-border shadow-sm">
	<div class="px-3 py-2 border-b border-border bg-surface-alt">
		<p class="text-xs font-medium text-text-muted">Preview</p>
	</div>
	<div
		class="bio-preview"
		style="
			{isGradientBg ? `background-image: ${theme.bg}` : `background-color: ${theme.bg}`};
			color: {theme.text};
			font-family: {theme.fontFamily};
		"
	>
		<div class="bio-container">
			{#if avatarUrl}
				<img
					src={avatarUrl}
					alt={displayName || 'Avatar'}
					class="bio-avatar"
					onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
				/>
			{:else}
				<div
					class="bio-avatar-fallback"
					style="background-color: {theme.linkBorder}; color: {theme.text};"
				>
					{initials}
				</div>
			{/if}

			<h2 class="bio-name">{displayName || 'Your Name'}</h2>
			{#if bio}
				<p class="bio-text" style="color: {theme.bio};">{bio}</p>
			{:else}
				<p class="bio-text bio-placeholder" style="color: {theme.bio}; opacity: 0.5;">A short bio about yourself</p>
			{/if}

			<div class="bio-links">
				{#if validLinks.length > 0}
					{#each validLinks as link}
						<div
							class="bio-link"
							style="
								background-color: {theme.linkBg};
								color: {theme.linkText};
								border: 1px solid {theme.linkBorder};
								border-radius: {theme.linkRadius};
							"
						>
							{link.title || link.url}
						</div>
					{/each}
				{:else}
					<div
						class="bio-link"
						style="
							background-color: {theme.linkBg};
							color: {theme.linkText};
							border: 1px solid {theme.linkBorder};
							border-radius: {theme.linkRadius};
							opacity: 0.5;
						"
					>
						Your first link
					</div>
				{/if}
			</div>

			<span class="bio-footer" style="color: {theme.bio};">
				Made with nah.tools
			</span>
		</div>
	</div>
</div>

<style>
	.bio-preview {
		display: flex;
		justify-content: center;
		padding: 2rem 1rem;
		min-height: 24rem;
	}

	.bio-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 20rem;
		gap: 0.25rem;
	}

	.bio-avatar {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 9999px;
		object-fit: cover;
		margin-bottom: 0.75rem;
	}

	.bio-avatar-fallback {
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.125rem;
		font-weight: 700;
		margin-bottom: 0.75rem;
	}

	.bio-name {
		font-size: 1.25rem;
		font-weight: 700;
		text-align: center;
		margin: 0;
		line-height: 1.2;
	}

	.bio-text {
		font-size: 0.8125rem;
		text-align: center;
		margin: 0.375rem 0 0;
		line-height: 1.5;
	}

	.bio-placeholder {
		font-style: italic;
	}

	.bio-links {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: 100%;
		margin-top: 1.5rem;
	}

	.bio-link {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		text-align: center;
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: default;
	}

	.bio-footer {
		margin-top: 2rem;
		font-size: 0.6875rem;
		opacity: 0.6;
	}
</style>
