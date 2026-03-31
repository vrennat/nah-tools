<script lang="ts">
	import type { CodecName } from '$compress/types';
	import { CODECS } from '$compress/codecs';

	let {
		open = $bindable(false),
		exporting = false,
		onexport
	}: {
		open: boolean;
		exporting?: boolean;
		onexport: (codec: CodecName, quality: number) => void;
	} = $props();

	let codec: CodecName = $state('webp');
	let quality = $state(90);

	// Filter to common export formats
	const exportCodecs = CODECS.filter((c) => ['jpeg', 'webp', 'avif', 'png'].includes(c.name));
</script>

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		onkeydown={(e) => e.key === 'Escape' && (open = false)}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div class="absolute inset-0" onclick={() => (open = false)}></div>

		<div class="relative w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-xl">
			<h3 class="font-display text-lg font-700 text-text">Export Image</h3>

			<div class="mt-4 space-y-4">
				<!-- Format -->
				<div class="space-y-2">
					<span class="text-sm font-medium text-text">Format</span>
					<div class="grid grid-cols-4 gap-2">
						{#each exportCodecs as c}
							<button
								type="button"
								class="rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors
									{codec === c.name
									? 'border-accent bg-accent/10 text-accent'
									: 'border-border bg-surface-alt text-text-muted hover:border-accent/50'}"
								onclick={() => (codec = c.name)}
								disabled={exporting}
							>
								{c.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- Quality -->
				{#if CODECS.find((c) => c.name === codec)?.supportsQuality}
					<div class="space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-sm font-medium text-text">Quality</span>
							<span class="font-mono text-sm text-text-muted">{quality}</span>
						</div>
						<input
							type="range"
							bind:value={quality}
							min={0}
							max={100}
							step={1}
							class="w-full accent-accent"
							disabled={exporting}
						/>
					</div>
				{/if}

				<!-- Actions -->
				<div class="flex gap-3 pt-2">
					<button
						type="button"
						class="flex-1 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
						onclick={() => onexport(codec, quality)}
						disabled={exporting}
					>
						{#if exporting}
							<span class="inline-flex items-center gap-2">
								<span class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
								Exporting...
							</span>
						{:else}
							Export
						{/if}
					</button>
					<button
						type="button"
						class="rounded-lg border border-border px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-surface-alt"
						onclick={() => (open = false)}
						disabled={exporting}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
