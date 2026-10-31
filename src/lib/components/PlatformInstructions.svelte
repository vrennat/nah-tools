<script lang="ts">
	import { onMount } from 'svelte';
	import { getInstructions, platforms, suggestPlatform } from '$lib/instructions';
	import type { Platform } from '$lib/instructions/types';
	let { path }: { path: string } = $props();
	const instructions = $derived(getInstructions(path));
	let selected = $state<'browser' | Platform>('browser');
	let suggested = $state<Platform | undefined>();
	let enhanced = $state(false);
	const tabs = [{ id: 'browser', label: 'In your browser' }, ...platforms] as const;
	onMount(() => {
		enhanced = true;
		suggested = suggestPlatform(navigator.userAgent, navigator.maxTouchPoints);
		const followAnchor = () => {
			const tab = tabs.find((entry) => location.hash === `#instructions-panel-${entry.id}`);
			if (tab) selected = tab.id;
		};
		followAnchor();
		window.addEventListener('hashchange', followAnchor);
		return () => window.removeEventListener('hashchange', followAnchor);
	});
	function moveTab(event: KeyboardEvent, index: number) {
		let next: number;
		if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
		else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = tabs.length - 1;
		else return;
		event.preventDefault();
		selected = tabs[next].id;
		document.getElementById(`instructions-tab-${selected}`)?.focus();
	}
</script>

{#if instructions}
	<section class="mt-10 space-y-5 border-t border-border pt-8" aria-labelledby="instructions-heading">
		<div class="space-y-2">
			<h2 id="instructions-heading" class="font-display text-2xl font-700">How to use {instructions.tool.name}</h2>
			<p class="max-w-3xl text-sm text-text-muted">Use the free tool above, or check the options on your device. No subscription or account is required for the browser tool.</p>
		</div>
		{#if enhanced}
			<div role="tablist" aria-label="Instructions for your device" class="flex flex-wrap gap-2">
				{#each tabs as tab, index}
					<button type="button" role="tab" id={`instructions-tab-${tab.id}`} aria-controls={`instructions-panel-${tab.id}`} aria-selected={selected === tab.id} tabindex={selected === tab.id ? 0 : -1} onclick={() => selected = tab.id} onkeydown={(event) => moveTab(event, index)} class={`rounded-lg border px-3 py-2 text-sm font-medium ${selected === tab.id ? 'border-accent bg-accent/10 text-accent' : 'border-border text-text-muted hover:text-text'}`}>
						{tab.label}{#if suggested === tab.id}<span class="ml-1 text-xs">(suggested)</span>{/if}
					</button>
				{/each}
			</div>
		{/if}
		{#each tabs as tab}
			{@const native = tab.id === 'browser' ? undefined : instructions.native[tab.id]}
			{@const optional = tab.id === 'browser' ? undefined : instructions.optional[tab.id]}
			<!-- The runtime tabpanel role makes this focusable after enhancement; without JavaScript all instructions remain visible. -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<div id={`instructions-panel-${tab.id}`} role={enhanced ? 'tabpanel' : undefined} aria-labelledby={enhanced ? `instructions-tab-${tab.id}` : undefined} tabindex={enhanced ? 0 : undefined} hidden={enhanced && selected !== tab.id} class="space-y-3 rounded-xl border border-border bg-surface-alt p-5">
				<h3 class="font-display text-lg font-600">{native ? native.title : `${instructions.tool.name} ${tab.id === 'browser' ? 'in your browser' : `on ${tab.label}`}`}</h3>
				<p class="text-xs font-medium text-accent">{native ? (native.kind === 'built-in' ? 'Built-in app' : 'App required — availability varies') : 'Free browser tool — no installation'}</p>
				{#if !native && tab.id !== 'browser'}
					<p class="text-sm text-text-muted">Use the tool on this page in {tab.id === 'ios' ? 'Safari or another current browser' : tab.id === 'windows' ? 'Edge, Chrome, or Firefox' : tab.id === 'android' ? 'Chrome or another current browser' : 'Safari, Chrome, or Firefox'}. These steps use the browser tool; they do not require an extra app.</p>
				{/if}
				<ol class="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
					{#each native?.steps ?? instructions.browser.steps as step}<li>{step}</li>{/each}
				</ol>
				<p class="text-sm leading-relaxed text-text-muted">{native?.caveat ?? instructions.browser.caveat}</p>
				{#if native}
					{#if tab.id === 'ios'}<p class="text-xs text-text-muted">The source documents iPhone controls; iPad layout may differ. The browser method is also available.</p>{/if}
					<p class="text-xs text-text-muted">Source: <a href={native.source.url} class="text-accent underline underline-offset-2">{native.source.title}</a>. Checked {native.checked}.</p>
				{:else}
					<p class="text-sm text-text-muted">{instructions.browser.privacy === 'local' ? 'Processing happens on your device in the browser. Large files may exceed your device’s available memory.' : instructions.browser.privacy === 'hosted' ? 'Publishing sends your entered content to nah.tools to host it. Share only information you want others to see.' : 'Check the tool’s privacy notes: local creation and hosted features handle information differently.'}</p>
					{#if tab.id !== 'browser'}
						<p class="text-sm text-text-muted">{tab.id === 'ios' ? 'For file tools, choose Browse in the file picker to find a document in Files. A result may open in a preview; use Share → Save to Files when offered.' : tab.id === 'android' ? 'For file tools, choose a document from the system file picker. Saved downloads are usually available in your browser’s Downloads menu or your file manager.' : 'For file tools, choose a copy of the original. Find saved results in your browser’s Downloads menu; your browser may ask where to save them.'} If processing fails, keep the original and try a smaller file or a desktop browser.</p>
					{/if}
				{/if}
				{#if optional}
					<details class="border-t border-border pt-3">
						<summary class="cursor-pointer text-sm font-medium">{optional.title}</summary>
						<p class="mt-3 text-xs text-accent">Optional: {optional.kind === 'built-in' ? 'built-in app' : 'separate app'} — recordings in that app only</p>
						<ol class="mt-3 list-decimal space-y-2 pl-5 text-sm">{#each optional.steps as step}<li>{step}</li>{/each}</ol>
						<p class="mt-3 text-sm text-text-muted">{optional.caveat}</p>
						<p class="mt-3 text-xs text-text-muted">Source: <a href={optional.source.url} class="text-accent underline">{optional.source.title}</a>. Checked {optional.checked}.</p>
					</details>
				{/if}
			</div>
		{/each}
	</section>
{/if}
