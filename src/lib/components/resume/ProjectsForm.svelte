<script lang="ts">
	import type { ProjectEntry } from '$resume/types';
	import { createId } from '$resume/types';
	import SectionList from './SectionList.svelte';

	let { projects = $bindable<ProjectEntry[]>([]) }: { projects: ProjectEntry[] } = $props();

	function createEntry(): ProjectEntry {
		return {
			id: createId(),
			name: '',
			url: '',
			description: '',
			bullets: ['']
		};
	}

	function addBullet(index: number) {
		projects[index].bullets = [...projects[index].bullets, ''];
	}

	function removeBullet(entryIndex: number, bulletIndex: number) {
		projects[entryIndex].bullets = projects[entryIndex].bullets.filter(
			(_, i) => i !== bulletIndex
		);
	}
</script>

<SectionList bind:items={projects} onAdd={createEntry} label="Project" addLabel="Add Project">
	{#snippet renderItem(item: ProjectEntry, index: number)}
		<div class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="proj-name-{item.id}" class="block text-sm font-medium text-text"
						>Project Name</label
					>
					<input
						id="proj-name-{item.id}"
						type="text"
						bind:value={projects[index].name}
						placeholder="My Open Source Project"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="proj-url-{item.id}" class="block text-sm font-medium text-text">URL</label>
					<input
						id="proj-url-{item.id}"
						type="url"
						bind:value={projects[index].url}
						placeholder="https://github.com/user/project"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>

			<div>
				<label for="proj-desc-{item.id}" class="block text-sm font-medium text-text"
					>Description</label
				>
				<input
					id="proj-desc-{item.id}"
					type="text"
					bind:value={projects[index].description}
					placeholder="A brief description of the project and technologies used"
					class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
				/>
			</div>

			<div class="space-y-2">
				<span class="block text-sm font-medium text-text">Bullet Points</span>
				{#each projects[index].bullets as _, bulletIndex}
					<div class="flex gap-2">
						<textarea
							bind:value={projects[index].bullets[bulletIndex]}
							rows={2}
							placeholder="Describe a key feature or achievement..."
							class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
							aria-label="Bullet point {bulletIndex + 1}"
						></textarea>
						<button
							type="button"
							onclick={() => removeBullet(index, bulletIndex)}
							class="shrink-0 self-start rounded-lg border border-border bg-surface px-2 py-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
							aria-label="Remove bullet point"
						>
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				{/each}
				<button
					type="button"
					onclick={() => addBullet(index)}
					class="text-sm text-accent transition-colors hover:text-accent-hover"
				>
					+ Add bullet point
				</button>
			</div>
		</div>
	{/snippet}
</SectionList>
