<script lang="ts">
	import type { VideoPreset } from '$media/presets';

	type Props = {
		selected: string;
		presets: VideoPreset[];
	};

	let { selected = $bindable(), presets }: Props = $props();
</script>

<fieldset class="space-y-2">
	<legend class="text-sm font-medium text-text">Quality Preset</legend>
	<div class="grid gap-3 sm:grid-cols-3">
		{#each presets as preset (preset.id)}
			<label
				class="group relative rounded-lg border-2 p-3 transition-all duration-200 cursor-pointer"
				class:border-accent={selected === preset.id}
				style={selected === preset.id ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
				class:border-border={selected !== preset.id}
			>
				<input
					type="radio"
					name="preset"
					value={preset.id}
					bind:group={selected}
					class="sr-only"
				/>
				<div class="space-y-1">
					<div class="font-medium text-text group-hover:text-accent transition-colors">
						{preset.label}
					</div>
					<div class="text-xs text-text-muted">
						{preset.description}
					</div>
				</div>
			</label>
		{/each}
	</div>
</fieldset>
