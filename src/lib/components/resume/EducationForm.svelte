<script lang="ts">
	import type { EducationEntry } from '$resume/types';
	import { createId } from '$resume/types';
	import SectionList from './SectionList.svelte';

	let { education = $bindable<EducationEntry[]>([]) }: { education: EducationEntry[] } = $props();

	function createEntry(): EducationEntry {
		return {
			id: createId(),
			institution: '',
			degree: '',
			field: '',
			startDate: '',
			endDate: '',
			gpa: '',
			honors: ''
		};
	}
</script>

<SectionList bind:items={education} onAdd={createEntry} label="Education" addLabel="Add Education">
	{#snippet renderItem(item: EducationEntry, index: number)}
		<div class="space-y-4">
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="edu-institution-{item.id}" class="block text-sm font-medium text-text"
						>Institution</label
					>
					<input
						id="edu-institution-{item.id}"
						type="text"
						bind:value={education[index].institution}
						placeholder="University of California, Berkeley"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="edu-degree-{item.id}" class="block text-sm font-medium text-text"
						>Degree</label
					>
					<input
						id="edu-degree-{item.id}"
						type="text"
						bind:value={education[index].degree}
						placeholder="Bachelor of Science"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="edu-field-{item.id}" class="block text-sm font-medium text-text"
						>Field of Study</label
					>
					<input
						id="edu-field-{item.id}"
						type="text"
						bind:value={education[index].field}
						placeholder="Computer Science"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<label for="edu-start-{item.id}" class="block text-sm font-medium text-text"
						>Start Date</label
					>
					<input
						id="edu-start-{item.id}"
						type="month"
						bind:value={education[index].startDate}
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="edu-end-{item.id}" class="block text-sm font-medium text-text"
						>End Date</label
					>
					<input
						id="edu-end-{item.id}"
						type="month"
						bind:value={education[index].endDate}
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="edu-gpa-{item.id}" class="block text-sm font-medium text-text">GPA</label>
					<input
						id="edu-gpa-{item.id}"
						type="text"
						bind:value={education[index].gpa}
						placeholder="3.8"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
				<div>
					<label for="edu-honors-{item.id}" class="block text-sm font-medium text-text"
						>Honors</label
					>
					<input
						id="edu-honors-{item.id}"
						type="text"
						bind:value={education[index].honors}
						placeholder="Magna Cum Laude"
						class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
					/>
				</div>
			</div>
		</div>
	{/snippet}
</SectionList>
