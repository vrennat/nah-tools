<!--
	Cloudflare Turnstile widget (explicit rendering, appearance: interaction-only,
	so most visitors never see it).

	Usage: <Turnstile bind:token bind:this={ts} /> then send `turnstile_token: token`.
	While `turnstileEnabled && !token`, keep submit disabled ("Verifying…").
	and call ts.reset() after every submission (tokens are single-use, 300s TTL).

	When PUBLIC_TURNSTILE_SITE_KEY is unset at build time this renders nothing and
	token stays undefined; the server skips verification only while
	TURNSTILE_SECRET_KEY is also unset, so set the site key first when deploying.
-->
<script lang="ts" module>
	import * as publicEnv from '$env/static/public';
	// Namespace import: a named import of an unset variable fails the build, and
	// $env/dynamic/public is unavailable on these prerendered pages. The cast is
	// needed because the generated type omits unset variables.
	const siteKey: string | undefined =
		(publicEnv as Record<string, string | undefined>).PUBLIC_TURNSTILE_SITE_KEY || undefined;

	/** True when the widget renders; forms should wait for a token before submitting. */
	export const turnstileEnabled = !!siteKey;

	interface TurnstileApi {
		render(el: HTMLElement, opts: Record<string, unknown>): string;
		reset(id: string): void;
		remove(id: string): void;
	}

	const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
	let loader: Promise<TurnstileApi> | null = null;

	function loadTurnstile(): Promise<TurnstileApi> {
		const w = window as unknown as { turnstile?: TurnstileApi };
		if (w.turnstile) return Promise.resolve(w.turnstile);
		loader ??= new Promise<TurnstileApi>((resolve, reject) => {
			const s = document.createElement('script');
			s.src = SCRIPT_SRC;
			s.async = true;
			s.onload = () => (w.turnstile ? resolve(w.turnstile) : reject(new Error('turnstile missing')));
			s.onerror = () => {
				loader = null;
				s.remove();
				reject(new Error('Failed to load Turnstile'));
			};
			document.head.appendChild(s);
		});
		return loader;
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let {
		token = $bindable<string | undefined>(undefined),
		action
	}: { token?: string; action?: string } = $props();

	let container: HTMLDivElement | undefined = $state();
	let widgetId: string | null = null;
	let api: TurnstileApi | null = null;
	let loadError = $state('');

	onMount(() => {
		if (!siteKey || !container) return;
		let cancelled = false;
		loadTurnstile()
			.then((t) => {
				if (cancelled || !container) return;
				api = t;
				widgetId = t.render(container, {
					sitekey: siteKey,
					action,
					appearance: 'interaction-only',
					theme: 'auto',
					callback: (tok: string) => {
						token = tok;
						loadError = '';
					},
					'expired-callback': () => {
						token = undefined;
						if (widgetId) t.reset(widgetId);
					},
					'error-callback': () => {
						token = undefined;
						loadError = 'Bot check failed. Refresh the page if this persists.';
						// Returning nothing lets Turnstile's own retry logic continue.
					}
				});
			})
			.catch(() => {
				loadError = 'Could not load the bot check. Disable blockers for challenges.cloudflare.com and reload.';
			});
		return () => {
			cancelled = true;
			if (api && widgetId) api.remove(widgetId);
			widgetId = null;
		};
	});

	/** Discard the current (single-use) token and fetch a fresh one. */
	export function reset() {
		token = undefined;
		if (api && widgetId) api.reset(widgetId);
	}
</script>

{#if siteKey}
	<div bind:this={container} class="turnstile"></div>
	{#if loadError}
		<p class="text-sm text-red-600 dark:text-red-400" role="alert">{loadError}</p>
	{/if}
{/if}
