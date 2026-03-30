<script lang="ts">
	import type { RemovalStatus } from '$remove/types';

	let { status }: { status: RemovalStatus } = $props();

	const config: Record<RemovalStatus, { label: string; classes: string }> = {
		'not-started': { label: 'Not started', classes: 'bg-surface-alt text-text-muted' },
		'email-sent': { label: 'Email sent', classes: 'bg-accent/10 text-accent' },
		'form-submitted': { label: 'Form submitted', classes: 'bg-accent/10 text-accent' },
		'verification-pending': { label: 'Pending', classes: 'bg-warning/10 text-warning' },
		confirmed: { label: 'Confirmed', classes: 'bg-success/10 text-success' },
		skipped: { label: 'Skipped', classes: 'bg-surface-alt text-text-muted' },
	};

	let current = $derived(config[status]);
</script>

<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium {current.classes}">
	{current.label}
</span>
