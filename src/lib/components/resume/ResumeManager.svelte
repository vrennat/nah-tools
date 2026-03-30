<script lang="ts">
	import type { ResumeData, ResumeMetadata } from '$resume/types';
	import { createEmptyResume } from '$resume/types';
	import {
		listResumes,
		listTailoredResumes,
		getResume,
		saveResume,
		saveTailoredResume,
		deleteResume
	} from '$resume/storage';

	interface Props {
		currentResume: ResumeData;
		onselect: (resume: ResumeData) => void;
	}

	let { currentResume = $bindable(), onselect }: Props = $props();

	interface ResumeGroup {
		master: ResumeMetadata;
		tailored: ResumeMetadata[];
	}

	let groups = $state<ResumeGroup[]>([]);
	let allMetadata = $state<ResumeMetadata[]>([]);
	let editingId = $state<string | null>(null);
	let editingName = $state('');
	let confirmDeleteId = $state<string | null>(null);

	async function loadResumes() {
		const masters = await listResumes();
		const result: ResumeGroup[] = [];
		const flat: ResumeMetadata[] = [];

		for (const master of masters) {
			const tailored = await listTailoredResumes(master.id);
			result.push({ master, tailored });
			flat.push(master, ...tailored);
		}

		groups = result;
		allMetadata = flat;
	}

	$effect(() => {
		loadResumes();
	});

	// Auto-select most recent resume if none selected
	$effect(() => {
		if (!currentResume && allMetadata.length > 0) {
			const sorted = [...allMetadata].sort(
				(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
			);
			selectResume(sorted[0].id);
		}
	});

	async function selectResume(id: string) {
		const data = await getResume(id);
		if (data) {
			onselect(data);
		}
	}

	async function createNew() {
		const resume = createEmptyResume();
		await saveResume(resume);
		await loadResumes();
		onselect(resume);
	}

	async function createVariant() {
		if (!currentResume) return;
		const variant = {
			...createEmptyResume(),
			name: `${currentResume.name} (Tailored)`,
			template: currentResume.template,
			personal: { ...currentResume.personal },
			summary: currentResume.summary,
			experience: structuredClone(currentResume.experience),
			education: structuredClone(currentResume.education),
			skills: structuredClone(currentResume.skills),
			projects: structuredClone(currentResume.projects),
			certifications: structuredClone(currentResume.certifications),
			customSections: structuredClone(currentResume.customSections)
		};
		const saved = await saveTailoredResume(variant, currentResume.masterResumeId ?? currentResume.id);
		await loadResumes();
		onselect(saved);
	}

	async function handleDelete(id: string) {
		await deleteResume(id);
		confirmDeleteId = null;
		await loadResumes();
		if (currentResume?.id === id) {
			if (allMetadata.length > 0) {
				const next = allMetadata.find((m) => m.id !== id);
				if (next) {
					await selectResume(next.id);
				} else {
					await createNew();
				}
			} else {
				await createNew();
			}
		}
	}

	async function startRename(meta: ResumeMetadata) {
		editingId = meta.id;
		editingName = meta.name;
	}

	async function finishRename() {
		if (!editingId || !editingName.trim()) {
			editingId = null;
			return;
		}
		const data = await getResume(editingId);
		if (data) {
			data.name = editingName.trim();
			data.updatedAt = new Date().toISOString();
			await saveResume(data);
			if (currentResume?.id === editingId) {
				onselect(data);
			}
		}
		editingId = null;
		await loadResumes();
	}

	function formatTime(iso: string): string {
		const d = new Date(iso);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 1) return 'just now';
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return d.toLocaleDateString();
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
		<select
			aria-label="Select resume"
			class="min-w-[200px] rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
			onchange={(e) => {
				const target = e.target as HTMLSelectElement;
				if (target.value) selectResume(target.value);
			}}
		>
			{#if allMetadata.length === 0}
				<option value="">No resumes yet</option>
			{/if}
			{#each groups as group}
				<option
					value={group.master.id}
					selected={currentResume?.id === group.master.id}
				>
					{group.master.name}
				</option>
				{#each group.tailored as variant}
					<option
						value={variant.id}
						selected={currentResume?.id === variant.id}
					>
						&nbsp;&nbsp;&nbsp;&nbsp;{variant.name}
					</option>
				{/each}
			{/each}
		</select>

		<button
			onclick={createNew}
			class="rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
		>
			New Resume
		</button>

		{#if currentResume}
			<button
				onclick={createVariant}
				class="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-text transition-colors hover:border-accent"
			>
				Create Variant
			</button>
		{/if}
	</div>

	{#if currentResume}
		<div class="flex flex-wrap items-center gap-3 text-sm">
			{#if editingId === currentResume.id}
				<input
					type="text"
					bind:value={editingName}
					onblur={finishRename}
					onkeydown={(e) => {
						if (e.key === 'Enter') finishRename();
						if (e.key === 'Escape') { editingId = null; }
					}}
					class="rounded border border-accent bg-surface px-2 py-1 text-sm text-text focus:outline-none"
				/>
			{:else}
				<button
					onclick={() => startRename({ id: currentResume.id, name: currentResume.name, template: currentResume.template, updatedAt: currentResume.updatedAt, masterResumeId: currentResume.masterResumeId })}
					class="text-text hover:text-accent transition-colors"
					title="Rename"
				>
					{currentResume.name}
				</button>
			{/if}

			<span class="rounded bg-surface-alt px-2 py-0.5 text-xs text-text-muted">
				{currentResume.template}
			</span>

			<span class="text-xs text-text-muted">
				Updated {formatTime(currentResume.updatedAt)}
			</span>

			{#if currentResume.masterResumeId}
				<span class="rounded bg-accent/10 px-2 py-0.5 text-xs text-accent">
					tailored
				</span>
			{/if}

			{#if confirmDeleteId === currentResume.id}
				<span class="text-xs text-error">Delete?</span>
				<button
					onclick={() => handleDelete(currentResume.id)}
					class="text-xs font-medium text-error hover:underline"
				>
					Yes
				</button>
				<button
					onclick={() => { confirmDeleteId = null; }}
					class="text-xs text-text-muted hover:underline"
				>
					Cancel
				</button>
			{:else}
				<button
					onclick={() => { confirmDeleteId = currentResume.id; }}
					class="text-xs text-text-muted transition-colors hover:text-error"
					title="Delete resume"
				>
					Delete
				</button>
			{/if}
		</div>
	{/if}
</div>
