<script lang="ts">
	import { goto } from '$app/navigation';
	import { setPendingFile } from '$lib/file-transfer';
	import { getTool } from '$lib/registry/index';

	interface Props {
		/** The current tool path, e.g. '/pdf/merge'. Used to look up suggestions and source label. */
		path: string;
		/** Returns the result bytes. Called lazily on button press to avoid holding big buffers reactively. */
		resultBytes: () => Uint8Array | null;
		/** Filename to give the transferred file. */
		resultName: string;
		/**
		 * Whether the result is a single PDF file. When false (e.g. split producing a
		 * ZIP of multiple files), the "Open in editor" button and chained suggestions are hidden.
		 */
		singlePdf?: boolean;
	}

	let { path, resultBytes, resultName, singlePdf = true }: Props = $props();

	/**
	 * Explicit next-step suggestion map. Keys are tool paths; values are ordered
	 * lists of follow-up paths to show (up to 2 are rendered).
	 *
	 * Rationale:
	 *   merge    -> compress  (merged doc is often large; compress is the next win)
	 *              watermark  (freshly merged docs get distribution stamps)
	 *   split    -> merge     (you split to extract a chunk; now recombine variants)
	 *              compress   (extracted pages are still full-resolution)
	 *   compress -> watermark (after optimising, stamp for distribution)
	 *              page-numbers
	 *   rotate   -> compress  (scans rotated often have image bloat)
	 *              page-numbers
	 *   watermark -> compress (watermarked docs are sent out; compress before sharing)
	 *              page-numbers
	 *   page-numbers -> compress
	 *                  watermark
	 *   remove-pages -> compress
	 *                   reorder
	 *   reorder  -> compress
	 *              page-numbers
	 */
	const SUGGESTIONS: Record<string, string[]> = {
		'/pdf/merge': ['/pdf/compress', '/pdf/watermark'],
		'/pdf/split': ['/pdf/merge', '/pdf/compress'],
		'/pdf/compress': ['/pdf/watermark', '/pdf/page-numbers'],
		'/pdf/rotate': ['/pdf/compress', '/pdf/page-numbers'],
		'/pdf/watermark': ['/pdf/compress', '/pdf/page-numbers'],
		'/pdf/page-numbers': ['/pdf/compress', '/pdf/watermark'],
		'/pdf/remove-pages': ['/pdf/compress', '/pdf/reorder'],
		'/pdf/reorder': ['/pdf/compress', '/pdf/page-numbers']
	};

	const suggestions = $derived.by(() => {
		const paths = SUGGESTIONS[path] ?? [];
		return paths
			.map((p) => getTool(p))
			.filter((t): t is NonNullable<typeof t> => t !== undefined)
			.slice(0, 2);
	});

	const currentToolName = $derived(getTool(path)?.name ?? path);

	async function openInEditor() {
		const bytes = resultBytes();
		if (!bytes) return;
		const name = resultName.endsWith('.pdf') ? resultName : `${resultName}.pdf`;
		const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
		setPendingFile(arr, name, currentToolName);
		await goto('/pdf/edit');
	}

	async function openInTool(targetPath: string, targetName: string) {
		const bytes = resultBytes();
		if (!bytes) {
			// No bytes available (e.g. multi-file ZIP); fall back to plain navigation.
			await goto(targetPath);
			return;
		}
		const name = resultName.endsWith('.pdf') ? resultName : `${resultName}.pdf`;
		const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
		setPendingFile(arr, name, currentToolName);
		await goto(targetPath);
	}
</script>

<div class="mt-6 rounded-xl border border-border bg-surface-alt px-4 py-4">
	<p class="text-sm font-medium text-text">Done. Do more with this file:</p>

	<div class="mt-3 flex flex-wrap gap-2">
		{#if singlePdf}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
				onclick={openInEditor}
			>
				<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
				</svg>
				Open in PDF editor
			</button>
		{/if}

		{#each suggestions as tool}
			<button
				type="button"
				class="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/60 hover:text-accent"
				onclick={() => openInTool(tool.path, tool.name)}
			>
				{#if tool.icon}
					<svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d={tool.icon} />
					</svg>
				{/if}
				{tool.name}
			</button>
		{/each}
	</div>
</div>
