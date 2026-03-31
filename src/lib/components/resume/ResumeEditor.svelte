<script lang="ts">
	import type {
		ResumeData,
		CertificationEntry,
		CustomSection,
		CustomSectionEntry
	} from '$resume/types';
	import { createId } from '$resume/types';
	import PersonalInfoForm from './PersonalInfoForm.svelte';
	import SummaryForm from './SummaryForm.svelte';
	import ExperienceForm from './ExperienceForm.svelte';
	import EducationForm from './EducationForm.svelte';
	import SkillsForm from './SkillsForm.svelte';
	import ProjectsForm from './ProjectsForm.svelte';

	let { resume = $bindable<ResumeData>() }: { resume: ResumeData } = $props();

	// Track which sections are expanded
	let expanded = $state<Record<string, boolean>>({
		personal: true,
		summary: false,
		experience: false,
		education: false,
		skills: false,
		projects: false,
		certifications: false,
		custom: false
	});

	function toggle(section: string) {
		expanded[section] = !expanded[section];
	}

	// Certification helpers
	function addCertification() {
		resume.certifications = [
			...resume.certifications,
			{ id: createId(), name: '', issuer: '', date: '', url: '' }
		];
	}

	function removeCertification(index: number) {
		resume.certifications = resume.certifications.filter((_, i) => i !== index);
	}

	// Custom section helpers
	function addCustomSection() {
		resume.customSections = [
			...resume.customSections,
			{ id: createId(), title: '', entries: [] }
		];
	}

	function removeCustomSection(index: number) {
		resume.customSections = resume.customSections.filter((_, i) => i !== index);
	}

	function addCustomEntry(sectionIndex: number) {
		resume.customSections[sectionIndex].entries = [
			...resume.customSections[sectionIndex].entries,
			{ id: createId(), primary: '', secondary: '', bullets: [''] }
		];
	}

	function removeCustomEntry(sectionIndex: number, entryIndex: number) {
		resume.customSections[sectionIndex].entries = resume.customSections[
			sectionIndex
		].entries.filter((_, i) => i !== entryIndex);
	}

	function addCustomBullet(sectionIndex: number, entryIndex: number) {
		resume.customSections[sectionIndex].entries[entryIndex].bullets = [
			...resume.customSections[sectionIndex].entries[entryIndex].bullets,
			''
		];
	}

	function removeCustomBullet(sectionIndex: number, entryIndex: number, bulletIndex: number) {
		resume.customSections[sectionIndex].entries[entryIndex].bullets = resume.customSections[
			sectionIndex
		].entries[entryIndex].bullets.filter((_, i) => i !== bulletIndex);
	}

	// Section config for accordion
	interface SectionConfig {
		key: string;
		label: string;
		count?: number;
	}

	let sections = $derived<SectionConfig[]>([
		{ key: 'personal', label: 'Personal Info' },
		{ key: 'summary', label: 'Summary' },
		{ key: 'experience', label: 'Experience', count: resume.experience.length },
		{ key: 'education', label: 'Education', count: resume.education.length },
		{ key: 'skills', label: 'Skills', count: resume.skills.length },
		{ key: 'projects', label: 'Projects', count: resume.projects.length },
		{ key: 'certifications', label: 'Certifications', count: resume.certifications.length },
		{ key: 'custom', label: 'Custom Sections', count: resume.customSections.length }
	]);
</script>

