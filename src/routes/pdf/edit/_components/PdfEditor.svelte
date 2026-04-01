<script lang="ts">
	import { createEditorState } from '$pdf/editor-state.svelte';
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import Toolbar from './Toolbar.svelte';
	import ThumbnailSidebar from './ThumbnailSidebar.svelte';
	import MainCanvas from './MainCanvas.svelte';
	import PropertiesPanel from './PropertiesPanel.svelte';

	const editor = createEditorState();

	let mainCanvas: MainCanvas | undefined = $state();
	let dropFiles = $state<File[]>([]);

	$effect(() => {
		if (dropFiles.length > 0) {
			const file = dropFiles[0];
			if (file) editor.loadFile(file);
			dropFiles = [];
		}
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!editor.hasDoc) return;

		const isCmd = e.metaKey || e.ctrlKey;

		if (isCmd && e.key === 'z' && !e.shiftKey) {
			e.preventDefault();
			editor.undo();
			return;
		}
		if (isCmd && e.key === 'z' && e.shiftKey) {
			e.preventDefault();
			editor.redo();
			return;
		}
		if (isCmd && e.key === 'a') {
			e.preventDefault();
			editor.selectAll();
			return;
		}
		if (isCmd && e.key === 's') {
			e.preventDefault();
			editor.exportPdf();
			return;
		}
		if (e.key === 'Delete' || e.key === 'Backspace') {
			if (editor.hasSelection && !isInputFocused()) {
				e.preventDefault();
				editor.deleteSelected();
			}
			return;
		}
		if (e.key === 'r' || e.key === 'R') {
			if (!isInputFocused() && editor.hasSelection) {
				e.preventDefault();
				editor.rotateSelected(e.shiftKey ? -90 : 90);
			}
			return;
		}
		if ((e.key === '=' || e.key === '+') && !isCmd) {
			e.preventDefault();
			editor.setZoom(editor.zoom + 0.25);
			return;
		}
		if (e.key === '-' && !isCmd) {
			e.preventDefault();
			editor.setZoom(editor.zoom - 0.25);
			return;
		}
		// Tool switching
		if (e.key === 'v' && !isInputFocused()) {
			editor.setTool('select');
			return;
		}
		if (e.key === 't' && !isInputFocused()) {
			editor.setTool('text');
			return;
		}
		if (e.key === 'd' && !isInputFocused()) {
			editor.setTool('draw');
			return;
		}
		if (e.key === 'Escape') {
			editor.setTool('select');
			editor.clearSelection();
		}
	}

	function isInputFocused(): boolean {
		const el = document.activeElement;
		if (!el) return false;
		return (
			el.tagName === 'INPUT' ||
			el.tagName === 'TEXTAREA' ||
			el.tagName === 'SELECT' ||
			(el as HTMLElement).isContentEditable
		);
	}

	function handleScrollToPage(index: number) {
		mainCanvas?.scrollToPage(index);
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex h-[calc(100vh-64px)] flex-col">
	{#if editor.hasDoc}
		<Toolbar {editor} />

		{#if editor.error}
			<div class="border-b border-error/20 bg-error/5 px-4 py-2 text-sm text-error">
				{editor.error}
			</div>
		{/if}

		<div class="flex flex-1 overflow-hidden">
			<div class="hidden md:block">
				<ThumbnailSidebar {editor} onscrolltopage={handleScrollToPage} />
			</div>

			<MainCanvas bind:this={mainCanvas} {editor} />

			<!-- Properties panel (hidden on small screens) -->
			<div class="hidden lg:block">
				<PropertiesPanel {editor} />
			</div>
		</div>

		{#if editor.loading}
			<div class="absolute inset-0 z-50 flex items-center justify-center bg-surface/60 backdrop-blur-sm">
				<div class="flex items-center gap-3 rounded-xl bg-surface px-6 py-4 shadow-lg">
					<div class="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
					<span class="text-sm text-text-muted">Processing...</span>
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex flex-1 flex-col items-center justify-center gap-6 p-8">
			<div class="text-center">
				<h1 class="font-display text-3xl font-800 tracking-tight sm:text-4xl">
					PDF Editor
				</h1>
				<p class="mt-2 text-text-muted">
					Drop a PDF to start editing. Reorder, rotate, delete pages — all in your browser.
				</p>
			</div>

			<div class="w-full max-w-lg">
				<FileDropZone accept=".pdf" bind:files={dropFiles} label="Drop a PDF here or click to browse" />
			</div>

			{#if editor.error}
				<p class="rounded-lg bg-error/10 px-4 py-2 text-sm text-error">{editor.error}</p>
			{/if}

			{#if editor.loading}
				<div class="flex items-center gap-3">
					<div class="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent"></div>
					<span class="text-sm text-text-muted">Loading PDF...</span>
				</div>
			{/if}

			<p class="text-center text-xs text-text-muted">
				Files never leave your device. 100% client-side processing.
			</p>
		</div>
	{/if}
</div>
