<script lang="ts">
	import type { TextAnnotation as TextAnn } from '$pdf/types';

	interface Props {
		annotation: TextAnn;
		screenX: number;
		screenY: number;
		scale: number;
		index: number;
		onremove: (index: number) => void;
	}

	let { annotation, screenX, screenY, scale, index, onremove }: Props = $props();

	let hovered = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group absolute select-none"
	style="
		left: {screenX}px;
		top: {screenY}px;
		font-size: {annotation.fontSize * scale}px;
		color: {annotation.color};
		line-height: 1.2;
		pointer-events: auto;
		cursor: default;
	"
	onmouseenter={() => (hovered = true)}
	onmouseleave={() => (hovered = false)}
>
	{annotation.text}
	{#if hovered}
		<button
			type="button"
			class="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] text-white shadow"
			onclick={(e) => { e.stopPropagation(); onremove(index); }}
			title="Remove annotation"
		>
			x
		</button>
	{/if}
</div>
