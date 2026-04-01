<script lang="ts">
	import { createEditorState } from '$pdf/editor-state.svelte';
	import { consumePendingFile } from '$pdf/file-transfer';
	import FileDropZone from '$components/pdf/FileDropZone.svelte';
	import Toolbar from './Toolbar.svelte';
	import ThumbnailSidebar from './ThumbnailSidebar.svelte';
	import MainCanvas from './MainCanvas.svelte';
	import PropertiesPanel from './PropertiesPanel.svelte';
	import { onMount } from 'svelte';

	const editor = createEditorState();

	// Check for file passed from another route (e.g. /pdf/merge -> "Open in editor")
	onMount(() => {
		const pending = consumePendingFile();
		if (pending) {
			const file = new File([pending.bytes as BlobPart], pending.name, { type: 'application/pdf' });
			editor.loadFile(file);
		}
	});

	let mainCanvas: MainCanvas | undefined = $state();
	let dropFiles = $state<File[]>([]);
	let sidebarOpen = $state(false);
	let propsOpen = $state(false);

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

		{#if editor.isLargeFile}
			<div class="border-b border-warning/20 bg-warning/5 px-4 py-2 text-sm text-warning">
				Large file detected ({(editor.fileSize / 1024 / 1024).toFixed(0)} MB). Some operations may be slower.
			</div>
		{/if}

		{#if editor.error}
			<div class="border-b border-error/20 bg-error/5 px-4 py-2 text-sm text-error">
				{editor.error}
			</div>
		{/if}

		<div class="relative flex flex-1 overflow-hidden">
			<!-- Sidebar: always visible on md+, toggleable drawer on mobile -->
			<div class="hidden md:block">
				<ThumbnailSidebar {editor} onscrolltopage={handleScrollToPage} />
			</div>
			{#if sidebarOpen}
				<!-- Mobile sidebar overlay -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="absolute inset-0 z-30 md:hidden" onclick={() => (sidebarOpen = false)}>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="absolute inset-y-0 left-0 z-40 shadow-xl" onclick={(e) => e.stopPropagation()}>
						<ThumbnailSidebar {editor} onscrolltopage={(i) => { handleScrollToPage(i); sidebarOpen = false; }} />
					</div>
					<div class="absolute inset-0 bg-brand/40 backdrop-blur-sm"></div>
				</div>
			{/if}

			<!-- Mobile toggle buttons -->
			<div class="absolute left-2 top-2 z-20 flex gap-1 md:hidden">
				<button
					type="button"
					class="rounded-lg bg-surface/90 p-1.5 text-text-muted shadow-md backdrop-blur hover:text-text"
					onclick={() => (sidebarOpen = !sidebarOpen)}
					title="Toggle pages"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
					</svg>
				</button>
				<button
					type="button"
					class="rounded-lg bg-surface/90 p-1.5 text-text-muted shadow-md backdrop-blur hover:text-text lg:hidden"
					onclick={() => (propsOpen = !propsOpen)}
					title="Toggle properties"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
					</svg>
				</button>
			</div>

			<MainCanvas bind:this={mainCanvas} {editor} />

			<!-- Properties panel: always visible on lg+, toggleable on smaller -->
			<div class="hidden lg:block">
				<PropertiesPanel {editor} />
			</div>
			{#if propsOpen}
				<!-- Mobile/tablet properties overlay -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="absolute inset-0 z-30 lg:hidden" onclick={() => (propsOpen = false)}>
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<div class="absolute inset-y-0 right-0 z-40 shadow-xl" onclick={(e) => e.stopPropagation()}>
						<PropertiesPanel {editor} />
					</div>
					<div class="absolute inset-0 bg-brand/40 backdrop-blur-sm"></div>
				</div>
			{/if}
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
