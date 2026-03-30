<script lang="ts">
	import type { ResumeData } from '$resume/types';
	import { createEmptyResume, createSampleResume } from '$resume/types';
	import { listResumes, getResume, saveResume } from '$resume/storage';
	import ResumeManager from '$components/resume/ResumeManager.svelte';
	import ResumeEditor from '$components/resume/ResumeEditor.svelte';
	import ResumePreview from '$components/resume/ResumePreview.svelte';
	import TemplatePicker from '$components/resume/TemplatePicker.svelte';
	import ExportBar from '$components/resume/ExportBar.svelte';
	import ATSPanel from '$components/resume/ATSPanel.svelte';
	import ImportDialog from '$components/resume/ImportDialog.svelte';

	let resume = $state<ResumeData>(createSampleResume());
	let activeTab = $state<'editor' | 'preview'>('editor');
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;
	let loaded = $state(false);
	let userHasEdited = $state(false);

	// Load most recent resume on mount, or keep sample as preview
	$effect(() => {
		if (loaded) return;
		loadInitial();
	});

	async function loadInitial() {
		const masters = await listResumes();
		if (masters.length > 0) {
			const sorted = [...masters].sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);
			const data = await getResume(sorted[0].id);
			if (data) {
				resume = data;
				userHasEdited = true; // Existing resume — auto-save normally
			}
			// else: no saved data, keep sample as read-only preview
		}
		loaded = true;
	}

	// Auto-save with debounce — only after user has started editing
	$effect(() => {
		if (!loaded || !userHasEdited) return;
		// Serialize resume to track content changes (this subscribes to all fields)
		const snapshot = JSON.stringify(resume);
		void snapshot;

		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			const data = JSON.parse(snapshot) as ResumeData;
			data.updatedAt = new Date().toISOString();
			saveResume(data);
		}, 1000);

		return () => clearTimeout(saveTimeout);
	});

	function handleSelect(selected: ResumeData) {
		userHasEdited = true;
		resume = selected;
	}

	function handleImport(data: Partial<ResumeData>) {
		userHasEdited = true;
		resume = { ...resume, ...data, updatedAt: new Date().toISOString() };
	}

	function handleEdit() {
		if (!userHasEdited) {
			userHasEdited = true;
		}
	}
</script>

<svelte:head>
	<title>Free Resume Builder — nah</title>
	<meta
		name="description"
		content="Build a professional resume for free. ATS-optimized templates, job description matching, PDF and DOCX export. No signup, no watermarks, no catch."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
	<!-- Header -->
	<section class="text-center">
		<h1 class="font-display text-4xl font-800 tracking-tight sm:text-5xl md:text-6xl">
			Resume <span class="text-accent">Builder</span>
		</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
			Build, tailor, and export — everything stays in your browser.
		</p>
	</section>

	<!-- Resume Manager + Import -->
	<div class="flex flex-wrap items-start justify-between gap-4">
		<ResumeManager bind:currentResume={resume} onselect={handleSelect} />
		<ImportDialog onimport={handleImport} />
	</div>

	<!-- Main content: Editor + Preview -->
	<!-- Mobile tab toggle -->
	<div class="flex gap-1 rounded-lg bg-surface-alt p-1 sm:hidden">
		<button
			onclick={() => { activeTab = 'editor'; }}
			class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
			class:bg-surface={activeTab === 'editor'}
			class:text-text={activeTab === 'editor'}
			class:shadow-sm={activeTab === 'editor'}
			class:text-text-muted={activeTab !== 'editor'}
		>
			Editor
		</button>
		<button
			onclick={() => { activeTab = 'preview'; }}
			class="flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
			class:bg-surface={activeTab === 'preview'}
			class:text-text={activeTab === 'preview'}
			class:shadow-sm={activeTab === 'preview'}
			class:text-text-muted={activeTab !== 'preview'}
		>
			Preview
		</button>
	</div>

	<!-- Split panel -->
	<div class="grid gap-6 sm:grid-cols-[45fr_55fr]">
		<div
			class:hidden={activeTab !== 'editor'}
			class:sm:block={activeTab !== 'editor'}
		>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<div class="space-y-6" oninput={handleEdit} onclick={handleEdit}>
				<ResumeEditor bind:resume />
			</div>
		</div>
		<div
			class:hidden={activeTab !== 'preview'}
			class:sm:block={activeTab !== 'preview'}
		>
			<div class="space-y-6">
				<ResumePreview {resume} />
				<TemplatePicker bind:selected={resume.template} />
				<ExportBar {resume} />
				<ATSPanel {resume} />
			</div>
		</div>
	</div>
</div>

