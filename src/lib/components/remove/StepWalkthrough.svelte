<script lang="ts">
	import type { BrokerStep } from '$remove/types';

	let { steps }: { steps: BrokerStep[] } = $props();
</script>

<ol class="space-y-3">
	{#each steps as step, i}
		<li class="flex gap-3">
			<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
				{i + 1}
			</span>
			<div class="space-y-1">
				<p class="text-sm text-text">{step.instruction}</p>
				{#if step.url}
					<a
						href={step.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
					>
						Open link
						<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				{/if}
				{#if step.note}
					<p class="text-xs text-text-muted">{step.note}</p>
				{/if}
			</div>
		</li>
	{/each}
</ol>