<div class="space-y-3">
	{#each sections as section (section.key)}
		<div class="rounded-xl border border-border bg-surface shadow-sm">
			<button
				type="button"
				onclick={() => toggle(section.key)}
				class="flex w-full items-center justify-between px-6 py-4 text-left"
				aria-expanded={expanded[section.key]}
			>
				<div class="flex items-center gap-3">
					<span class="text-sm font-semibold text-text">{section.label}</span>
					{#if section.count !== undefined}
						<span
							class="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent/10 px-1.5 text-xs font-medium text-accent"
						>
							{section.count}
						</span>
					{/if}
				</div>
				<svg
					class="h-5 w-5 text-text-muted transition-transform duration-200"
					class:rotate-180={expanded[section.key]}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if expanded[section.key]}
				<div class="border-t border-border px-6 py-5">
					{#if section.key === 'personal'}
						<PersonalInfoForm bind:personal={resume.personal} />
					{:else if section.key === 'summary'}
						<SummaryForm bind:summary={resume.summary} />
					{:else if section.key === 'experience'}
						<ExperienceForm bind:experience={resume.experience} />
					{:else if section.key === 'education'}
						<EducationForm bind:education={resume.education} />
					{:else if section.key === 'skills'}
						<SkillsForm bind:skills={resume.skills} />
					{:else if section.key === 'projects'}
						<ProjectsForm bind:projects={resume.projects} />
					{:else if section.key === 'certifications'}
						<!-- Inline certifications form -->
						<div class="space-y-4">
							{#if resume.certifications.length === 0}
								<p class="py-6 text-center text-sm text-text-muted">
									No certifications added yet. Click below to add one.
								</p>
							{/if}

							{#each resume.certifications as cert, index (cert.id)}
								<div class="rounded-xl border border-border bg-surface p-5 shadow-sm">
									<div class="mb-3 flex justify-end">
										<button
											type="button"
											onclick={() => removeCertification(index)}
											class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-error transition-colors hover:bg-error/10"
											aria-label="Remove certification"
										>
											<svg
												class="h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
									<div class="grid gap-4 sm:grid-cols-2">
										<div>
											<label
												for="cert-name-{cert.id}"
												class="block text-sm font-medium text-text">Name</label
											>
											<input
												id="cert-name-{cert.id}"
												type="text"
												bind:value={resume.certifications[index].name}
												placeholder="AWS Solutions Architect"
												class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
											/>
										</div>
										<div>
											<label
												for="cert-issuer-{cert.id}"
												class="block text-sm font-medium text-text">Issuer</label
											>
											<input
												id="cert-issuer-{cert.id}"
												type="text"
												bind:value={resume.certifications[index].issuer}
												placeholder="Amazon Web Services"
												class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
											/>
										</div>
										<div>
											<label
												for="cert-date-{cert.id}"
												class="block text-sm font-medium text-text">Date</label
											>
											<input
												id="cert-date-{cert.id}"
												type="month"
												bind:value={resume.certifications[index].date}
												class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
											/>
										</div>
										<div>
											<label
												for="cert-url-{cert.id}"
												class="block text-sm font-medium text-text"
												>Credential URL</label
											>
											<input
												id="cert-url-{cert.id}"
												type="url"
												bind:value={resume.certifications[index].url}
												placeholder="https://credential.example.com/verify/..."
												class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
											/>
										</div>
									</div>
								</div>
							{/each}

							<button
								type="button"
								onclick={addCertification}
								class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
							>
								<svg
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add Certification
							</button>
						</div>
					{:else if section.key === 'custom'}
						<!-- Custom sections -->
						<div class="space-y-6">
							{#if resume.customSections.length === 0}
								<p class="py-6 text-center text-sm text-text-muted">
									No custom sections added yet. Use these for awards, publications, volunteer work,
									etc.
								</p>
							{/if}

							{#each resume.customSections as customSection, sectionIndex (customSection.id)}
								<div class="space-y-4 rounded-xl border border-border bg-surface-alt p-5">
									<div class="flex items-start gap-3">
										<div class="flex-1">
											<label
												for="custom-title-{customSection.id}"
												class="block text-sm font-medium text-text">Section Title</label
											>
											<input
												id="custom-title-{customSection.id}"
												type="text"
												bind:value={resume.customSections[sectionIndex].title}
												placeholder="Awards, Publications, Volunteer Work..."
												class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
											/>
										</div>
										<button
											type="button"
											onclick={() => removeCustomSection(sectionIndex)}
											class="shrink-0 rounded-lg border border-border bg-surface px-2 py-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
											aria-label="Remove custom section"
										>
											<svg
												class="h-4 w-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>

									{#each resume.customSections[sectionIndex].entries as entry, entryIndex (entry.id)}
										<div class="rounded-lg border border-border bg-surface p-4">
											<div class="mb-3 flex justify-end">
												<button
													type="button"
													onclick={() => removeCustomEntry(sectionIndex, entryIndex)}
													class="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-error transition-colors hover:bg-error/10"
													aria-label="Remove entry"
												>
													<svg
														class="h-4 w-4"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M6 18L18 6M6 6l12 12"
														/>
													</svg>
												</button>
											</div>
											<div class="grid gap-4 sm:grid-cols-2">
												<div>
													<label
														for="custom-primary-{entry.id}"
														class="block text-sm font-medium text-text">Primary</label
													>
													<input
														id="custom-primary-{entry.id}"
														type="text"
														bind:value={resume.customSections[sectionIndex].entries[
															entryIndex
														].primary}
														placeholder="Award name, publication title..."
														class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
													/>
												</div>
												<div>
													<label
														for="custom-secondary-{entry.id}"
														class="block text-sm font-medium text-text">Secondary</label
													>
													<input
														id="custom-secondary-{entry.id}"
														type="text"
														bind:value={resume.customSections[sectionIndex].entries[
															entryIndex
														].secondary}
														placeholder="Organization, date, details..."
														class="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
													/>
												</div>
											</div>

											<div class="mt-3 space-y-2">
												<span class="block text-sm font-medium text-text"
													>Bullet Points</span
												>
												{#each resume.customSections[sectionIndex].entries[entryIndex].bullets as _, bulletIndex}
													<div class="flex gap-2">
														<textarea
															bind:value={resume.customSections[sectionIndex].entries[
																entryIndex
															].bullets[bulletIndex]}
															rows={2}
															placeholder="Additional detail..."
															class="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
															aria-label="Bullet point {bulletIndex + 1}"
														></textarea>
														<button
															type="button"
															onclick={() =>
																removeCustomBullet(sectionIndex, entryIndex, bulletIndex)}
															class="shrink-0 self-start rounded-lg border border-border bg-surface px-2 py-2 text-text-muted transition-colors hover:bg-error/10 hover:text-error"
															aria-label="Remove bullet point"
														>
															<svg
																class="h-4 w-4"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
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
													onclick={() => addCustomBullet(sectionIndex, entryIndex)}
													class="text-sm text-accent transition-colors hover:text-accent-hover"
												>
													+ Add bullet point
												</button>
											</div>
										</div>
									{/each}

									<button
										type="button"
										onclick={() => addCustomEntry(sectionIndex)}
										class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
									>
										<svg
											class="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M12 4v16m8-8H4"
											/>
										</svg>
										Add Entry
									</button>
								</div>
							{/each}

							<button
								type="button"
								onclick={addCustomSection}
								class="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-text-muted transition-colors hover:border-accent hover:text-accent"
							>
								<svg
									class="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 4v16m8-8H4"
									/>
								</svg>
								Add Custom Section
							</button>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/each}
</div>
