<script lang="ts">
	import type { PageNumberConfig } from '$pdf/types';

	interface Props {
		config: PageNumberConfig;
		pageIndex: number;
		totalPages: number;
		width: number;
		height: number;
		scale: number;
	}

	let { config, pageIndex, totalPages, width, height, scale }: Props = $props();

	let displayNum = $derived(config.startNumber + pageIndex);
	let totalDisplay = $derived(totalPages + config.startNumber - 1);
	let text = $derived(
		config.format
			.replace('{n}', String(displayNum))
			.replace('{total}', String(totalDisplay))
	);

	let isTop = $derived(config.position.startsWith('top'));
	let isLeft = $derived(config.position.endsWith('left'));
	let isRight = $derived(config.position.endsWith('right'));

	let marginPx = $derived(config.margin * scale);
</script>

<div
	class="pointer-events-none absolute"
	style="
		{isTop ? `top: ${marginPx}px;` : `bottom: ${marginPx}px;`}
		{isLeft ? `left: ${marginPx}px;` : isRight ? `right: ${marginPx}px;` : 'left: 50%; transform: translateX(-50%);'}
		font-size: {config.fontSize * scale}px;
		color: rgba(77, 77, 77, 0.7);
		width: {width}px;
	"
>
	{text}
</div>
