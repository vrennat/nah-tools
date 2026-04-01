<script lang="ts">
	import type { EditorState } from '$pdf/editor-state.svelte';

	interface Props {
		editor: EditorState;
	}

	let { editor }: Props = $props();

	const ZOOM_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

	function handleZoomChange(e: Event) {
		const value = parseFloat((e.target as HTMLSelectElement).value);
		editor.setZoom(value);
	}
</script>

<div class="flex items-center gap-2 border-b border-border bg-surface px-4 py-2">
	<!-- File name -->
	<span class="mr-2 truncate text-sm font-medium text-text" title={editor.fileName}>
		{editor.fileName || 'No file loaded'}
	</span>

	<div class="mx-2 h-5 w-px bg-border"></div>

	<!-- Undo / Redo -->
	<button
		type="button"
		class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
		disabled={!editor.canUndo || editor.loading}
		onclick={() => editor.undo()}
		title="Undo (Ctrl+Z)"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
		</svg>
	</button>
	<button
		type="button"
		class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
		disabled={!editor.canRedo || editor.loading}
		onclick={() => editor.redo()}
		title="Redo (Ctrl+Shift+Z)"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
		</svg>
	</button>

	<div class="mx-2 h-5 w-px bg-border"></div>

	<!-- Tool selector -->
	<div class="flex gap-0.5 rounded-lg border border-border p-0.5">
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-medium transition-colors
				{editor.activeTool === 'select' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'}"
			onclick={() => editor.setTool('select')}
			title="Select tool (V)"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
			</svg>
		</button>
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-medium transition-colors
				{editor.activeTool === 'text' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'}"
			onclick={() => editor.setTool('text')}
			title="Text tool (T)"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
			</svg>
		</button>
		<button
			type="button"
			class="rounded px-2 py-1 text-xs font-medium transition-colors
				{editor.activeTool === 'draw' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'}"
			onclick={() => editor.setTool('draw')}
			title="Draw tool (D)"
		>
			<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
			</svg>
		</button>
	</div>

	<div class="mx-2 h-5 w-px bg-border"></div>

	<!-- Rotate -->
	<button
		type="button"
		class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
		disabled={!editor.hasSelection || editor.loading}
		onclick={() => editor.rotateSelected(90)}
		title="Rotate clockwise (R)"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9a9 9 0 019-5M20 15a9 9 0 01-9 5" />
		</svg>
	</button>
	<button
		type="button"
		class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30 disabled:cursor-not-allowed"
		disabled={!editor.hasSelection || editor.loading}
		onclick={() => editor.rotateSelected(-90)}
		title="Rotate counter-clockwise (Shift+R)"
	>
		<svg class="h-4 w-4 -scale-x-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h5M20 20v-5h-5" />
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 9a9 9 0 019-5M20 15a9 9 0 01-9 5" />
		</svg>
	</button>

	<!-- Delete -->
	<button
		type="button"
		class="rounded p-1.5 text-text-muted transition-colors hover:bg-error/10 hover:text-error disabled:opacity-30 disabled:cursor-not-allowed"
		disabled={!editor.hasSelection || editor.loading}
		onclick={() => editor.deleteSelected()}
		title="Delete selected pages (Delete)"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	</button>

	<div class="flex-1"></div>

	<!-- Zoom -->
	<div class="flex items-center gap-1">
		<button
			type="button"
			class="rounded p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30"
			disabled={editor.zoom <= 0.25}
			onclick={() => editor.setZoom(editor.zoom - 0.25)}
			title="Zoom out (-)"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>
		<select
			class="rounded border border-border bg-surface px-2 py-1 text-xs tabular-nums text-text"
			value={editor.zoom}
			onchange={handleZoomChange}
		>
			{#each ZOOM_PRESETS as preset}
				<option value={preset}>{Math.round(preset * 100)}%</option>
			{/each}
		</select>
		<button
			type="button"
			class="rounded p-1 text-text-muted transition-colors hover:bg-surface-alt hover:text-text disabled:opacity-30"
			disabled={editor.zoom >= 4.0}
			onclick={() => editor.setZoom(editor.zoom + 0.25)}
			title="Zoom in (+)"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	<div class="mx-2 h-5 w-px bg-border"></div>

	<!-- Page count -->
	<span class="text-xs tabular-nums text-text-muted">
		{editor.pageCount} {editor.pageCount === 1 ? 'page' : 'pages'}
	</span>

	<!-- Download -->
	<button
		type="button"
		class="ml-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed"
		disabled={!editor.hasDoc || editor.loading}
		onclick={() => editor.exportPdf()}
	>
		Download
	</button>
</div>
