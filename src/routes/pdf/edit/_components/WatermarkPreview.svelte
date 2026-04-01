<script lang="ts">
	import type { WatermarkConfig } from '$pdf/types';

	interface Props {
		config: WatermarkConfig;
		width: number;
		height: number;
	}

	let { config, width, height }: Props = $props();
</script>

<div
	class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
	style="width: {width}px; height: {height}px; opacity: {config.opacity};"
>
	<span
		class="whitespace-nowrap select-none"
		style="
			font-size: {config.fontSize}px;
			color: {config.color};
			transform: rotate({config.rotation}deg);
		"
	>
		{config.text}
	</span>
</div>
