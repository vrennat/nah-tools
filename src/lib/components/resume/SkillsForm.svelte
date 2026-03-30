<script lang="ts">
	import type { SkillCategory } from '$resume/types';
	import { createId } from '$resume/types';

	let { skills = $bindable<SkillCategory[]>([]) }: { skills: SkillCategory[] } = $props();

	function addCategory() {
		skills = [...skills, { id: createId(), name: '', skills: [] }];
	}

	function removeCategory(index: number) {
		skills = skills.filter((_, i) => i !== index);
	}

	function handleSkillsInput(index: number, value: string) {
		skills[index].skills = value
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
	}

	function getSkillsString(index: number): string {
		return skills[index].skills.join(', ');
	}
</script>

<div class="space-y-4">
	{#if skills.length === 0}
		<p class="py-6 text-center text-sm text-text-muted">
			No skill categories added yet. Click below to add one.
		</p>
	{/if}

	{#each skills as category, index (category.id)}
		<div class="rounded-xl border border-border bg-surface p-5 shadow-sm">
			<div class="flex items-start gap-4">
				<div class="flex-1 space-y-3">
					<div>
						<label for="skill-cat-{category.id}" class="block text-sm font-medium text-text"
							>Category</label
						>
						<input
							id="skill-cat-{category.id}"
							type="text"
							bind:value={skills[index].name}
							placeholder="Programming Languages"
							class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
					</div>
					<div>
						<label for="skill-list-{category.id}" class="block text-sm font-medium text-text"
							>Skills</label
						>
						<input
							id="skill-list-{category.id}"
							type="text"
							value={getSkillsString(index)}
							oninput={(e) => handleSkillsInput(index, e.currentTarget.value)}
							placeholder="JavaScript, TypeScript, Python, Go"
							class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						/>
						<p class="mt-1 text-xs text-text-muted">Separate skills with commas</p>
					</div>
					{#if skills[index].skills.length > 0}
						<div class="flex flex-wrap gap-1.5">
							{#each skills[index].skills as skill}
								<span
									class="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent"
								>
									{skill}
								</span>
							{/each}
						</div>
					{/if}
				</div>
				<button
					type="button"
					onclick={() => removeCategory(index)}
					class="shrink-0 rounded-lg border border-border bg-surface px-2 py-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
					aria-label="Remove skill category"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/each}

	<button
		type="button"
		onclick={addCategory}
		class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
	>
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
		</svg>
		Add Skill Category
	</button>
</div>
