<script lang="ts">
	interface Props {
		type: 'error' | 'success' | 'info' | 'warning';
		message: string;
	}

	const { type, message }: Props = $props();

	const styles: Record<Props['type'], string> = {
		error: 'bg-error/10 text-error',
		success: 'bg-success/10 text-success',
		info: 'bg-accent/10 text-accent',
		warning: 'bg-warning/10 text-warning'
	};
</script>

<div role="alert" class="rounded-lg px-3 py-2 text-sm {styles[type]}">
	{message}
</div>
