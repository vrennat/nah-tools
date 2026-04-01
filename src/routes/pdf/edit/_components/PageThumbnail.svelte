<script lang="ts">
	interface Props {
		index: number;
		label: string;
		thumbnailUrl: string | undefined;
		selected: boolean;
		width: number;
		height: number;
		rotation: number;
		onselect: (index: number, e: PointerEvent) => void;
		onpointerdown: (index: number, e: PointerEvent) => void;
	}

	let { index, label, thumbnailUrl, selected, width, height, rotation, onselect, onpointerdown }: Props = $props();

	const THUMB_WIDTH = 140;

	let isRotated = $derived(rotation === 90 || rotation === 270);
	let effectiveWidth = $derived(isRotated ? height : width);
	let effectiveHeight = $derived(isRotated ? width : height);
	let scale = $derived(THUMB_WIDTH / effectiveWidth);
	let thumbHeight = $derived(effectiveHeight * scale);
</script>

<button
	type="button"
	class="group relative flex w-full flex-col items-center gap-1 rounded-lg p-2 transition-colors
		{selected
		? 'bg-accent/10 ring-2 ring-accent'
		: 'hover:bg-surface-alt'}"
	onclick={(e) => onselect(index, e as unknown as PointerEvent)}
	onpointerdown={(e) => onpointerdown(index, e)}
>
	<div
		class="relative overflow-hidden rounded border border-border bg-white shadow-sm"
		style="width: {THUMB_WIDTH}px; height: {thumbHeight}px;"
	>
		{#if thumbnailUrl}
			<img
				src={thumbnailUrl}
				alt={label}
				class="h-full w-full object-contain"
				draggable="false"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center bg-surface-alt">
				<span class="text-xs text-text-muted">Loading...</span>
			</div>
		{/if}
	</div>
	<span
		class="text-xs tabular-nums transition-colors
			{selected ? 'font-medium text-accent' : 'text-text-muted group-hover:text-text'}"
	>
		{label}
	</span>
</button>
