<script lang="ts">
	import { getTheme } from '$bio/themes';

	let { data } = $props();

	const theme = $derived(getTheme(data.profile.theme));
	const initials = $derived(
		data.profile.display_name
			.split(' ')
			.map((w: string) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	function trackClick(linkId: number) {
		if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
			navigator.sendBeacon(
				'/api/bio/click',
				JSON.stringify({ handle: data.profile.handle, link_id: linkId })
			);
		}
	}

	const isGradientBg = $derived(theme.bg.startsWith('linear-gradient'));
</script>

<svelte:head>
	<title>{data.profile.display_name} — nah.tools</title>
	<meta name="description" content={data.profile.bio || `${data.profile.display_name}'s links`} />

	<!-- Open Graph -->
	<meta property="og:title" content={data.profile.display_name} />
	<meta
		property="og:description"
		content={data.profile.bio || `${data.profile.display_name}'s links`}
	/>
	<meta property="og:url" content={`https://nah.tools/bio/${data.profile.handle}`} />
	<meta property="og:type" content="profile" />
	{#if data.profile.avatar_url}
		<meta property="og:image" content={data.profile.avatar_url} />
	{/if}

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={data.profile.display_name} />
	<meta
		name="twitter:description"
		content={data.profile.bio || `${data.profile.display_name}'s links`}
	/>

	<!-- JSON-LD -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: data.profile.display_name,
		url: `https://nah.tools/bio/${data.profile.handle}`,
		...(data.profile.bio ? { description: data.profile.bio } : {}),
		...(data.profile.avatar_url ? { image: data.profile.avatar_url } : {})
	})}</script>`}
</svelte:head>

<div
	class="bio-page"
	style="
		{isGradientBg ? `background-image: ${theme.bg}` : `background-color: ${theme.bg}`};
		color: {theme.text};
		font-family: {theme.fontFamily};
		min-height: 100vh;
	"
>
	<div class="bio-container">
		<!-- Avatar -->
		{#if data.profile.avatar_url}
			<img
				src={data.profile.avatar_url}
				alt={data.profile.display_name}
				class="bio-avatar"
			/>
		{:else}
			<div
				class="bio-avatar-fallback"
				style="background-color: {theme.linkBorder}; color: {theme.text};"
			>
				{initials}
			</div>
		{/if}

		<!-- Name & Bio -->
		<h1 class="bio-name">{data.profile.display_name}</h1>
		{#if data.profile.bio}
			<p class="bio-text" style="color: {theme.bio};">{data.profile.bio}</p>
		{/if}

		<!-- Links -->
		<div class="bio-links">
			{#each data.links as link}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="bio-link"
					onclick={() => trackClick(link.id)}
					style="
						background-color: {theme.linkBg};
						color: {theme.linkText};
						border: 1px solid {theme.linkBorder};
						border-radius: {theme.linkRadius};
					"
					onmouseenter={(e) => {
						const el = e.currentTarget as HTMLElement;
						el.style.backgroundColor = theme.linkHover;
					}}
					onmouseleave={(e) => {
						const el = e.currentTarget as HTMLElement;
						el.style.backgroundColor = theme.linkBg;
					}}
				>
					{link.title}
				</a>
			{/each}
		</div>

		<!-- Footer -->
		<a
			href="https://nah.tools/bio"
			class="bio-footer"
			style="color: {theme.bio};"
		>
			Made with nah.tools
		</a>
	</div>
</div>

<style>
	.bio-page {
		display: flex;
		justify-content: center;
		padding: 3rem 1rem;
	}

	.bio-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		max-width: 28rem;
		gap: 0.25rem;
	}

	.bio-avatar {
		width: 6rem;
		height: 6rem;
		border-radius: 9999px;
		object-fit: cover;
		margin-bottom: 1rem;
	}

	.bio-avatar-fallback {
		width: 6rem;
		height: 6rem;
		border-radius: 9999px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
		margin-bottom: 1rem;
	}

	.bio-name {
		font-size: 1.5rem;
		font-weight: 700;
		text-align: center;
		margin: 0;
		line-height: 1.2;
	}

	.bio-text {
		font-size: 0.875rem;
		text-align: center;
		margin: 0.5rem 0 0;
		line-height: 1.5;
		max-width: 24rem;
	}

	.bio-links {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		width: 100%;
		margin-top: 2rem;
	}

	.bio-link {
		display: block;
		width: 100%;
		padding: 0.875rem 1.25rem;
		text-align: center;
		font-size: 0.9375rem;
		font-weight: 500;
		text-decoration: none;
		transition: background-color 150ms ease, transform 150ms ease;
	}

	.bio-link:hover {
		transform: translateY(-1px);
	}

	.bio-link:active {
		transform: translateY(0);
	}

	.bio-footer {
		margin-top: 3rem;
		font-size: 0.75rem;
		text-decoration: none;
		opacity: 0.6;
		transition: opacity 150ms ease;
	}

	.bio-footer:hover {
		opacity: 1;
	}
</style>
