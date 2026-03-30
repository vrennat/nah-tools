<script lang="ts">
	import type { BackendType } from '$photo/types';

	let { backend }: { backend: BackendType | null } = $props();
</script>

{#if backend === 'webgpu'}
	<span class="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
		<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
			<path d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
		GPU Accelerated
	</span>
{:else if backend === 'wasm'}
	<span class="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning">
		<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
		CPU Mode
	</span>
{/if}
