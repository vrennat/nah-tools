<script lang="ts">
	import type { Broker, ProgressEntry, RemovalStatus } from '$remove/types';

	let { brokers, progress }: { brokers: Broker[]; progress: Record<string, ProgressEntry> } = $props();

	let counts = $derived.by(() => {
		const result: Record<RemovalStatus, number> = {
			'not-started': 0,
			'email-sent': 0,
			'form-submitted': 0,
			'verification-pending': 0,
			confirmed: 0,
			skipped: 0,
		};
		for (const b of brokers) {
			const status = progress[b.id]?.status ?? 'not-started';
			result[status]++;
		}
		return result;
	});

	let confirmed = $derived(counts.confirmed);
	let inProgress = $derived(counts['email-sent'] + counts['form-submitted'] + counts['verification-pending']);
	let remaining = $derived(counts['not-started']);
	let total = $derived(brokers.length);
	let progressPct = $derived(total > 0 ? Math.round((confirmed / total) * 100) : 0);
</script>

<div class="rounded-xl border border-border bg-surface p-4 shadow-sm">
	<div class="mb-2 flex items-center justify-between">
		<span class="text-sm font-semibold text-text">
			{confirmed} of {total} confirmed
		</span>
		<span class="text-xs text-text-muted">
			{inProgress} in progress &middot; {remaining} remaining
		</span>
	</div>
	<div class="h-2 overflow-hidden rounded-full bg-surface-alt" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100} aria-label="Removal progress">
		<div
			class="h-full rounded-full bg-accent transition-all"
			style="width: {progressPct}%"
		></div>
	</div>
</div>
