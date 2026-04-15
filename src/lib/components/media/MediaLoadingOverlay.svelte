<script lang="ts">
	import type { LoadState } from '$media/types';

	type Props = {
		state: LoadState;
		percent: number;
		onRetry?: () => void;
	};

	let { state, percent, onRetry }: Props = $props();
</script>

{#if state === 'loading' || state === 'error'}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		role="status"
		aria-live="polite"
	>
		<div class="rounded-2xl border border-border bg-surface p-8 shadow-xl max-w-md w-full mx-4">
			{#if state === 'loading'}
				<div class="space-y-4">
					<div class="text-center">
						<h2 class="font-display font-700 text-text">Loading Media Engine</h2>
						<p class="mt-2 text-sm text-text-muted">
							Downloading FFmpeg (about 25MB, cached for future use)
						</p>
					</div>
					<div class="space-y-2">
						<div class="h-2 w-full overflow-hidden rounded-full bg-border">
							<div
								class="h-full bg-accent transition-all duration-300"
								style="width: {percent}%"
								role="progressbar"
								aria-valuenow={percent}
								aria-valuemin={0}
								aria-valuemax={100}
							></div>
						</div>
						<p class="text-right text-xs text-text-muted">{percent}%</p>
					</div>
				</div>
			{:else if state === 'error'}
				<div class="space-y-4">
					<div class="text-center">
						<h2 class="font-display font-700 text-red-600">Failed to Load</h2>
						<p class="mt-2 text-sm text-text-muted">
							Could not load the media processing engine. Please check your internet connection and try again.
						</p>
					</div>
					{#if onRetry}
						<button
							onclick={onRetry}
							class="w-full rounded-lg bg-accent px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-accent/90"
						>
							Try Again
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}
