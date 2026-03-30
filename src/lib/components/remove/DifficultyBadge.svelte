<script lang="ts">
	import type { Difficulty } from '$remove/types';

	let { difficulty }: { difficulty: Difficulty } = $props();

	const config: Record<Difficulty, { label: string; classes: string }> = {
		easy: { label: 'Easy', classes: 'bg-success/10 text-success' },
		medium: { label: 'Medium', classes: 'bg-warning/10 text-warning' },
		hard: { label: 'Hard', classes: 'bg-error/10 text-error' },
		'manual-only': { label: 'Manual', classes: 'bg-error/10 text-error' },
	};

	let current = $derived(config[difficulty]);
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {current.classes}">
	{current.label}
</span>
