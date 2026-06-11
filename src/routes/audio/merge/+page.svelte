<script lang="ts">
	import MediaToolLayout from '$components/media/MediaToolLayout.svelte';
	import MediaLoadingOverlay from '$components/media/MediaLoadingOverlay.svelte';
	import ProcessingProgress from '$components/media/ProcessingProgress.svelte';
	import { getFFmpeg, cancelFFmpeg } from '$media/ffmpeg-loader';
	import { mergeAudio } from '$media/processor';
	import { AUDIO_FORMATS, type AudioFormat } from '$media/audio-types';
	import type { LoadProgress, ProcessingProgress as PP } from '$media/types';

	let files = $state<File[]>([]);
	let format = $state<AudioFormat>('mp3');
	let isDragging = $state(false);
	let fileInput: HTMLInputElement | null = $state(null);
	let processing = $state(false);
	let loadProgress = $state<LoadProgress>({ state: 'idle', percent: 0 });
	let processingProgress = $state<PP>({ percent: 0, timeElapsed: 0, estimatedTotal: 0 });
	let error = $state('');
	let result = $state<{ originalSize: number; resultSize: number; filename: string } | null>(null);

	let canProcess = $derived(files.length >= 2 && !processing && loadProgress.state === 'ready');

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

	async function initFFmpeg() {
		if (loadProgress.state !== 'idle') return;
		try {
			await getFFmpeg((p) => (loadProgress = p));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load FFmpeg';
			loadProgress = { state: 'error', percent: 0 };
		}
	}

	function addFiles(list: FileList | null) {
		if (!list?.length) return;
		const incoming = Array.from(list).filter((f) => f.type.startsWith('audio/'));
		if (incoming.length) {
			files = [...files, ...incoming];
			result = null;
			if (loadProgress.state === 'idle') initFFmpeg();
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		addFiles(e.dataTransfer?.files ?? null);
	}

	function handleInputChange(e: Event) {
		addFiles((e.target as HTMLInputElement).files);
		(e.target as HTMLInputElement).value = '';
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		result = null;
	}

	function move(index: number, delta: number) {
		const target = index + delta;
		if (target < 0 || target >= files.length) return;
		const next = [...files];
		[next[index], next[target]] = [next[target], next[index]];
		files = next;
		result = null;
	}

	async function handleMerge() {
		if (!canProcess) return;
		processing = true;
		error = '';
		result = null;

		try {
			const mediaResult = await mergeAudio(files, format, (p) => (processingProgress = p));
			result = {
				originalSize: mediaResult.originalSize,
				resultSize: mediaResult.resultSize,
				filename: mediaResult.filename
			};

			const url = URL.createObjectURL(mediaResult.blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = mediaResult.filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		} catch (e) {
			if (!(e instanceof Error && e.message.includes('terminate'))) {
				error = e instanceof Error ? e.message : 'Merge failed';
			}
		} finally {
			processing = false;
		}
	}

	function handleRetry() {
		loadProgress = { state: 'idle', percent: 0 };
		initFFmpeg();
	}

	function handleCancel() {
		cancelFFmpeg();
		processing = false;
		loadProgress = { state: 'idle', percent: 0 };
	}
</script>

<svelte:head>
	<title>Merge Audio Files Free Online — Join MP3, WAV &amp; More | nah</title>
	<meta
		name="description"
		content="Combine multiple audio files into one track. Reorder, then merge to MP3, WAV, OGG, M4A, FLAC, or AAC. Free, no upload — runs in your browser."
	/>
	<link rel="canonical" href="https://nah.tools/audio/merge" />
</svelte:head>

<MediaToolLayout
	title="Merge Audio"
	description="Join multiple audio files into a single track, in the order you choose."
>
	<section class="mx-auto max-w-2xl space-y-6">
		<div class="rounded-xl border border-border bg-surface p-6 shadow-sm">
			<div
				class="rounded-xl border-2 border-dashed transition-all duration-200"
				class:border-accent={isDragging}
				class:border-border={!isDragging}
				style={isDragging ? 'background-color: rgba(59, 130, 246, 0.05);' : ''}
				ondrop={handleDrop}
				ondragover={(e) => { e.preventDefault(); isDragging = true; }}
				ondragleave={() => (isDragging = false)}
				role="button"
				tabindex="0"
			>
				<input
					bind:this={fileInput}
					type="file"
					accept="audio/*"
					multiple
					onchange={handleInputChange}
					class="hidden"
					aria-label="Select audio files"
				/>
				<button type="button" onclick={() => fileInput?.click()} class="w-full p-8 text-center">
					<div class="mb-3 flex justify-center">
						<svg class="h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33A3 3 0 0116.5 19.5H6.75z" />
						</svg>
					</div>
					<h3 class="font-display font-600 text-text">Drop audio files here or click to browse</h3>
					<p class="mt-1 text-sm text-text-muted">Add two or more files to merge</p>
				</button>
			</div>

			{#if files.length > 0}
				<div class="mt-4 space-y-6">
					<ol class="space-y-2">
						{#each files as f, i (f.name + i)}
							<li class="flex items-center gap-3 rounded-lg border border-border bg-surface-alt p-3">
								<span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">{i + 1}</span>
								<div class="min-w-0 flex-1">
									<div class="truncate text-sm font-medium text-text">{f.name}</div>
									<div class="text-xs text-text-muted">{formatSize(f.size)}</div>
								</div>
								<div class="flex shrink-0 items-center gap-1">
									<button
										type="button"
										onclick={() => move(i, -1)}
										disabled={i === 0}
										class="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="Move up"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" /></svg>
									</button>
									<button
										type="button"
										onclick={() => move(i, 1)}
										disabled={i === files.length - 1}
										class="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
										aria-label="Move down"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg>
									</button>
									<button
										type="button"
										onclick={() => removeFile(i)}
										class="rounded-md p-1.5 text-text-muted transition-colors hover:bg-surface hover:text-error"
										aria-label="Remove"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
									</button>
								</div>
							</li>
						{/each}
					</ol>

					<label class="block space-y-1.5">
						<span class="text-sm font-medium text-text">Output Format</span>
						<select
							bind:value={format}
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						>
							{#each AUDIO_FORMATS as fmt}
								<option value={fmt.id}>{fmt.label} — {fmt.description}</option>
							{/each}
						</select>
					</label>

					<button
						onclick={handleMerge}
						disabled={!canProcess}
						class="w-full rounded-lg bg-accent px-4 py-3 font-medium text-white transition-all duration-200 hover:enabled:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{#if processing}Merging...{:else if files.length < 2}Add at least two files{:else}Merge {files.length} Files{/if}
					</button>

					{#if result}
						<div class="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
							<div class="font-medium">Audio merged successfully!</div>
							<div class="space-y-1 text-xs">
								<div>Filename: {result.filename}</div>
								<div>Size: {formatSize(result.resultSize)}</div>
							</div>
						</div>
					{/if}

					{#if error}
						<div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
							{error}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</section>
</MediaToolLayout>

<MediaLoadingOverlay state={loadProgress.state} percent={loadProgress.percent} onRetry={handleRetry} />

{#if processing}
	<ProcessingProgress progress={processingProgress} onCancel={handleCancel} />
{/if}
