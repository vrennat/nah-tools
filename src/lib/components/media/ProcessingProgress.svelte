<script lang="ts">
	import type { ProcessingProgress } from '$media/types';

	type Props = {
		progress: ProcessingProgress;
		onCancel: () => void;
	};

	let { progress, onCancel }: Props = $props();

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
	role="status"
	aria-live="polite"
	aria-label="Processing progress"
>
	<div class="rounded-2xl border border-border bg-surface p-8 shadow-xl max-w-md w-full mx-4">
		<div class="space-y-4">
			<div class="text-center">
				<h2 class="font-display font-700 text-text">Processing</h2>
				<p class="mt-1 text-sm text-text-muted">
					{progress.percent}% complete
				</p>
			</div>

			<div class="space-y-2">
				<div class="h-2 w-full overflow-hidden rounded-full bg-border">
					<div
						class="h-full bg-accent transition-all duration-300"
						style="width: {progress.percent}%"
						role="progressbar"
						aria-valuenow={progress.percent}
						aria-valuemin={0}
						aria-valuemax={100}
					></div>
				</div>

				<div class="flex justify-between text-xs text-text-muted">
					<span>Elapsed: {formatTime(progress.timeElapsed)}</span>
					<span>Est. Total: {formatTime(progress.estimatedTotal)}</span>
				</div>
			</div>

			<button
				type="button"
				onclick={onCancel}
				class="w-full rounded-lg border border-border px-4 py-2 font-medium text-text transition-all duration-200 hover:bg-surface-alt"
			>
				Cancel
			</button>
		</div>
	</div>
</div>
