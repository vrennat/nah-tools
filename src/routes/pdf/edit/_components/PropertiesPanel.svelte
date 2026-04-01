<script lang="ts">
	import type { EditorState } from '$pdf/editor-state.svelte';
	import type { WatermarkConfig, PageNumberConfig } from '$pdf/types';

	interface Props {
		editor: EditorState;
	}

	let { editor }: Props = $props();

	// Watermark local state
	let wmEnabled = $state(false);
	let wmText = $state('DRAFT');
	let wmFontSize = $state(60);
	let wmColor = $state('#999999');
	let wmOpacity = $state(0.3);
	let wmRotation = $state(-45);

	// Page numbers local state
	let pnEnabled = $state(false);
	let pnPosition = $state<PageNumberConfig['position']>('bottom-center');
	let pnFormat = $state('{n}');
	let pnFontSize = $state(12);
	let pnMargin = $state(36);
	let pnStartNumber = $state(1);

	// Sync watermark to editor state
	$effect(() => {
		if (wmEnabled) {
			editor.setWatermark({
				text: wmText,
				fontSize: wmFontSize,
				color: wmColor,
				opacity: wmOpacity,
				rotation: wmRotation
			});
		} else {
			editor.setWatermark(null);
		}
	});

	// Sync page numbers to editor state
	$effect(() => {
		if (pnEnabled) {
			editor.setPageNumbers({
				position: pnPosition,
				format: pnFormat,
				fontSize: pnFontSize,
				margin: pnMargin,
				startNumber: pnStartNumber
			});
		} else {
			editor.setPageNumbers(null);
		}
	});

	const formatOptions = [
		{ value: '{n}', label: '1, 2, 3...' },
		{ value: '{n}/{total}', label: '1/10, 2/10...' },
		{ value: 'Page {n}', label: 'Page 1, Page 2...' },
		{ value: 'Page {n} of {total}', label: 'Page 1 of 10...' }
	];

	let annotationCount = $derived(editor.annotations.length);
</script>

<div
	class="flex h-full flex-col gap-4 overflow-y-auto border-l border-border bg-surface p-4"
	style="width: 260px; min-width: 260px;"
>
	<h2 class="text-xs font-semibold uppercase tracking-wider text-text-muted">Properties</h2>

	<!-- Annotations summary -->
	{#if annotationCount > 0}
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<span class="text-sm font-medium text-text">
					{annotationCount} annotation{annotationCount !== 1 ? 's' : ''}
				</span>
				<button
					type="button"
					class="text-xs text-error hover:underline"
					onclick={() => editor.clearAnnotations()}
				>
					Clear all
				</button>
			</div>
		</div>
	{/if}

	<!-- Watermark -->
	<div class="space-y-3 rounded-lg border border-border p-3">
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={wmEnabled} class="accent-accent" />
			<span class="text-sm font-medium text-text">Watermark</span>
		</label>

		{#if wmEnabled}
			<div class="space-y-2">
				<input
					type="text"
					bind:value={wmText}
					placeholder="Watermark text"
					class="w-full rounded border border-border bg-surface px-2 py-1 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
				<div class="flex gap-2">
					<label class="flex flex-1 flex-col gap-1">
						<span class="text-xs text-text-muted">Size</span>
						<input
							type="number"
							bind:value={wmFontSize}
							min="10"
							max="200"
							class="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
						/>
					</label>
					<label class="flex flex-col gap-1">
						<span class="text-xs text-text-muted">Color</span>
						<input type="color" bind:value={wmColor} class="h-8 w-10 rounded border border-border" />
					</label>
				</div>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-text-muted">Opacity ({Math.round(wmOpacity * 100)}%)</span>
					<input type="range" bind:value={wmOpacity} min="0.05" max="1" step="0.05" class="accent-accent" />
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-text-muted">Rotation ({wmRotation}deg)</span>
					<input type="range" bind:value={wmRotation} min="-90" max="90" step="5" class="accent-accent" />
				</label>
			</div>
		{/if}
	</div>

	<!-- Page Numbers -->
	<div class="space-y-3 rounded-lg border border-border p-3">
		<label class="flex items-center gap-2">
			<input type="checkbox" bind:checked={pnEnabled} class="accent-accent" />
			<span class="text-sm font-medium text-text">Page Numbers</span>
		</label>

		{#if pnEnabled}
			<div class="space-y-2">
				<label class="flex flex-col gap-1">
					<span class="text-xs text-text-muted">Position</span>
					<select
						bind:value={pnPosition}
						class="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
					>
						<option value="bottom-center">Bottom Center</option>
						<option value="bottom-left">Bottom Left</option>
						<option value="bottom-right">Bottom Right</option>
						<option value="top-center">Top Center</option>
						<option value="top-left">Top Left</option>
						<option value="top-right">Top Right</option>
					</select>
				</label>
				<label class="flex flex-col gap-1">
					<span class="text-xs text-text-muted">Format</span>
					<select
						bind:value={pnFormat}
						class="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
					>
						{#each formatOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</label>
				<div class="flex gap-2">
					<label class="flex flex-1 flex-col gap-1">
						<span class="text-xs text-text-muted">Size</span>
						<input
							type="number"
							bind:value={pnFontSize}
							min="6"
							max="48"
							class="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
						/>
					</label>
					<label class="flex flex-1 flex-col gap-1">
						<span class="text-xs text-text-muted">Start #</span>
						<input
							type="number"
							bind:value={pnStartNumber}
							min="0"
							max="999"
							class="w-full rounded border border-border bg-surface px-2 py-1 text-sm"
						/>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<!-- Page info -->
	{#if editor.hasDoc}
		<div class="mt-auto space-y-1 border-t border-border pt-3">
			<p class="text-xs text-text-muted">
				<span class="font-medium">{editor.pageCount}</span> page{editor.pageCount !== 1 ? 's' : ''}
			</p>
			<p class="text-xs text-text-muted">
				<span class="font-medium">{(editor.fileSize / 1024).toFixed(0)}</span> KB
			</p>
		</div>
	{/if}
</div>
