<script lang="ts">
	import { onMount } from 'svelte';

	let dark = $state(false);

	onMount(() => {
		dark = document.documentElement.classList.contains('dark');
		if (!dark && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme')) {
			dark = true;
			document.documentElement.classList.add('dark');
		}
	});

	function toggle() {
		dark = !dark;
		document.documentElement.classList.toggle('dark', dark);
		localStorage.setItem('theme', dark ? 'dark' : 'light');
	}
</script>

<button
	type="button"
	onclick={toggle}
	aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
	class="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-alt hover:text-text"
>
	{#if dark}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	{:else}
		<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
		</svg>
	{/if}
</button>
