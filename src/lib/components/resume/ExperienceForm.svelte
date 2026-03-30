<script lang="ts">
	import type { ExperienceEntry } from '$resume/types';
	import { createId } from '$resume/types';
	import SectionList from './SectionList.svelte';

	let { experience = $bindable<ExperienceEntry[]>([]) }: { experience: ExperienceEntry[] } =
		$props();

	function createEntry(): ExperienceEntry {
		return {
			id: createId(),
			company: '',
			title: '',
			location: '',
			startDate: '',
			endDate: '',
			bullets: ['']
		};
	}

	function addBullet(index: number) {
		experience[index].bullets = [...experience[index].bullets, ''];
	}

	function removeBullet(entryIndex: number, bulletIndex: number) {
		experience[entryIndex].bullets = experience[entryIndex].bullets.filter(
			(_, i) => i !== bulletIndex
		);
	}

	function togglePresent(index: number) {
		experience[index].endDate = experience[index].endDate === 'present' ? '' : 'present';
	}
</script>

<SectionList
	bind:items={experience}
	onAdd={createEntry}
	label="Experience"
	addLabel="Add Experience"
>
	{#snippet renderItem(item: ExperienceEntry, index: number)}
		<div class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="exp-company-{item.id}" class="block text-sm font-medium text-text"
						>Company</label
					>
					<input
						id="exp-company-{item.id}"
						type="text"
						bind:value={experience[index].company}
						placeholder="Acme Corp"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="exp-title-{item.id}" class="block text-sm font-medium text-text">Title</label
					>
					<input
						id="exp-title-{item.id}"
						type="text"
						bind:value={experience[index].title}
						placeholder="Software Engineer"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="exp-location-{item.id}" class="block text-sm font-medium text-text"
						>Location</label
					>
					<input
						id="exp-location-{item.id}"
						type="text"
						bind:value={experience[index].location}
						placeholder="San Francisco, CA"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				<div>
					<label for="exp-start-{item.id}" class="block text-sm font-medium text-text"
						>Start Date</label
					>
					<input
						id="exp-start-{item.id}"
						type="month"
						bind:value={experience[index].startDate}
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="exp-end-{item.id}" class="block text-sm font-medium text-text"
						>End Date</label
					>
					<input
						id="exp-end-{item.id}"
						type="month"
						bind:value={experience[index].endDate}
						disabled={experience[index].endDate === 'present'}
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-40"
					/>
				</div>
				<div class="flex items-end pb-2">
					<label class="flex items-center gap-2 text-sm text-text-muted">
						<input
							type="checkbox"
							checked={experience[index].endDate === 'present'}
							onchange={() => togglePresent(index)}
							class="h-4 w-4 rounded border-border text-accent focus:ring-accent"
						/>
						Present
					</label>
				</div>
			</div>

			<div class="space-y-2">
				<span class="block text-sm font-medium text-text">Bullet Points</span>
				{#each experience[index].bullets as _, bulletIndex}
					<div class="flex gap-2">
						<textarea
							bind:value={experience[index].bullets[bulletIndex]}
							rows={2}
							placeholder="Describe an accomplishment or responsibility..."
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
