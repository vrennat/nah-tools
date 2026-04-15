<script lang="ts">
	type Props = {
		startTime: number;
		endTime: number;
		duration: number;
	};

	let { startTime = $bindable(), endTime = $bindable(), duration }: Props = $props();

	function formatTime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);

		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
		}
		return `${minutes}:${secs.toString().padStart(2, '0')}`;
	}

	function parseTime(input: string): number {
		const parts = input.split(':').map(p => parseInt(p, 10));

		if (parts.length === 2) {
			return parts[0] * 60 + parts[1];
		} else if (parts.length === 3) {
			return parts[0] * 3600 + parts[1] * 60 + parts[2];
		}

		return 0;
	}

	let startInput = $derived(formatTime(startTime));
	let endInput = $derived(formatTime(endTime));

	function handleStartChange(e: Event) {
		const input = e.target as HTMLInputElement;
		startTime = Math.min(parseTime(input.value), duration - 0.1);
	}

	function handleEndChange(e: Event) {
		const input = e.target as HTMLInputElement;
		endTime = Math.max(parseTime(input.value), startTime + 0.1);
	}
</script>

<div class="space-y-4 rounded-lg border border-border bg-surface p-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div>
			<label for="start-time" class="block text-sm font-medium text-text">Start Time</label>
			<input
				id="start-time"
				type="text"
				placeholder="0:00"
				value={startInput}
				onchange={handleStartChange}
				class="mt-1 w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
			<p class="mt-1 text-xs text-text-muted">Format: mm:ss or hh:mm:ss</p>
		</div>

		<div>
			<label for="end-time" class="block text-sm font-medium text-text">End Time</label>
			<input
				id="end-time"
				type="text"
				placeholder="1:00"
				value={endInput}
				onchange={handleEndChange}
				class="mt-1 w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
			/>
			<p class="mt-1 text-xs text-text-muted">Max: {formatTime(duration)}</p>
		</div>
	</div>

	<div class="flex gap-4 text-sm">
		<div>
			<span class="text-text-muted">Duration:</span>
			<span class="ml-2 font-medium text-text">{formatTime(endTime - startTime)}</span>
		</div>
		<div>
			<span class="text-text-muted">Total:</span>
			<span class="ml-2 font-medium text-text">{formatTime(duration)}</span>
		</div>
	</div>

	<div class="space-y-2">
		<div class="flex gap-2 text-xs text-text-muted">
			<span>Start:</span>
			<input
				type="range"
				min="0"
				max={duration}
				step="0.1"
				bind:value={startTime}
				class="flex-1 accent-accent"
			/>
			<span>{Math.round(startTime * 10) / 10}s</span>
		</div>
		<div class="flex gap-2 text-xs text-text-muted">
			<span>End:</span>
			<input
				type="range"
				min="0"
				max={duration}
				step="0.1"
				bind:value={endTime}
				class="flex-1 accent-accent"
			/>
			<span>{Math.round(endTime * 10) / 10}s</span>
		</div>
	</div>
</div>
