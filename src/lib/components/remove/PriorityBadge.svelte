<script lang="ts">
	import type { Priority } from '$remove/types';

	let { priority }: { priority: Priority } = $props();

	const config: Record<Priority, { label: string; classes: string }> = {
		crucial: { label: 'Crucial', classes: 'bg-error/10 text-error' },
		high: { label: 'High', classes: 'bg-warning/10 text-warning' },
		medium: { label: 'Medium', classes: 'bg-accent/10 text-accent' },
		low: { label: 'Low', classes: 'bg-surface-alt text-text-muted' },
	};

	let current = $derived(config[priority]);
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {current.classes}">
	{current.label}
</span>
